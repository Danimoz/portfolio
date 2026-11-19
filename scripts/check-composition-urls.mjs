import assert from 'node:assert/strict'

const base = process.argv[2] || 'http://localhost:3002'
const pieces = [
  ['6563658310f8282e1365ca52', 'slowly-in-love'],
  ['656369bdc9000ecefd7c6197', 'anwuli'],
  ['65996f3637998aac8e2e5fdb', 'abuura-onye-eze-the-kings-lullaby'],
  ['6a59fb764e3672e51e388791', 'domitila'],
  ['6a5a0716618510b0e7bc056a', 'spirit-of-the-living-god'],
]

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
const catalog = await (await fetch(`${base}/music-catalog`)).text()
for (const [id, slug] of pieces) {
  const path = `/music-catalog/${slug}`
  const old = await fetch(`${base}/music-catalog/${id}`, { redirect: 'manual' })
  console.log(`${id}: ${old.status}, location=${old.headers.get('location')}`)
  assert.equal(old.status, 308, 'Legacy URLs should send a permanent HTTP redirect')
  assert.equal(new URL(old.headers.get('location'), base).pathname, path)
  const page = await fetch(`${base}${path}`)
  assert.equal(page.status, 200)
  const html = await page.text()
  assert.match(html, new RegExp(`<link rel="canonical" href="https://[^\"]+${path}"`))
  assert.ok(sitemap.includes(path), 'Sitemap uses the canonical slug')
  assert.ok(!sitemap.includes(`/music-catalog/${id}`), 'Sitemap excludes legacy IDs')
  assert.ok(catalog.includes(`href="${path}"`), 'Catalog links use readable URLs')
}
console.log('All five readable pages, legacy redirects, catalog links, canonical tags, and sitemap entries passed.')
