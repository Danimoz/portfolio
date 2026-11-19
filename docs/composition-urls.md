# Readable Composition URLs

## Behaviour

- New Compositions automatically get a lowercase, hyphenated title-based URL, such as `/music-catalog/domitila-flow-1`.
- Duplicate titles add the year, then instrumentation, then an edition number when needed.
- The Studio Console provides an optional editable URL slug. Ordinary title edits, or leaving the slug empty when editing, preserve the existing URL.
- A deliberate slug change reserves both URLs. Every previous slug and the original database-ID link permanently redirects (HTTP 308) directly to the current URL.
- Current and historical slugs cannot be claimed by another Composition. Database-ID-shaped custom slugs are disallowed.
- Catalog links, canonical metadata, Open Graph, structured data, and the sitemap use the saved slug. Unmigrated content still works using its ID.
- Composition detail pages and the sitemap are dynamic, so publishing does not require a redeploy. Saves also invalidate the catalog, relevant URLs, and sitemap.

## Existing-content migration

Use Node 24 and the same `MONGODB_URI` as the intended deployment. Do not print or commit credentials.

```powershell
node --env-file=.env scripts/migrate-composition-slugs.mjs
node --env-file=.env scripts/migrate-composition-slugs.mjs --apply
```

The first command only prints the plan. Review titles and proposed URLs before applying. The second creates the unique URL reservation index and updates only URL fields plus the optimistic concurrency version. It checks that each record's URL fields/version still match the inspected snapshot, stops rather than overwriting concurrent edits, and is safe to rerun after a partial failure. Existing saved slugs and aliases are preserved. Run again without `--apply` to verify that no changes remain.

Deploy the slug-aware application before sharing new URLs. Old deployed versions still read records by ID, but cannot resolve the new URLs or maintain historical reservations. Avoid editing Compositions through an old deployment during migration.

## Verification

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Check a readable URL, its old ID URL (308 to the same canonical page), sitemap entries, and the Studio Console's slug field. Avoid synthetic writes to the production database when checking collision/edit behaviour.

After starting a production preview on port 3002, `node scripts/check-composition-urls.mjs` checks all five migrated records using read-only HTTP requests. Pass another origin as its first argument to test a deployment. URL changes require updating these catalog fixtures. The redirect check must use an actual HTTP response, not just observe browser navigation: streamed redirects can otherwise look successful while returning status 200. See [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) for the pre-render redirect API.

## Migration and QA record — 2026-11-19

Migrated all five records in the configured database, then verified a second dry run proposed zero changes:

| Composition | Saved slug |
| --- | --- |
| Slowly In Love | `slowly-in-love` |
| Anwuli | `anwuli` |
| Ábụ̀ụ́ra Ónyé Ézè (The King's Lullaby) | `abuura-onye-eze-the-kings-lullaby` |
| Domitila | `domitila` |
| Spirit of the Living God | `spirit-of-the-living-god` |

The production-preview HTTP checks passed for all five legacy redirects (308), readable pages (200), canonical tags, catalog links, and sitemap entries. Browser checks confirmed the saved slug appears in the edit form and the original Spirit of the Living God ID link loads its readable URL. Attempting to assign Domitila the existing `anwuli` slug returned the collision error and retained all form fields; this check made no database changes. Restored the unsaved form field afterward. Code deployment remains separate from the completed data migration.
