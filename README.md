# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## Investigation additions

This working copy adds a signed incident review and a proposed replacement decision.
The original exported source files, including accepted decision 0001, remain unchanged.
The course export represents fictional support-desk records, not a live customer system.

- Review source: `src/routes/kb/incidents/4471-review/+page.svx`.
- Rendered review: `rendered/kb/incidents/4471-review/index.html`.
- Proposed decision: `src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`.
- Exact issue bodies: `issues.json`; readable copies: `issue-drafts/`.
- Report membership, provenance, examples, and uncertainty: `evidence/analysis.json`.

Reproduce with Node 24 and npm:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run check
```

The added build configuration compiles the supplied Svelte components and mdsvex pages,
then executes Svelte server rendering. It resolves the tenant-directory glob and computes
the cause table and queue timeline from the exported data. Rendered HTML includes component
CSS and relative links, so it can be opened directly without a server. It is a rendered
snapshot; interactive components on historical pages are not hydrated in this static copy.

The classifier assigns five reports to the parser group despite unusual descriptions.
The review and parser issue retain those reports in the computed count and flag their
individual diagnoses as provisional. Neither a shipped fix nor a current live-queue total
is established by this snapshot. Decision 0002 awaits support-desk acceptance.
