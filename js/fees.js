/* Club-level published-fee dataset section. Consumes window.FEES (generated from data/fees.json).
   Chart: dot strip per sport, log-$ x-axis, rec (aqua) vs competitive (blue) — palette validated.
   Every dot is also a row in the table below; the table is the canonical view. */
(function () {
  'use strict';

  var FEES = window.FEES;
  if (!FEES || !FEES.rows || !FEES.rows.length) return;
  var V = window.VIZ;

  var SPORT_LABEL = {
    soccer: 'Soccer', baseball: 'Baseball', cheer: 'Cheer', gymnastics: 'Gymnastics',
    swim: 'Swimming', hockey: 'Ice hockey', golf: 'Golf', lacrosse: 'Lacrosse',
    tennis: 'Tennis', volleyball: 'Volleyball'
  };
  var TIER_LABEL = { rec: 'Rec / entry', comp: 'Competitive / club' };
  var PERIOD_LABEL = { year: '/yr', season: '/season', month: '/mo', event: '/event', week: '/week' };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var body = document.getElementById('fees-body');
  document.getElementById('fees-title').textContent =
    'Straight from the clubs: ' + FEES.rows.length + ' published fees from ' + FEES.org_count + ' real organizations';

  var intro = el('p', 'section-intro');
  intro.innerHTML = 'Survey averages hide the sticker prices, so here they are: <strong>list prices published by named ' +
    'clubs, gyms, leagues and tours</strong>, collected ' + FEES.collected + ', every row linked to the page it came from. ' +
    'Two honest caveats: these are asking prices, not what families ultimately spend (fees often exclude travel, gear and extras — ' +
    'read the “covers” column); and the sample skews toward organizations that publish fees at all. ' +
    'Seasonal and annual fees are charted below; monthly and per-event fees are in the table.';
  body.appendChild(intro);

  /* ---------- chart ---------- */
  var card = el('div', 'card');
  var legend = el('div', 'legend');
  [['rec', 'Rec / entry'], ['comp', 'Competitive / club']].forEach(function (t) {
    var item = el('span', 'item');
    var key = el('span', 'key');
    key.style.width = '10px'; key.style.height = '10px'; key.style.borderRadius = '50%';
    key.dataset.tier = t[0];
    item.appendChild(key);
    item.appendChild(document.createTextNode(t[1] + ' — one dot per published fee (per season/year)'));
    legend.appendChild(item);
  });
  card.appendChild(legend);
  var box = el('div', 'chart-box tall');
  var canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Published seasonal or annual fees by sport and tier, log dollar scale. All values in the table below.');
  box.appendChild(canvas);
  card.appendChild(box);
  var axNote = el('p', 'range-note');
  axNote.appendChild(el('strong', null, 'Log scale: '));
  axNote.appendChild(document.createTextNode('each gridline is roughly a 3x jump — the honest way to show $100 rec seasons and $10,000 club years in one frame.'));
  card.appendChild(axNote);
  body.appendChild(card);

  var sports = Object.keys(SPORT_LABEL).filter(function (s) {
    return FEES.rows.some(function (r) { return r.sport === s; });
  });

  var feeChart = null;
  function buildFeeChart() {
    var t = V.theme();
    var aqua = V.cssVar('--tier-rec');
    var blue = V.cssVar('--tier-comp');
    legend.querySelectorAll('.key').forEach(function (k) {
      k.style.background = k.dataset.tier === 'rec' ? aqua : blue;
    });
    if (feeChart) feeChart.destroy();

    var chartRows = FEES.rows.filter(function (r) {
      return (r.period === 'year' || r.period === 'season') && r.amount > 0;
    });
    /* deterministic jitter so dots within a sport row don't stack */
    function jitter(i) { return ((i * 2654435761 % 1000) / 1000 - 0.5) * 0.55; }

    var datasets = ['rec', 'comp'].map(function (tier) {
      var pts = [];
      chartRows.forEach(function (r, i) {
        if (r.tier !== tier) return;
        pts.push({ x: r.amount, y: sports.indexOf(r.sport) + jitter(i), $row: r });
      });
      return {
        label: TIER_LABEL[tier],
        data: pts,
        backgroundColor: tier === 'rec' ? aqua : blue,
        borderColor: t.surface,
        borderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false
      };
    });

    feeChart = new Chart(canvas, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign(V.tooltipStyle(t), {
            callbacks: {
              title: function (items) {
                var r = items.length && items[0].raw.$row;
                return r ? r.org + (r.loc ? ' — ' + r.loc : '') : '';
              },
              label: function (item) {
                var r = item.raw.$row;
                return ' ' + V.fmt$(r.amount) + PERIOD_LABEL[r.period] + '  ' + r.program + ' (' + r.season + ')';
              }
            }
          })
        },
        scales: {
          x: {
            type: 'logarithmic',
            min: 40,
            grid: { color: t.grid, lineWidth: 1, drawTicks: false },
            border: { display: false },
            ticks: {
              color: t.muted, font: { size: 11 }, maxRotation: 0,
              callback: function (v) {
                return [50, 100, 300, 1000, 3000, 10000, 30000, 100000].indexOf(v) >= 0
                  ? '$' + v.toLocaleString('en-US') : '';
              }
            }
          },
          y: {
            min: -0.7, max: sports.length - 0.3,
            grid: { display: false },
            border: { color: t.baseline },
            ticks: {
              color: t.secondary, font: { size: 12 }, stepSize: 1,
              callback: function (v) { return SPORT_LABEL[sports[v]] || ''; }
            }
          }
        }
      }
    });
  }
  buildFeeChart();
  var prevRebuild = window.rebuildContentCharts;
  window.rebuildContentCharts = function () {
    if (prevRebuild) prevRebuild();
    buildFeeChart();
  };

  /* ---------- filter + table ---------- */
  var controls = el('div', 'controls');
  var seg = el('div', 'seg');
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', 'Filter fee table by sport');
  var activeSport = 'all';
  [['all', 'All sports']].concat(sports.map(function (s) { return [s, SPORT_LABEL[s]]; })).forEach(function (opt) {
    var btn = el('button', null, opt[1]);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', opt[0] === 'all' ? 'true' : 'false');
    btn.addEventListener('click', function () {
      activeSport = opt[0];
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      renderTable();
    });
    seg.appendChild(btn);
  });
  controls.appendChild(seg);
  body.appendChild(controls);

  var wrap = el('div', 'verdict-table-wrap');
  var tbl = document.createElement('table');
  tbl.className = 'verdict';
  wrap.appendChild(tbl);
  body.appendChild(wrap);

  function renderTable() {
    tbl.textContent = '';
    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['Sport', 'Organization', 'Location', 'Program / tier', 'Season', 'Fee', 'Covers'].forEach(function (h) {
      var th = document.createElement('th'); th.textContent = h; hr.appendChild(th);
    });
    thead.appendChild(hr);
    tbl.appendChild(thead);
    var tbody = document.createElement('tbody');
    FEES.rows.forEach(function (r) {
      if (activeSport !== 'all' && r.sport !== activeSport) return;
      var tr = document.createElement('tr');
      tr.appendChild(el('td', null, SPORT_LABEL[r.sport] || r.sport));
      var orgTd = document.createElement('td');
      var a = document.createElement('a');
      a.href = r.url; a.rel = 'noopener';
      a.textContent = r.org;
      orgTd.appendChild(a);
      tr.appendChild(orgTd);
      tr.appendChild(el('td', null, r.loc || ''));
      tr.appendChild(el('td', null, r.program + (r.tier === 'rec' ? ' · rec' : '')));
      tr.appendChild(el('td', null, r.season));
      var fee = el('td', 'num', V.fmt$(r.amount) + PERIOD_LABEL[r.period]);
      tr.appendChild(fee);
      tr.appendChild(el('td', null, r.covers || ''));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
  }
  renderTable();
})();
