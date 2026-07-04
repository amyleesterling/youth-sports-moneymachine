/* Youth sports cost investigation — rendering. Data comes from js/data.js (window.DATA),
   generated from the canonical files in data/ by tools/gen-data.js. */
(function () {
  'use strict';

  var DATA = window.DATA;
  var CPI = DATA.cpi;
  var BASE_YEAR = String(CPI.base_year);
  var charts = [];          // [{chart, kind:'sport'|'combined', sport, canvas}]
  var sameScale = false;
  var highlightedSport = null;

  /* ---------- helpers ---------- */

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function theme() {
    return {
      surface: cssVar('--surface-1'),
      grid: cssVar('--grid'),
      baseline: cssVar('--baseline'),
      muted: cssVar('--text-muted'),
      secondary: cssVar('--text-secondary'),
      primary: cssVar('--text-primary'),
      real: cssVar('--series-real'),
      nominal: cssVar('--series-nominal'),
      realWash: cssVar('--series-real-wash'),
      highlight: cssVar('--highlight'),
      cpiAll: cssVar('--cpi-all'),
      cpiRec: cssVar('--cpi-rec'),
      deemph: cssVar('--deemph'),
      pe: cssVar('--pe-marker')
    };
  }

  function toReal(nominal, year) {
    return nominal * CPI.all_items[BASE_YEAR] / CPI.all_items[String(year)];
  }

  function fmt$(v) {
    return '$' + Math.round(v).toLocaleString('en-US');
  }

  function cagr(series, key) {
    if (series.length < 3) return null;
    var a = series[0], b = series[series.length - 1];
    var years = b.year - a.year;
    if (years <= 0) return null;
    return Math.pow(b[key] / a[key], 1 / years) - 1;
  }

  function pct(x, digits) {
    return (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(digits === undefined ? 1 : digits) + '%';
  }

  /* ---------- PE event marker plugin ---------- */
  /* Vertical hairline at each event year; event text lives in the card's notes
     (labels inside 320px cards would collide). */
  var peMarkerPlugin = {
    id: 'peMarkers',
    afterDatasetsDraw: function (chart, args, opts) {
      var events = (opts && opts.events) || [];
      if (!events.length) return;
      var t = theme();
      var x = chart.scales.x, area = chart.chartArea, ctx = chart.ctx;
      ctx.save();
      events.forEach(function (ev) {
        var px = x.getPixelForValue(ev.year);
        if (px < area.left - 1 || px > area.right + 1) return;
        ctx.strokeStyle = t.pe;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, area.top + 8);
        ctx.lineTo(px, area.bottom);
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = t.pe;
        ctx.beginPath();
        ctx.moveTo(px - 3.5, area.top);
        ctx.lineTo(px + 3.5, area.top);
        ctx.lineTo(px, area.top + 6);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    }
  };

  /* crosshair: vertical hairline snapped to hovered x (line charts only) */
  var crosshairPlugin = {
    id: 'crosshair',
    afterDatasetsDraw: function (chart) {
      if (chart.config.type !== 'line') return;
      var active = chart.tooltip && chart.tooltip.getActiveElements();
      if (!active || !active.length) return;
      var t = theme();
      var px = active[0].element.x, area = chart.chartArea, ctx = chart.ctx;
      ctx.save();
      ctx.strokeStyle = t.baseline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, area.top);
      ctx.lineTo(px, area.bottom);
      ctx.stroke();
      ctx.restore();
    }
  };

  Chart.register(peMarkerPlugin, crosshairPlugin);

  /* ---------- shared chart options ---------- */

  function tooltipStyle(t) {
    return {
      backgroundColor: t.surface,
      titleColor: t.secondary,
      bodyColor: t.primary,
      borderColor: t.grid,
      borderWidth: 1,
      titleFont: { size: 12 },
      bodyFont: { size: 13, weight: '600' },
      padding: 10,
      displayColors: true,
      boxWidth: 12,
      boxHeight: 3
    };
  }

  function baseOptions(t) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: tooltipStyle(t)
      },
      scales: {
        x: {
          type: 'linear',
          grid: { display: false },
          border: { color: t.baseline },
          ticks: {
            color: t.muted, font: { size: 11 }, maxRotation: 0,
            callback: function (v) { return Number.isInteger(v) ? String(v) : ''; },
            stepSize: 2, precision: 0
          }
        },
        y: {
          grid: { color: t.grid, lineWidth: 1, drawTicks: false },
          border: { display: false },
          ticks: {
            color: t.muted, font: { size: 11 }, maxTicksLimit: 5,
            callback: function (v) { return '$' + v.toLocaleString('en-US'); }
          }
        }
      }
    };
  }

  /* ---------- per-sport small multiple ---------- */

  var globalMaxReal = 0;
  DATA.sports.concat(DATA.context_series).forEach(function (s) {
    (s.series || []).forEach(function (p) {
      p.real = toReal(p.nominal, p.year);
      if (s.confidence && p.real > globalMaxReal) globalMaxReal = p.real;
    });
  });

  /* open markers for the frame-flagged 2022 wave */
  function pointFill(pts, color, t) {
    return pts.map(function (p) { return p.frame_flag ? t.surface : color; });
  }
  function pointStroke(pts, color, t) {
    return pts.map(function (p) { return p.frame_flag ? color : t.surface; });
  }

  function sportChart(canvas, sport) {
    var t = theme();
    var pts = sport.series;
    var single = pts.length === 1;
    var opts = baseOptions(t);
    opts.scales.x.min = 2017.5;
    opts.scales.x.max = 2025.5;
    opts.scales.x.afterBuildTicks = function (axis) {
      axis.ticks = [2018, 2020, 2022, 2024].map(function (v) { return { value: v }; });
    };
    opts.scales.y.beginAtZero = true;
    if (sameScale) opts.scales.y.suggestedMax = Math.ceil(globalMaxReal / 500) * 500;
    opts.plugins.peMarkers = { events: sport.events || [] };
    opts.plugins.tooltip.callbacks = {
      title: function (items) {
        if (!items.length) return '';
        var yr = items[0].parsed.x;
        var p = pts[items[0].dataIndex];
        return String(yr) + (p && p.frame_flag ? ' — different survey sample' : '');
      },
      label: function (item) {
        return ' ' + fmt$(item.parsed.y) + '  ' + item.dataset.label;
      }
    };

    var chart = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Real (' + BASE_YEAR + ' $)',
            data: pts.map(function (p) { return { x: p.year, y: p.real }; }),
            borderColor: t.real, backgroundColor: t.realWash,
            pointBackgroundColor: pointFill(pts, t.real, t),
            pointBorderColor: pointStroke(pts, t.real, t),
            pointBorderWidth: 2,
            pointRadius: single ? 5.5 : 4.5, pointHoverRadius: 7,
            borderWidth: 2, tension: 0, fill: !single, spanGaps: true
          },
          {
            label: 'Nominal $',
            data: pts.map(function (p) { return { x: p.year, y: p.nominal }; }),
            borderColor: t.nominal, backgroundColor: 'transparent',
            pointBackgroundColor: pointFill(pts, t.nominal, t),
            pointBorderColor: pointStroke(pts, t.nominal, t),
            pointBorderWidth: 2,
            pointRadius: single ? 5 : 4, pointHoverRadius: 7,
            borderWidth: 2, tension: 0, spanGaps: true
          }
        ]
      },
      options: opts
    });
    return chart;
  }

  /* cheer: no time series exists — tier ranges as floating bars */
  function rangeChart(canvas, sport) {
    var t = theme();
    var rows = sport.range_chart;
    var opts = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: Object.assign(tooltipStyle(t), {
          callbacks: {
            title: function (items) { return items.length ? rows[items[0].dataIndex].tier : ''; },
            label: function (item) {
              var r = rows[item.dataIndex];
              return ' ' + fmt$(r.low) + ' – ' + fmt$(r.high) + '  reported range (nominal, current)';
            }
          }
        })
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: t.grid, lineWidth: 1, drawTicks: false },
          border: { display: false },
          ticks: {
            color: t.muted, font: { size: 11 }, maxTicksLimit: 5,
            callback: function (v) { return '$' + v.toLocaleString('en-US'); }
          }
        },
        y: {
          grid: { display: false },
          border: { color: t.baseline },
          ticks: { color: t.secondary, font: { size: 12 } }
        }
      }
    };
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map(function (r) { return r.tier; }),
        datasets: [{
          data: rows.map(function (r) { return [r.low, r.high]; }),
          backgroundColor: t.real,
          borderColor: t.surface,
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 22
        }]
      },
      options: opts
    });
  }

  /* ---------- card DOM ---------- */

  var CONF_LABEL = { solid: 'Solid', thin: 'Thin', anecdotal: 'Anecdotal' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function srcLink(id) {
    var a = document.createElement('a');
    a.href = '#src-' + id;
    var s = DATA.sources[id];
    a.textContent = '[' + (s ? s.n : '?') + ']';
    a.className = 'footnote-ref';
    a.title = s ? s.name : id;
    return a;
  }

  function sourceRefs(sport) {
    var ids = [];
    function add(id) { if (id && ids.indexOf(id) < 0) ids.push(id); }
    (sport.series || []).forEach(function (p) { add(p.source); });
    (sport.range_chart || []).forEach(function (r) { add(r.source); });
    (sport.events || []).forEach(function (e) { add(e.source); });
    return ids;
  }

  function buildCard(sport, container) {
    var card = el('article', 'card');
    card.id = 'sport-' + sport.id;

    var head = el('div', 'card-head');
    head.appendChild(el('h3', null, sport.name));
    var badge = el('span', 'badge ' + sport.confidence);
    badge.appendChild(el('span', 'dot'));
    badge.appendChild(document.createTextNode(CONF_LABEL[sport.confidence] + ' data'));
    badge.title = sport.confidence_reason || '';
    head.appendChild(badge);
    card.appendChild(head);

    var cagrLine = el('p', 'cagr');
    var c = cagr(sport.series || [], 'real');
    if (c !== null) {
      var y0 = sport.series[0].year, y1 = sport.series[sport.series.length - 1].year;
      var cn = cagr(sport.series, 'nominal');
      cagrLine.appendChild(el('strong', null, pct(c) + '/yr real CAGR'));
      cagrLine.appendChild(document.createTextNode(' (' + pct(cn) + ' nominal), ' + y0 + '–' + y1));
    } else if ((sport.series || []).length === 0) {
      cagrLine.textContent = 'No survey series exists in any year — current reported ranges only.';
    } else {
      cagrLine.textContent = 'One survey point (' + sport.series[0].year + ') — no trend can honestly be drawn.';
    }
    card.appendChild(cagrLine);

    var box = el('div', 'chart-box');
    var canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', sport.name + ': ' + ((sport.series || []).length ?
      'average annual family spending per child, nominal and inflation-adjusted, by survey year.' :
      'reported current cost ranges by tier.') + ' Data also in the table below.');
    box.appendChild(canvas);
    card.appendChild(box);

    if (sport.events && sport.events.length) {
      var evNote = el('p', 'range-note');
      evNote.appendChild(el('strong', null, '▾ PE / ownership: '));
      evNote.appendChild(document.createTextNode(sport.events.map(function (e) {
        return e.year_label + ' ' + e.label;
      }).join(' · ')));
      card.appendChild(evNote);
    }

    if (sport.range_note) {
      var rn = el('p', 'range-note');
      rn.appendChild(el('strong', null, 'Tiers today: '));
      rn.appendChild(document.createTextNode(sport.range_note));
      card.appendChild(rn);
    }
    if (sport.gaps) card.appendChild(el('p', 'gap-note', sport.gaps));

    if (sport.mix_2019) {
      var mixOrder = Object.keys(sport.mix_2019).sort(function (a, b) { return sport.mix_2019[b] - sport.mix_2019[a]; });
      var mixNote = el('p', 'range-note');
      mixNote.appendChild(el('strong', null, 'Where the money went (2019): '));
      mixNote.appendChild(document.createTextNode(
        mixOrder.map(function (k) { return k + ' ' + fmt$(sport.mix_2019[k]); }).join(' · ') +
        (sport.hours_2019 ? ' — at ' + sport.hours_2019 + ' hrs/week of play' : '')));
      card.appendChild(mixNote);
    }

    /* table view — the WCAG-clean twin */
    var det = el('details');
    det.appendChild(el('summary', null, 'Data table & sources'));
    var tbl = el('table');
    var thead = el('thead'), hr = el('tr');
    var headers = (sport.series || []).length
      ? ['Year', 'Nominal', 'Real (' + BASE_YEAR + '$)', 'Src']
      : ['Tier', 'Low', 'High', 'Src'];
    headers.forEach(function (h) { hr.appendChild(el('th', null, h)); });
    thead.appendChild(hr); tbl.appendChild(thead);
    var tbody = el('tbody');
    if ((sport.series || []).length) {
      sport.series.forEach(function (p) {
        var tr = el('tr');
        tr.appendChild(el('td', null, String(p.year) + (p.frame_flag ? ' ○' : '')));
        tr.appendChild(el('td', null, fmt$(p.nominal)));
        tr.appendChild(el('td', null, fmt$(p.real)));
        var td = el('td'); td.appendChild(srcLink(p.source)); tr.appendChild(td);
        tbody.appendChild(tr);
      });
    } else {
      (sport.range_chart || []).forEach(function (r) {
        var tr = el('tr');
        tr.appendChild(el('td', null, r.tier));
        tr.appendChild(el('td', null, fmt$(r.low)));
        tr.appendChild(el('td', null, fmt$(r.high)));
        var td = el('td'); td.appendChild(srcLink(r.source)); tr.appendChild(td);
        tbody.appendChild(tr);
      });
    }
    tbl.appendChild(tbody);
    det.appendChild(tbl);
    var refs = el('p', 'src-refs');
    refs.appendChild(document.createTextNode('Sources: '));
    sourceRefs(sport).forEach(function (id, i) {
      if (i) refs.appendChild(document.createTextNode(', '));
      var a = document.createElement('a');
      a.href = '#src-' + id;
      var s = DATA.sources[id];
      a.textContent = s ? ('[' + s.n + '] ' + s.short) : id;
      refs.appendChild(a);
    });
    det.appendChild(refs);
    card.appendChild(det);

    container.appendChild(card);
    var chart = (sport.series || []).length
      ? sportChart(canvas, sport)
      : rangeChart(canvas, sport);
    charts.push({ chart: chart, kind: 'sport', sport: sport, canvas: canvas });
  }

  /* ---------- combined indexed chart ---------- */

  function indexedSeries(entity, baseYear) {
    var base = null;
    (entity.series || []).forEach(function (p) { if (p.year === baseYear) base = p.nominal; });
    if (base === null) return null;
    var pts = entity.series.filter(function (p) { return p.year >= baseYear; });
    if (pts.length < 2) return null;
    return pts.map(function (p) {
      return { x: p.year, y: 100 * p.nominal / base, frame_flag: !!p.frame_flag };
    });
  }

  function cpiIndexed(table, baseYear) {
    var base = table[String(baseYear)];
    var out = [];
    Object.keys(table).sort().forEach(function (y) {
      if (+y >= baseYear) out.push({ x: +y, y: 100 * table[y] / base });
    });
    return out;
  }

  function combinedEntities() {
    return DATA.context_series.concat(DATA.sports);
  }

  function combinedChart(canvas) {
    var t = theme();
    var baseYear = DATA.combined_base_year;
    var datasets = [];

    combinedEntities().forEach(function (s) {
      var pts = indexedSeries(s, baseYear);
      if (!pts) return;
      var hl = highlightedSport === s.id;
      var color = hl ? t.highlight : t.deemph;
      datasets.push({
        label: s.name,
        data: pts,
        borderColor: color,
        backgroundColor: 'transparent',
        pointBackgroundColor: pts.map(function (p) { return p.frame_flag ? t.surface : color; }),
        pointBorderColor: pts.map(function (p) { return p.frame_flag ? color : t.surface; }),
        pointBorderWidth: 2,
        pointRadius: hl ? 4.5 : 3.5, pointHoverRadius: 6,
        borderWidth: 2, tension: 0, order: hl ? 0 : 10
      });
    });

    datasets.push({
      label: 'CPI — all items',
      data: cpiIndexed(CPI.all_items, baseYear),
      borderColor: t.cpiAll, backgroundColor: 'transparent',
      pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: t.cpiAll,
      pointBorderColor: t.surface, pointBorderWidth: 2,
      borderWidth: 2, tension: 0, order: 5
    });
    datasets.push({
      label: 'CPI — ' + CPI.recreation_label,
      data: cpiIndexed(CPI.recreation, baseYear),
      borderColor: t.cpiRec, backgroundColor: 'transparent',
      pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: t.cpiRec,
      pointBorderColor: t.surface, pointBorderWidth: 2,
      borderWidth: 2, tension: 0, order: 5
    });

    var opts = baseOptions(t);
    opts.scales.x.min = baseYear - 0.3;
    opts.scales.x.max = 2025.5;
    opts.scales.y.ticks.callback = function (v) { return v; };
    opts.interaction = { mode: 'nearest', axis: 'xy', intersect: false };
    opts.plugins.tooltip.callbacks = {
      title: function (items) { return items.length ? String(items[0].parsed.x) : ''; },
      label: function (item) {
        var p = item.dataset.data[item.dataIndex];
        return ' ' + item.parsed.y.toFixed(0) + '  ' + item.dataset.label +
          ' (' + baseYear + ' = 100)' + (p && p.frame_flag ? ' — different survey sample' : '');
      }
    };

    return new Chart(canvas, { type: 'line', data: { datasets: datasets }, options: opts });
  }

  /* ---------- render all ---------- */

  var grid = document.getElementById('sports-grid');
  DATA.sports.forEach(function (s) { buildCard(s, grid); });

  var combinedCanvas = document.getElementById('combined-canvas');
  charts.push({ chart: combinedChart(combinedCanvas), kind: 'combined', canvas: combinedCanvas });

  /* chips for highlighting */
  var chipsRow = document.getElementById('combined-chips');
  combinedEntities().forEach(function (s) {
    if (!indexedSeries(s, DATA.combined_base_year)) return;
    var chip = el('button', 'chip');
    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');
    chip.appendChild(el('span', 'key'));
    chip.appendChild(document.createTextNode(s.name));
    chip.addEventListener('click', function () {
      highlightedSport = highlightedSport === s.id ? null : s.id;
      chipsRow.querySelectorAll('.chip:not(.fixed)').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      if (highlightedSport) chip.setAttribute('aria-pressed', 'true');
      rebuildCombined();
    });
    chipsRow.appendChild(chip);
  });
  ['cpi-all', 'cpi-rec'].forEach(function (cls, i) {
    var chip = el('span', 'chip fixed ' + cls);
    chip.appendChild(el('span', 'key'));
    chip.appendChild(document.createTextNode(i === 0 ? 'CPI — all items' : 'CPI — ' + CPI.recreation_label));
    chipsRow.appendChild(chip);
  });

  function rebuildCombined() {
    var entry = charts.find(function (c) { return c.kind === 'combined'; });
    entry.chart.destroy();
    entry.chart = combinedChart(entry.canvas);
  }

  /* ---------- scale toggle ---------- */
  var segBtns = document.querySelectorAll('#scale-toggle button');
  segBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      segBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      sameScale = btn.dataset.scale === 'same';
      rebuildSportCharts();
    });
  });

  function rebuildSportCharts() {
    charts.forEach(function (entry) {
      if (entry.kind !== 'sport') return;
      entry.chart.destroy();
      entry.chart = (entry.sport.series || []).length
        ? sportChart(entry.canvas, entry.sport)
        : rangeChart(entry.canvas, entry.sport);
    });
  }

  /* ---------- theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');
  function currentDark() {
    var forced = document.documentElement.getAttribute('data-theme');
    if (forced) return forced === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyToggleLabel() {
    toggle.textContent = currentDark() ? '☀ Light mode' : '☾ Dark mode';
  }
  toggle.addEventListener('click', function () {
    document.documentElement.setAttribute('data-theme', currentDark() ? 'light' : 'dark');
    applyToggleLabel();
    rebuildSportCharts();
    rebuildCombined();
    if (window.rebuildContentCharts) window.rebuildContentCharts();
  });
  applyToggleLabel();

  /* ---------- headline stats ---------- */
  (function stats() {
    var h = DATA.headline;
    document.getElementById('stat-2019').textContent = fmt$(h.avg_2019);
    document.getElementById('stat-2024').textContent = fmt$(h.avg_2024);
    document.getElementById('stat-nominal').textContent = pct(h.avg_2024 / h.avg_2019 - 1, 0);
    var realInc = toReal(h.avg_2024, 2024) / toReal(h.avg_2019, 2019) - 1;
    document.getElementById('stat-real').textContent = pct(realInc, 0);
    document.getElementById('stat-cpi').textContent = pct(CPI.all_items['2024'] / CPI.all_items['2019'] - 1, 0);
  })();

  /* expose helpers for content.js */
  window.VIZ = { theme: theme, fmt$: fmt$, pct: pct, toReal: toReal, tooltipStyle: tooltipStyle, cssVar: cssVar };
})();
