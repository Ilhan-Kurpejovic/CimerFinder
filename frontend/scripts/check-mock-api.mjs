import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Isolated browser storage: these checks never touch the running demo's data.
const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
}
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { listingsApi } = await server.ssrLoadModule('/src/features/listings/api/listings-api.ts')
  const original = await listingsApi.list()
  assert.equal(original.length, 6)
  assert.equal((await listingsApi.list('GRBAVICA')).length, 2)
  assert.equal((await listingsApi.list('nonexistent neighborhood')).length, 0)
  const { id: _id, createdAt: _date, ...input } = original[0]
  const created = await listingsApi.create({ ...input, title: 'Test room publication', price: 190 })
  assert.equal((await listingsApi.get(created.id)).price, 190)
  assert.equal(JSON.parse(storage.get('cimer-listings'))[0].id, created.id)
  assert.equal((await listingsApi.list('Test room publication')).length, 1)
  await listingsApi.update(created.id, { price: 210 })
  assert.equal((await listingsApi.get(created.id)).price, 210)
  await listingsApi.remove(created.id)
  await assert.rejects(() => listingsApi.get(created.id), /does not exist/)
  assert.equal((await listingsApi.list()).length, original.length)
  assert.equal(JSON.parse(storage.get('cimer-listings')).length, original.length)
  console.log('Mock API: search, empty results, create, persistence, update, remove and missing IDs passed.')
} finally {
  await server.close()
}
