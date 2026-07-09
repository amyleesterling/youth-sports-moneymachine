# The Youth Sports Money Machine

**Live site: [amyleesterling.github.io/youth-sports-moneymachine](https://amyleesterling.github.io/youth-sports-moneymachine/)**

A single-page data investigation: how much are US club/travel youth sports costs actually
rising, and how much of that outruns inflation? Tested sport by sport — soccer, travel
baseball, competitive cheer, gymnastics, swimming, ice hockey, golf, lacrosse, tennis and
club volleyball — with private-equity acquisition events drawn on the charts so ownership
changes can be eyeballed against price inflections.

**Not advocacy — investigation.** Where the data supports the "PE is inflating youth
sports" narrative, the page says so; where it contradicts it (junior golf) or simply
doesn't exist (most sports), it says that instead. Gaps are treated as findings.

## Run it

Static site, no build step:

```
python3 -m http.server 8000   # or any static server
# open http://localhost:8000
```

## Structure

| Path | What it is |
|---|---|
| `index.html` | The page |
| `data/sources.json` | Canonical source registry — every figure's provenance, methodology, URL, and caveat flags |
| `data/sports.json` | Per-sport survey series, tier ranges, PE events, gaps, verdicts |
| `data/cpi.json` | BLS CPI annual averages (all items, recreation services, fees-for-lessons) |
| `js/data.js` | Generated bundle of the three data files (for `file://`-safe loading) |
| `tools/gen-data.js` | Regenerates `js/data.js` and integrity-checks every source reference — run after editing any data file |
| `vendor/chart.umd.js` | Chart.js 4.4.9, vendored (page is fully self-contained) |

## Data honesty rules

- No fabricated or interpolated data points. Sports with one survey point get one dot,
  no trend line, and no CAGR.
- Parent-survey data and published-fee-schedule data are never mixed in one series.
- The 2022 Aspen survey wave used a different sampling frame; it is plotted as open
  markers and excluded from change calculations.
- Real dollars are constant 2025 dollars via BLS CPI-U (CUUR0000SA0).
- PE event markers are annotations, not causal claims.
- Research was performed in a sandboxed environment that blocked direct page fetches;
  figures were verified against search-indexed excerpts of cited pages. All URLs are in
  `data/sources.json` for re-verification.
