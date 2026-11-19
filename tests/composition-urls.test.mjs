import test from 'node:test'
import assert from 'node:assert/strict'
import { allocateCompositionSlug, compositionPath, compositionRedirect, CompositionSlugError, planCompositionSlugs } from '../src/lib/compositionUrls.ts'

const piece = { title: 'Dómítílà — Flow 1', yearOfComposition: '2026', instrumentation: 'Piano' }

test('a title becomes a readable Composition URL', async () => {
  const slug = await allocateCompositionSlug(piece, async () => false)
  assert.equal(compositionPath({ _id: '6a5a0716618510b0e7bc056a', slug }), '/music-catalog/domitila-flow-1')
})

test('apostrophes do not split a word in a readable URL', async () => {
  assert.equal(await allocateCompositionSlug({ ...piece, title: 'Ábụ̀ụ́ra Ónyé Ézè (The King’s Lullaby)' }, async () => false), 'abuura-onye-eze-the-kings-lullaby')
})

test('ordinary title edits retain the published URL', async () => {
  assert.equal(await allocateCompositionSlug({ ...piece, title: 'A different title', currentSlug: 'domitila-flow-1' }, async () => false), 'domitila-flow-1')
})

test('duplicates use a year, then instrumentation, then an edition', async () => {
  const taken = new Set(['domitila-flow-1'])
  assert.equal(await allocateCompositionSlug(piece, async (slug) => taken.has(slug)), 'domitila-flow-1-2026')
  taken.add('domitila-flow-1-2026')
  assert.equal(await allocateCompositionSlug(piece, async (slug) => taken.has(slug)), 'domitila-flow-1-2026-piano')
  taken.add('domitila-flow-1-2026-piano')
  assert.equal(await allocateCompositionSlug(piece, async (slug) => taken.has(slug)), 'domitila-flow-1-2026-piano-2')
})

test('an explicitly requested URL cannot take another Composition’s current or historical slug', async () => {
  await assert.rejects(allocateCompositionSlug({ ...piece, requestedSlug: 'old-title' }, async () => true), CompositionSlugError)
})

test('database IDs and empty normalized custom slugs are not accepted', async () => {
  for (const requestedSlug of ['6a5a0716618510b0e7bc056a', '!!!', 'x'.repeat(101)]) {
    await assert.rejects(allocateCompositionSlug({ ...piece, requestedSlug }, async () => false), CompositionSlugError)
  }
})

test('old IDs and previous slugs redirect directly to the current URL, without a loop', () => {
  const composition = { _id: '6a5a0716618510b0e7bc056a', slug: 'domitila-flow-1' }
  assert.equal(compositionRedirect(composition, '6a5a0716618510b0e7bc056a'), '/music-catalog/domitila-flow-1')
  assert.equal(compositionRedirect(composition, 'previous-title'), '/music-catalog/domitila-flow-1')
  assert.equal(compositionRedirect(composition, 'domitila-flow-1'), null)
  assert.equal(compositionRedirect({ _id: composition._id }, composition._id), null)
})

test('migration reserves existing and historical URLs before assigning duplicate titles', async () => {
  const plan = await planCompositionSlugs([
    { ...piece, _id: '1' },
    { ...piece, _id: '2', slug: 'new-title', urlSlugs: ['new-title', 'domitila-flow-1'] },
    { ...piece, _id: '3' },
  ])
  assert.deepEqual(plan.map(({ slug }) => slug), ['domitila-flow-1-2026', 'new-title', 'domitila-flow-1-2026-piano'])
})
