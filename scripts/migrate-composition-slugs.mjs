import mongoose from 'mongoose'
import { planCompositionSlugs } from '../src/lib/compositionUrls.ts'

const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required. Run with --env-file=.env or provide the environment variable.')

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  const compositions = mongoose.connection.collection('compositions')
  const records = await compositions.find({}, {
    projection: { title: 1, yearOfComposition: 1, instrumentation: 1, slug: 1, urlSlugs: 1, __v: 1 },
  }).sort({ _id: 1 }).toArray()
  const plan = await planCompositionSlugs(records)
  const changes = plan.filter((entry, index) => entry.slug !== records[index].slug || JSON.stringify(entry.urlSlugs) !== JSON.stringify(records[index].urlSlugs))
  console.table(changes.map((entry) => ({ id: entry._id.toString(), title: entry.title, slug: entry.slug })))
  console.log(`${apply ? 'Applying' : 'Dry run:'} ${changes.length} of ${records.length} Compositions need changes.`)

  if (apply) {
    await compositions.createIndex({ urlSlugs: 1 }, { unique: true, sparse: true, name: 'composition_url_slugs' })
    for (const entry of changes) {
      const original = records.find((record) => record._id.equals(entry._id))
      const result = await compositions.updateOne({
        _id: entry._id,
        slug: original.slug === undefined ? { $exists: false } : original.slug,
        urlSlugs: original.urlSlugs === undefined ? { $exists: false } : original.urlSlugs,
        __v: original.__v === undefined ? { $exists: false } : original.__v,
      }, { $set: { slug: entry.slug, urlSlugs: entry.urlSlugs }, $inc: { __v: 1 } })
      if (result.modifiedCount !== 1) throw new Error(`Composition ${entry._id} changed during migration. No content was overwritten; rerun to plan remaining changes.`)
    }
    console.log('Migration complete. Previous database-ID links remain supported.')
  } else {
    console.log('No database writes were made. Add --apply to apply this plan.')
  }
} catch (error) {
  // Connection errors may contain credentials; report a safe summary only.
  console.error(`Migration failed (${error?.code ?? error?.name ?? 'unknown error'}).`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
