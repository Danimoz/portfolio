# Stable Composition URLs

Compositions use an editable, persisted title-based slug rather than deriving their URL on every read. Ordinary title edits preserve the slug; intentional URL changes permanently redirect every previous slug and the original database-ID URL to the current URL.

Reserve the current slug and all previous slugs together in `urlSlugs`, protected by a unique MongoDB multikey index. Separate indexes on current and historical slugs would allow one Composition to claim another's old URL. Historical slugs therefore cannot be reused by another Composition, even after a rename. Slugs resembling database IDs are reserved to keep legacy lookup unambiguous. Unmigrated records remain accessible by ID until the explicit, idempotent migration runs; reads never mutate content.

Resolve redirects in Next.js Proxy before rendering, not only in the page: the shared loading boundary otherwise streams HTTP 200 before `permanentRedirect` can send a 308. This adds a small indexed URL lookup to Composition requests; it keeps redirect behaviour independent of rendering/streaming. Database failures return a non-cacheable 503 rather than a false permanent destination.
