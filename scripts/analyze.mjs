import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { uniqueById, groupByCause, ticketCause, readAs } from '../src/lib/kb/causes.ts';

const data = new URL('../src/lib/data/', import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, data), 'utf8'));
const rows = read('reports-4471.json');
const reports = uniqueById(rows).filter((r) => r.mergedInto === 4471);
const tenants = new Map(readdirSync(new URL('tenants/', data)).map((f) => {
  const tenant = read(`tenants/${f}`);
  return [tenant.handle, tenant];
}));
for (const row of rows) {
  assert.deepEqual(row, rows.find((r) => r.id === row.id), `Conflicting duplicate ${row.id}`);
}
const groups = groupByCause(reports, (r) => tenants.get(r.tenant));
assert.equal(reports.length, 412);
assert.equal(groups.reduce((n, g) => n + g.reports.length, 0), reports.length);
assert.ok(groups.every((g) => g.cause !== 'unplaced'), 'Unresolved tenant/cause');
const notes = read('desk-notes.json');
const summary = {
  source: 'kb-export-267efc5e.zip (exported 2026-10-04)',
  rawRows: rows.length,
  uniqueReports: reports.length,
  ticketCause: ticketCause(groups, 4471),
  groups: groups.map((g) => ({
    ...g,
    reportCount: g.reports.length,
    reports: g.reports.map((r) => r.id),
    oneDayMoveNotes: readAs(g, notes.oneDayMove),
    examples: g.reports.filter((r) => !notes.oneDayMove.includes(r.id)).slice(0, 3),
  })),
  oneDayMoveReports: reports.filter((r) => notes.oneDayMove.includes(r.id)),
};
mkdirSync(new URL('../evidence/', import.meta.url), { recursive: true });
writeFileSync(new URL('../evidence/analysis.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
const bars = summary.groups.map((g) => `<div class="row"><div class="label"><span>${g.cause === 'parser' ? 'Shared parser' : 'booking-v3 hint'}</span><strong>${g.reportCount}</strong></div><div class="track"><div class="bar ${g.cause}" style="width:${g.reportCount / reports.length * 100}%"></div></div></div>`).join('');
writeFileSync(new URL('../evidence/summary.html', import.meta.url), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ticket 4471: computed report assignments</title><style>
:root { color-scheme: light dark; font-family: var(--font-sans, system-ui); color: var(--foreground, #dedede); }
body { margin: 0; } h2 { font-size: 20px; margin: 0 0 8px; } p { line-height: 1.5; color: var(--muted-foreground, #a3a3a3); }
.chart { height: 164px; margin: 22px 0; } .row { margin: 0 0 24px; } .label { display: flex; justify-content: space-between; margin-bottom: 8px; }
.track { height: 24px; background: var(--secondary, #262626); border-radius: var(--radius, 6px); overflow: hidden; }
.bar { height: 24px; background: var(--chart-1, #69b1a0); } .hint { background: var(--chart-2, #d89e68); }
.note { border-left: 3px solid var(--warning, #d89e68); padding: 8px 16px; background: var(--warning-surface, #28231c); border-radius: var(--radius, 6px); }
</style></head><body>
<h2>Ticket #4471 · computed report assignments</h2>
<p>4 October export · ${reports.length} unique report IDs · repeated export rows excluded</p>
<div class="chart" role="img" aria-label="379 reports assigned to shared parser; 33 to booking-v3 hint. Five parser assignments require further investigation.">${bars}</div>
<p class="note">Five reports remain provisionally assigned to the parser group. Their descriptions require further investigation; these bars show the supplied classifier's assignments, not independently verified diagnoses of every report.</p>
<p>The signed KB review uses the export's actual Svelte cause table and queue chart. Public GitHub publication awaits approval.</p>
</body></html>\n`);
console.log(`Verified ${reports.length} unique reports; ${rows.length - reports.length} repeated export rows.`);
