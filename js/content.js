/* Written analysis sections. Static authored prose uses innerHTML; anything built
   from data records uses textContent. Loaded after main.js (uses window.VIZ). */
(function () {
  'use strict';

  var DATA = window.DATA;
  var V = window.VIZ;

  function srcRef(id) {
    var s = DATA.sources[id];
    return '<a class="footnote-ref" href="#src-' + id + '" title="' + (s ? s.short.replace(/"/g, '&quot;') : id) + '">[' + (s ? s.n : '?') + ']</a>';
  }

  /* ---------- cheer callout ---------- */
  document.getElementById('cheer-callout').innerHTML =
    '<h3>The cheer paradox: the strongest story, the weakest data</h3>' +
    '<p>Competitive cheer is the closest thing youth sports has to a natural experiment in private-equity ' +
    'ownership. One company — Varsity Brands — runs the dominant competition circuits, sells the uniforms, ' +
    'runs the camps, and helped found and fund the sport’s governing body (USASF). It has been passed ' +
    'between PE owners three times: Charlesbank (~$1.5B, 2014), Bain Capital (~$2.5B, 2018), and KKR ' +
    '(~$4.75B, 2024) ' + srcRef('varsity_deals') + '. Plaintiffs alleged Varsity controlled roughly 80–90% ' +
    'of the all-star competition market after buying up rival event producers ' + srcRef('varsity_litigation') + '.</p>' +
    '<p><strong>What the litigation record shows:</strong> gyms and parents brought antitrust suits; Varsity and Bain ' +
    'settled for <strong>$43.5M</strong> (Fusion Elite, gym class, 2023) and <strong>$82.5M</strong> (Jones, ' +
    'parent/spectator class, 2024) without admitting liability ' + srcRef('varsity_litigation') + '. Court records ' +
    'surfaced by Oklahoma Watch show the mandatory “stay-to-play” lodging program collected roughly ' +
    '<strong>$4M a year in hotel-room rebates</strong>, with kickbacks of $20/room or 30% of the booking agent’s ' +
    'commission ' + srcRef('okwatch_stayplay') + '. The Jones settlement bars stay-to-play at 35% of Varsity events ' +
    'through 2029.</p>' +
    '<p><strong>What the price data shows: almost nothing.</strong> No national survey — not Aspen in 2019, 2022 or 2024, ' +
    'not LendingTree — has ever published a cheer spending figure. Varsity’s own event-fee history is sealed in ' +
    'litigation filings. The best public numbers are gym-level: roughly $300–$1,000 for a rec season versus ' +
    '$5,000–$10,000 all-in for an all-star year ' + srcRef('cheer_gym_fees') + srcRef('promarket2020') + '. ' +
    'So the sport most often cited as proof that PE inflates youth sports cannot actually be tested against a price series. ' +
    'That asymmetry — strong ownership evidence, absent price evidence — is itself the finding.</p>' +
    '<p class="fine">Settlements involve no admission of wrongdoing; overcharge magnitudes remain allegations. ' +
    'Correlation between ownership events and price levels is not causation.</p>';

  /* ---------- attribution section ---------- */
  document.getElementById('attribution-body').innerHTML =
    '<p class="section-intro">Youth sports spending rose about <strong>46% from 2019 to 2024 against ~23% ' +
    'economy-wide inflation</strong> ' + srcRef('aspen2024') + srcRef('bls_cpi') + '. Roughly half the nominal increase is ordinary ' +
    'inflation. The question is what drives the other half. Here is the evidence sorted by how strong it actually is.</p>' +

    '<h3>Verified before/after prices at PE-owned operators (rare, but real)</h3>' +
    '<p class="method">The clearest case is ice hockey: after Black Bear Sports Group bought the Kensington Valley ' +
    'Ice House in February 2024, the hourly ice rate charged to the local nonprofit youth association went from ' +
    '<strong>$320 to $370 (+16%)</strong> ' + srcRef('usatoday_blackbear') + '. Black Bear also introduced a ' +
    '<strong>$50/player annual registration-and-insurance fee</strong> where none existed, and put games behind its ' +
    '<strong>Black Bear TV paywall</strong> ($14.99/game, $26–$50/month) while restricting parents from filming — ' +
    'an entirely new cost category, invisible to CPI-style comparisons ' + srcRef('usatoday_blackbear') + '. ' +
    'Black Bear owns both rinks and the leagues its teams play in (Atlantic Hockey Federation, Tier 1 Hockey ' +
    'Federation) — vertical integration that Michigan’s Attorney General opened an antitrust inquiry into in 2026 ' +
    srcRef('blackbear') + srcRef('congress2026') + '.</p>' +

    '<h3>The control case: prices rose above inflation <em>without</em> PE too</h3>' +
    '<p class="method">Family-owned, independent Cooperstown Dreams Park raised its per-player week fee from ' +
    '<strong>$995 (2019) to $1,295 (2024–26)</strong> — +30% nominal against +23% CPI, with no private-equity ' +
    'owner ' + srcRef('cooperstown_dp') + '. Meanwhile the PE-owned comparison (Cooperstown All Star Village, bought ' +
    'by Josh Harris and David Blitzer in 2022) charges ~$1,395/player plus new team-level fees — but its ' +
    'pre-acquisition price was never publicly archived, so the cleanest before/after test in baseball cannot be ' +
    'completed ' + srcRef('unrivaled') + '. And 3STEP Sports — the biggest club roll-up of all, 50+ acquisitions across ' +
    'lacrosse, volleyball and soccer — has <strong>no documented before/after pricing anywhere in the public record</strong> ' +
    srcRef('threestep') + '. Absence of evidence, in both directions.</p>' +

    '<h3>Documented non-PE cost drivers</h3>' +
    '<ul class="method">' +
    '<li><strong>Insurance.</strong> Youth-sports liability entered what the trade press called “Armageddon mode”: ' +
    'governing bodies that once bought $5–20M liability towers are “lucky to secure $1M,” and gymnastics clubs face ' +
    'general-liability-plus-abuse premiums above $25,000 ' + srcRef('insurance2024') + '. USA Gymnastics raised its 2025-26 ' +
    'sanction fees citing insurance explicitly ' + srcRef('gym_fees') + '.</li>' +
    '<li><strong>Officials’ labor.</strong> Roughly 50,000 high-school officials left since 2018-19; leagues raised pay to retain them.</li>' +
    '<li><strong>Facilities and energy.</strong> Refrigeration is 40–50% of a rink’s utility bill; many acquired rinks were financially failing ' +
    '(Black Bear’s own defense — and Reason magazine’s counter-argument notes it owns ~50 of ~2,100 US rinks) ' + srcRef('reason2026') + '.</li>' +
    '<li><strong>Demand.</strong> Sports-tourism direct spending hit $52B in 2023, with 97% of destinations hosting youth events; ' +
    'higher-income families are twice as likely to choose travel sports. Some of the price rise is families buying a more expensive product on purpose.</li>' +
    '</ul>' +

    '<h3>What research says about PE and prices generally</h3>' +
    '<p class="method">The peer-reviewed evidence is sector-contingent: PE buyouts of consumer-product firms raised prices ' +
    'only ~1% (growth came from expansion), while PE in healthcare — where patients are captive — is associated with cost ' +
    'increases up to 32% ' + srcRef('fracassi2022') + '. Youth sports contains both structures: cheer under a ~90% ' +
    'monopolist and one-rink hockey towns look like healthcare; fragmented club soccer looks like retail. The price data, ' +
    'thin as it is, matches that split: the strongest documented increases sit exactly where market power is strongest.</p>';

  /* ---------- intensification section ---------- */
  document.getElementById('intensification-body').innerHTML =
    '<p class="section-intro">The other half of the story: families are not just paying more for the same thing — ' +
    'they are buying <strong>more sport</strong>. Aspen’s own category breakdown makes the decomposition unusually clean.</p>' +
    '<div class="card"><div class="chart-box" style="height:260px"><canvas id="category-canvas" role="img" ' +
    'aria-label="Spending per child per sport by category, 2019 versus 2024. Values in the text and sources."></canvas></div>' +
    '<p class="range-note"><strong>Equipment is the alibi:</strong> gear grew +7% over five years — well under the +23% CPI — ' +
    'while travel (+33%), registration (+34%), lessons (+37%) and camps (+37%) all grew at roughly twice inflation ' +
    srcRef('aspen2024') + srcRef('aspen_hours') + '. The increase is services, not stuff.</p></div>' +

    '<h3>What is quantified</h3>' +
    '<ul class="method">' +
    '<li><strong>Concentration, not addition.</strong> Kids play fewer sports (1.63 in 2023, −13% since 2019) but more of the one they keep: ' +
    'weekly sport hours were 13.6 pre-pandemic and 16.6 by fall 2022; 1 in 5 kids now plays a single sport 9–12 months a year ' + srcRef('aspen_hours') + '.</li>' +
    '<li><strong>Earlier specialization.</strong> Today’s high-school athletes specialized at 12.7 years old on average — younger than current pros did (14.1), per a 3,090-athlete study.</li>' +
    '<li><strong>Tournament norms.</strong> Travel baseball: 8–12 tournaments/season at $350–$1,000 entry each; club volleyball ~9; all-star cheer 7–8. ' +
    'Little League peaked at ~3.0M players in 1997 and has declined 1.5–3%/yr while USSSA and Perfect Game boomed — the same kids moved to a format that costs 5–10x more.</li>' +
    '<li><strong>Facility supply.</strong> Over $9B has been invested in youth/amateur sports venues since 2017; tournament-recruiting sports commissions grew from 12 (1992) to 675+ (2014).</li>' +
    '<li><strong>Gear, where it did jump.</strong> Flagship BBCOR bats hit $500 by 2022 (high-end composites were ~$300–$400 in 2011), and rule changes in 2010/2018 forced fleet-wide re-purchases — ' +
    'real, but too small a category to move the total.</li>' +
    '</ul>' +

    '<h3>What is asserted but unquantified</h3>' +
    '<p class="method">Some of the most repeated claims have no measured series behind them: hours-per-week before 2019 ' +
    '(no survey measured it), “everyone buys private lessons now” (dollars are tracked, incidence over time is not), ' +
    '1990s tournament-count baselines (“travel ball was niche” is structurally true but uncounted), cheer uniform price history, ' +
    'and the claim that kit-refresh cycles are shortening (current 2-year cycles are documented; change over time is not). ' +
    'We flag these rather than chart them — <em>on this page, if it isn’t sourced, it isn’t plotted.</em></p>';

  /* category chart */
  var CATS = [
    { name: 'Travel', y2019: 196, y2024: 260 },
    { name: 'Private lessons', y2019: 134, y2024: 183 },
    { name: 'Registration', y2019: 125, y2024: 168 },
    { name: 'Equipment', y2019: 144, y2024: 154 },
    { name: 'Camps', y2019: 81, y2024: 111 }
  ];
  var catChart = null;
  function buildCategoryChart() {
    var t = V.theme();
    if (catChart) catChart.destroy();
    var ctx = document.getElementById('category-canvas');
    catChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: CATS.map(function (c) { return c.name; }),
        datasets: [
          {
            label: '2019',
            data: CATS.map(function (c) { return c.y2019; }),
            backgroundColor: t.nominal, borderRadius: 4, borderSkipped: false, barThickness: 14
          },
          {
            label: '2024',
            data: CATS.map(function (c) { return c.y2024; }),
            backgroundColor: t.real, borderRadius: 4, borderSkipped: false, barThickness: 14
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: {
            display: true, position: 'top', align: 'start',
            labels: { color: t.secondary, boxWidth: 12, boxHeight: 12, font: { size: 12 } }
          },
          tooltip: Object.assign(V.tooltipStyle(t), {
            callbacks: {
              label: function (item) {
                var c = CATS[item.dataIndex];
                var chg = c.y2024 / c.y2019 - 1;
                return ' ' + V.fmt$(item.parsed.x) + '  ' + item.dataset.label +
                  (item.dataset.label === '2024' ? ' (' + V.pct(chg, 0) + ' vs 2019, nominal)' : '');
              }
            }
          })
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: t.grid, lineWidth: 1, drawTicks: false },
            border: { display: false },
            ticks: { color: t.muted, font: { size: 11 }, callback: function (v) { return '$' + v; } }
          },
          y: {
            grid: { display: false }, border: { color: t.baseline },
            ticks: { color: t.secondary, font: { size: 12 } }
          }
        }
      }
    });
  }
  buildCategoryChart();
  window.rebuildContentCharts = buildCategoryChart;

  /* ---------- verdict table ---------- */
  var VERDICT_LABEL = {
    above: '▲ Above inflation',
    counter: '▽ Counter-example',
    unknown: '— Too thin to say'
  };

  (function verdictTable() {
    var tbl = document.getElementById('verdict-table');
    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['Sport', 'Survey points', 'Nominal change', 'Real change (2025$)', 'Verdict'].forEach(function (h) {
      var th = document.createElement('th'); th.textContent = h; hr.appendChild(th);
    });
    thead.appendChild(hr); tbl.appendChild(thead);
    var tbody = document.createElement('tbody');

    DATA.sports.forEach(function (s) {
      var tr = document.createElement('tr');
      var name = document.createElement('td'); name.textContent = s.name; tr.appendChild(name);

      var pts = document.createElement('td'); pts.className = 'num';
      pts.textContent = (s.series || []).length ? String(s.series.length) : '0';
      tr.appendChild(pts);

      var nom = document.createElement('td'); nom.className = 'num';
      var real = document.createElement('td'); real.className = 'num';
      var comparable = (s.series || []).filter(function (p) { return !p.frame_flag; });
      if (comparable.length >= 2) {
        var a = comparable[0], b = comparable[comparable.length - 1];
        var span = a.year + '–' + b.year;
        nom.textContent = V.pct(b.nominal / a.nominal - 1, 0) + ' (' + span + ')';
        real.textContent = V.pct(b.real / a.real - 1, 0);
      } else {
        nom.textContent = '—';
        real.textContent = '—';
      }
      tr.appendChild(nom); tr.appendChild(real);

      var v = document.createElement('td');
      var label = document.createElement('strong');
      label.textContent = VERDICT_LABEL[s.verdict] || s.verdict;
      v.appendChild(label);
      var sub = document.createElement('span'); sub.className = 'sub';
      sub.textContent = s.verdict_note || '';
      v.appendChild(sub);
      tr.appendChild(v);
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
  })();

  document.getElementById('verdict-prose').innerHTML =
    '<h3>Does the headline hold?</h3>' +
    '<p><strong>Yes, at the average.</strong> The Aspen series replicates: $693 (2019) → $1,016 (2024) is +47% nominal against ' +
    '+23% CPI — almost exactly “twice inflation,” or about <strong>+19% in real terms</strong> ' +
    srcRef('aspen2024') + srcRef('bls_cpi') + '. Recreation-services CPI (+21% over the window) and the “fees for lessons or ' +
    'instructions” index (+24%, including a 9.2% jump in 2023 alone) both lagged youth-sports spending too ' + srcRef('bls_sars') + srcRef('bls_serf03') + '.</p>' +
    '<h3>But per sport, the claim is only testable in three sports</h3>' +
    '<p><strong>Soccer (+38% real)</strong> and <strong>baseball (+37% real)</strong> clearly exceed inflation in the survey data. ' +
    '<strong>Ice hockey</strong> has no post-2019 survey point, but registration-platform data shows mid-tier (AA/A) club fees ' +
    'up 62.6% over 2015–2025 against CPI up roughly a third — above inflation, with the interesting twist that elite AAA fees ' +
    'only roughly matched inflation ' + srcRef('playmetrics2025') + '. <strong>Golf is the counter-example:</strong> AJGA junior ' +
    'tournament entry fees are unchanged since 2011 and membership fees were cut in 2022 — a substantial real-terms decline, under a ' +
    'sponsor-subsidized model ' + srcRef('ajga_fees') + '.</p>' +
    '<h3>Everywhere else, the honest answer is “the data doesn’t exist”</h3>' +
    '<p>Lacrosse, tennis, gymnastics, swimming, volleyball and cheer have at most one national survey point each. That is not a detail — ' +
    'it is the central finding. The sports with the heaviest consolidation (cheer, volleyball, lacrosse) are precisely the ones where ' +
    'no public price series exists to test the effect of that consolidation. A $40B market that reprices childhood is being measured ' +
    'by one survey, once every few years, in three sports.</p>' +
    '<h3>On the private-equity question</h3>' +
    '<p>The record supports a narrow, specific claim, not the broad one. <strong>Where an owner controls a bottleneck</strong> — Varsity’s ' +
    '~90% of all-star cheer competitions, a town’s only rink — there is verified or litigation-grade evidence of above-market pricing: ' +
    'the $320→$370 ice rate, the $4M/yr stay-to-play rebates, $126M in settlements ' + srcRef('usatoday_blackbear') + srcRef('okwatch_stayplay') + srcRef('varsity_litigation') + '. ' +
    '<strong>Where ownership is fragmented, the effect is undocumented</strong> — 3STEP’s 50+ club acquisitions have produced no public ' +
    'before/after price at all ' + srcRef('threestep') + '. And the independent control case (Dreams Park, +30% with no PE owner ' + srcRef('cooperstown_dp') + ') ' +
    'plus the category decomposition (services up ~35%, equipment up 7%) say most of the increase is families buying more travel, more ' +
    'lessons and more tournaments in an inflating service economy. PE is best supported as an <em>accelerant at chokepoints</em>, ' +
    'not the engine of the whole curve.</p>';

  /* ---------- methodology ---------- */
  document.getElementById('method-body').innerHTML =
    '<p><strong>Inflation adjustment.</strong> All “real” figures are constant 2025 dollars using BLS CPI-U all-items annual ' +
    'averages (series CUUR0000SA0) ' + srcRef('bls_cpi') + '. The combined chart also plots recreation-services CPI (CUUR0000SARS) ' + srcRef('bls_sars') + '; ' +
    'the closest single proxy for youth-sports fees, “fees for lessons or instructions” (CUUR0000SERF03), is cited in the text ' + srcRef('bls_serf03') + '.</p>' +
    '<p><strong>Surveys and fee schedules measure different things.</strong> Parent surveys (Aspen/Utah State) capture what families actually ' +
    'spent, averaged across rec and travel tiers — so they understate what a travel family pays. Published fee schedules capture list prices for ' +
    'specific clubs and events. We never mix the two in one series; fee evidence appears in the notes and verdicts, labeled as such.</p>' +
    '<p><strong>The 2022 wave is flagged, not hidden.</strong> Aspen’s fall-2022 survey used a TeamSnap app-user sample that skews toward ' +
    'organized-sport families; Aspen itself benchmarks its 46% claim from 2019 to 2024. We plot 2022 as open markers and exclude it from change calculations ' + srcRef('aspen2022') + '.</p>' +
    '<p><strong>CAGR</strong> is computed only where three or more survey points exist, from first to last comparable point. Sports with one point get no trend line, no interpolation, no extrapolation.</p>' +
    '<p><strong>PE event markers are annotations, not claims.</strong> A vertical tick marks an ownership event; it does not assert that the ' +
    'event caused any price movement. Correlation is not causation, and with 2–3 survey points per decade the charts could not demonstrate causation even where it exists.</p>' +
    '<p><strong>Verification caveat.</strong> Research for this page was performed in a sandboxed environment whose network proxy blocked direct page fetches; ' +
    'figures were verified against search-indexed excerpts of the cited pages (cross-checked across independent queries) rather than full-page reads. ' +
    'Every source URL is listed below so every number can be re-verified. Nothing on this page is estimated from memory; where a figure could not be sourced, it is absent and the gap is stated.</p>';

  /* ---------- sources list (data-driven: textContent) ---------- */
  (function sourcesList() {
    var ol = document.getElementById('sources-list');
    var ids = Object.keys(DATA.sources).sort(function (a, b) { return DATA.sources[a].n - DATA.sources[b].n; });
    ids.forEach(function (id) {
      var s = DATA.sources[id];
      var li = document.createElement('li');
      li.id = 'src-' + id;
      var strong = document.createElement('strong');
      strong.textContent = s.name + '. ';
      li.appendChild(strong);
      li.appendChild(document.createTextNode((s.method || '') + '. ' + (s.methodology || '') + ' '));
      var a = document.createElement('a');
      a.href = s.url; a.textContent = s.url; a.rel = 'noopener';
      li.appendChild(a);
      if (s.url2) {
        li.appendChild(document.createTextNode(' ; '));
        var a2 = document.createElement('a');
        a2.href = s.url2; a2.textContent = s.url2; a2.rel = 'noopener';
        li.appendChild(a2);
      }
      if (s.flag) {
        li.appendChild(document.createTextNode(' '));
        var fl = document.createElement('span');
        fl.className = 'flag';
        fl.textContent = '⚠ ' + s.flag + '.';
        li.appendChild(fl);
      }
      ol.appendChild(li);
    });
  })();
})();
