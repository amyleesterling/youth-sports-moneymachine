/* Youth sports cost investigation — rendering. Data comes from js/data.js (window.DATA),
   generated from the canonical files in data/ by tools/gen-data.js. */
(function () {
  'use strict';

  var DATA = window.DATA;
  var CPI = DATA.cpi;
  var BASE_YEAR = String(CPI.base_year);
  var charts = [];          // [{chart, kind:'sport'|'combined', sport}]
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
    var f = CPI.all_items[BASE_YEAR] / CPI.all_items[String(year)];
    return nominal * f;
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

  /* CPI CAGR over the same window as a sport's series */
  function cpiCagr(y0, y1, table) {
    var a = table[String(y0)], b = table[String(y1)];
    if (!a || !b || y1 <= y0) return null;
    return Math.pow(b / a, 1 / (y1 - y0)) - 1;
  }

  /* ---------- PE event marker plugin ---------- */
  /* Vertical hairline at each event year; event text lives in the card's notes
     (labels inside 320px cards would collide). */
  var peMarkerPlugin = {
    id: 'peMarkers',
    afterDatasetsDraw: function (chart) {
      var events = chart.$peEvents || [];
      if (!events.length) return;
      var t = theme();
      var x = chart.scales.x, area = chart.chartArea, ctx = chart.ctx;
      ctx.save();
      events.forEach(function (ev) {
        var px = x.getPixelForValue(ev.year);
        if (px < area.left - 1 || px > area.right + 1) return;
        ctx.strokeStyle = t.pe;
        ctx.globalAlpha = 0.55;
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

  /* crosshair: vertical hairline snapped to hovered x */
  var crosshairPlugin = {
    id: 'crosshair',
    afterDatasetsDraw: function (chart) {
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

  function baseOptions(t, yTitle) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
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
          boxHeight: 3,
          usePointStyle: false,
          callbacks: {}
        }
      },
      scales: {
        x: {
          type: 'linear',
          grid: { display: false },
          border: { color: t.baseline },
          ticks: {
            color: t.muted, font: { size: 11 }, maxRotation: 0,
            callback: function (v) { return Number.isInteger(v) ? String(v) : ''; },
            autoSkip: true, maxTicksLimit: 6, precision: 0
          }
        },
        y: {
          grid: { color: t.grid, lineWidth: 1, drawTicks: false },
          border: { display: false },
          ticks: { color: t.muted, font: { size: 11 }, maxTicksLimit: 5, callback: function (v) { return yTitle === '$' ? '$' + v.toLocaleString('en-US') : v; } }
        }
      }
    };
  }

  /* ---------- per-sport small multiple ---------- */

  var globalMaxReal = 0;
  DATA.sports.forEach(function (s) {
    s.series.forEach(function (p) {
      p.real = toReal(p.nominal, p.year);
      if (p.real > globalMaxReal) globalMaxReal = p.real;
      if (p.nominal > globalMaxReal) globalMaxReal = p.nominal;
    });
  });

  function sportChart(canvas, sport) {
    var t = theme();
    var pts = sport.series;
    var opts = baseOptions(t, '$');
    opts.scales.x.min = 2015.5;
    opts.scales.x.max = 2025.5;
    opts.scales.y.beginAtZero = true;
    if (sameScale) opts.scales.y.suggestedMax = Math.ceil(globalMaxReal / 500) * 500;
    opts.plugins.tooltip.callbacks = {
      title: function (items) { return items.length ? String(items[0].parsed.x) : ''; },
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
            pointBackgroundColor: t.real, pointBorderColor: t.surface, pointBorderWidth: 2,
            pointRadius: 4.5, pointHoverRadius: 6, borderWidth: 2, tension: 0, fill: true,
            spanGaps: true
          },
          {
            label: 'Nominal $',
            data: pts.map(function (p) { return { x: p.year, y: p.nominal }; }),
            borderColor: t.nominal, backgroundColor: 'transparent',
            pointBackgroundColor: t.nominal, pointBorderColor: t.surface, pointBorderWidth: 2,
            pointRadius: 4, pointHoverRadius: 6, borderWidth: 2, tension: 0,
            spanGaps: true
          }
        ]
      },
      options: opts
    });
    chart.$peEvents = sport.events || [];
    return chart;
  }

  /* ---------- card DOM ---------- */

  var CONF_LABEL = { solid: 'Solid', thin: 'Thin', anecdotal: 'Anecdotal' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function sourceRefs(sport) {
    var ids = [];
    sport.series.forEach(function (p) { if (ids.indexOf(p.source) < 0) ids.push(p.source); });
    (sport.ranges || []).forEach(function (r) { if (r.source && ids.indexOf(r.source) < 0) ids.push(r.source); });
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

    var c = cagr(sport.series, 'real');
    var cagrLine = el('p', 'cagr');
    if (c !== null) {
      var y0 = sport.series[0].year, y1 = sport.series[sport.series.length - 1].year;
      var cn = cagr(sport.series, 'nominal');
      var strong = el('strong', null, pct(c) + '/yr real');
      cagrLine.appendChild(strong);
      cagrLine.appendChild(document.createTextNode(
        ' (' + pct(cn) + ' nominal), ' + y0 + '–' + y1));
    } else {
      cagrLine.textContent = 'CAGR not computed — fewer than 3 survey points.';
    }
    card.appendChild(cagrLine);

    var box = el('div', 'chart-box');
    var canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', sport.name + ' average annual family spending, nominal and inflation-adjusted dollars, by survey year. Data also in table below.');
    box.appendChild(canvas);
    card.appendChild(box);

    if (sport.events && sport.events.length) {
      var evNote = el('p', 'range-note');
      evNote.appendChild(el('strong', null, '▾ PE/ownership: '));
      evNote.appendChild(document.createTextNode(sport.events.map(function (e) {
        return e.year_label + ' ' + e.label;
      }).join(' · ')));
      card.appendChild(evNote);
    }

    if (sport.range_note) {
      var rn = el('p', 'range-note');
      rn.appendChild(el('strong', null, 'Typical range today: '));
      rn.appendChild(document.createTextNode(sport.range_note));
      card.appendChild(rn);
    }
    if (sport.gaps) card.appendChild(el('p', 'gap-note', sport.gaps));

    /* table view — the WCAG-clean twin */
    var det = el('details');
    det.appendChild(el('summary', null, 'Data table & sources'));
    var tbl = el('table');
    var thead = el('thead');
    var hr = el('tr');
    ['Year', 'Nominal', 'Real (' + BASE_YEAR + '$)', 'Source'].forEach(function (h) { hr.appendChild(el('th', null, h)); });
    thead.appendChild(hr); tbl.appendChild(thead);
    var tbody = el('tbody');
    sport.series.forEach(function (p) {
      var tr = el('tr');
      tr.appendChild(el('td', null, String(p.year)));
      tr.appendChild(el('td', null, fmt$(p.nominal)));
      tr.appendChild(el('td', null, fmt$(p.real)));
      var srcTd = el('td');
      var a = document.createElement('a');
      a.href = '#src-' + p.source;
      a.textContent = '[' + (DATA.sources[p.source] ? DATA.sources[p.source].n : '?') + ']';
      a.className = 'footnote-ref';
      srcTd.appendChild(a);
      tr.appendChild(srcTd);
      tbody.appendChild(tr);
    });
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
    charts.push({ chart: sportChart(canvas, sport), kind: 'sport', sport: sport, canvas: canvas });
  }

  /* ---------- combined indexed chart ---------- */

  function indexedSeries(sport, baseYear) {
    var base = null;
    sport.series.forEach(function (p) { if (p.year === baseYear) base = p.nominal; });
    if (base === null) return null;
    return sport.series
      .filter(function (p) { return p.year >= baseYear; })
      .map(function (p) { return { x: p.year, y: 100 * p.nominal / base }; });
  }

  function cpiIndexed(table, baseYear) {
    var base = table[String(baseYear)];
    var out = [];
    Object.keys(table).sort().forEach(function (y) {
      if (+y >= baseYear && +y <= 2025) out.push({ x: +y, y: 100 * table[y] / base });
    });
    return out;
  }

  function combinedChart(canvas) {
    var t = theme();
    var baseYear = DATA.combined_base_year;
    var datasets = [];

    DATA.sports.forEach(function (s) {
      var pts = indexedSeries(s, baseYear);
      if (!pts || pts.length < 2) return;
      var hl = highlightedSport === s.id;
      datasets.push({
        label: s.name,
        data: pts,
        borderColor: hl ? t.highlight : t.deemph,
        backgroundColor: 'transparent',
        pointBackgroundColor: hl ? t.highlight : t.deemph,
        pointBorderColor: t.surface, pointBorderWidth: 2,
        pointRadius: hl ? 4.5 : 3, pointHoverRadius: 6,
        borderWidth: 2, tension: 0, order: hl ? 0 : 10,
        $kind: 'sport', $id: s.id
      });
    });

    datasets.push({
      label: 'CPI — all items',
      data: cpiIndexed(CPI.all_items, baseYear),
      borderColor: t.cpiAll, backgroundColor: 'transparent',
      pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: t.cpiAll,
      pointBorderColor: t.surface, pointBorderWidth: 2,
      borderWidth: 2, tension: 0, order: 5, $kind: 'cpi'
    });
    datasets.push({
      label: 'CPI — ' + CPI.recreation_label,
      data: cpiIndexed(CPI.recreation, baseYear),
      borderColor: t.cpiRec, backgroundColor: 'transparent',
      pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: t.cpiRec,
      pointBorderColor: t.surface, pointBorderWidth: 2,
      borderWidth: 2, tension: 0, order: 5, $kind: 'cpi'
    });

    var opts = baseOptions(t, 'idx');
    opts.scales.x.min = baseYear - 0.3;
    opts.scales.x.max = 2025.5;
    opts.interaction = { mode: 'nearest', axis: 'xy', intersect: false };
    opts.plugins.tooltip.callbacks = {
      title: function (items) { return items.length ? String(items[0].parsed.x) : ''; },
      label: function (item) {
        return ' ' + item.parsed.y.toFixed(0) + '  ' + item.dataset.label + ' (nominal, ' + baseYear + ' = 100)';
      }
    };

    var chart = new Chart(canvas, { type: 'line', data: { datasets: datasets }, options: opts });
    chart.$peEvents = [];
    return chart;
  }

  /* ---------- render all ---------- */

  var grid = document.getElementById('sports-grid');
  DATA.sports.forEach(function (s) { buildCard(s, grid); });

  var combinedCanvas = document.getElementById('combined-canvas');
  var combined = combinedChart(combinedCanvas);
  charts.push({ chart: combined, kind: 'combined', canvas: combinedCanvas });

  /* chips for highlighting */
  var chipsRow = document.getElementById('combined-chips');
  DATA.sports.forEach(function (s) {
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
      entry.chart = sportChart(entry.canvas, entry.sport);
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
  });
  applyToggleLabel();

  /* ---------- headline stats ---------- */
  (function stats() {
    var h = DATA.headline;
    document.getElementById('stat-2019').textContent = fmt$(h.avg_2019);
    document.getElementById('stat-2024').textContent = fmt$(h.avg_2024);
    var nomInc = h.avg_2024 / h.avg_2019 - 1;
    document.getElementById('stat-nominal').textContent = pct(nomInc, 0);
    var real2019 = toReal(h.avg_2019, 2019);
    var realInc = toReal(h.avg_2024, 2024) / real2019 - 1;
    document.getElementById('stat-real').textContent = pct(realInc, 0);
    var cpiInc = CPI.all_items['2024'] / CPI.all_items['2019'] - 1;
    document.getElementById('stat-cpi').textContent = pct(cpiInc, 0);
  })();
})();
