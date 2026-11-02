import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const summary = JSON.parse(read('evidence/analysis.json'));
const issues = JSON.parse(read('issues.json'));
const ids = summary.groups.flatMap((g) => g.reports);
assert.equal(new Set(ids).size, summary.uniqueReports, 'Each report must be assigned once');
assert.equal(ids.length, summary.uniqueReports, 'No report double counting');
assert.equal(issues.length, summary.groups.length, 'One issue per computed failure path');
for (const group of summary.groups) {
  const issue = issues.find((i) => i.cause === group.cause);
  assert.equal(issue.reportCount, group.reportCount);
  assert.ok(issue.body.includes(String(group.reportCount)), 'Issue must state the report count');
}
for (const route of ['incidents/4471-review', 'decisions/0002-dedupe-by-cause']) {
  const source = read(`src/routes/kb/${route}/+page.svx`);
  const signature = source.match(/^signature: '([^']+)'/m)?.[1];
  assert.ok(signature, 'Page signature required');
  const html = read(`rendered/kb/${route}/index.html`);
  assert.ok(html.includes(deskRef(signature)), 'Rendered signature must match source metadata');
  assert.ok(!html.includes('no desk ref:'), 'Unsigned output');
  assert.ok(html.includes('<style'), 'Rendered page must include component styling');
  assert.ok(!html.includes('undefined') && !html.includes('NaN'), 'Broken rendered value');
}
const review = read('rendered/kb/incidents/4471-review/index.html');
assert.match(review, /<td[^>]*>379<\/td>/);
assert.match(review, /<td[^>]*>33<\/td>/);
assert.ok(review.includes('5 reports read as a one-day move'));
assert.ok(review.includes('<svg') && review.includes('received ·'), 'Real queue chart required');
assert.ok(review.includes('2026-04-01') && review.includes('2026-10-04'), 'Source date range required');
for (const id of summary.oneDayMoveReports.map((r) => r.id)) assert.ok(review.includes(id));
assert.ok(read('src/routes/kb/decisions/0001-dedupe-by-subject/+page.svx').includes('status: accepted'));
console.log('Checked report coverage, issue counts, rendered table, chart, signatures, and uncertainty notes.');
