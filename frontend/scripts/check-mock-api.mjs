import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Isolated browser storage: these checks never touch the running demo's data.
const storage = new Map()
let failWrites = false
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => {
    if (failWrites) throw new Error('Storage full')
    storage.set(key, value)
  },
}
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { listingsApi } = await server.ssrLoadModule('/src/features/listings/api/listings-api.ts')
  const { usersApi } = await server.ssrLoadModule('/src/features/users/api/users-api.ts')
  const { signIn, signOut } = await server.ssrLoadModule('/src/lib/profile-store.ts')
  const original = await listingsApi.list()
  assert.equal(original.length, 6)
  assert.equal((await listingsApi.list('GRBAVICA')).length, 2)
  assert.equal((await listingsApi.list('nonexistent neighborhood')).length, 0)
  const { id: _id, createdAt: _date, ...input } = original[0]
  await assert.rejects(() => listingsApi.create(input), /profil/)
  const firstUser = signIn(' First@Example.com ')
  assert.equal(firstUser.id, 'first@example.com')
  await assert.rejects(() => listingsApi.create(input), /profil/)
  await usersApi.updateCurrent({
    name: 'First User',
    age: 25,
    occupation: 'Designer',
    city: 'Beograd',
    bio: 'I enjoy shared cooking.',
    avatar: '/first-avatar.svg',
  })
  const created = await listingsApi.create({ ...input, title: 'Test room publication', price: 190 })
  assert.equal((await listingsApi.get(created.id)).price, 190)
  assert.equal(created.userId, firstUser.id)
  assert.equal(created.name, 'First User')
  const roommate = await listingsApi.create({
    ...input,
    kind: 'roommate',
    name: 'Forged author',
    userId: 'someone-else',
  })
  assert.equal(roommate.name, 'First User')
  assert.equal(roommate.imageUrl, '/first-avatar.svg')
  assert.equal(roommate.userId, firstUser.id)
  assert.ok(
    !storage.get('cimer-listings').includes('/first-avatar.svg'),
    'Profile photos should not be duplicated in listing storage',
  )
  assert.equal(
    JSON.parse(storage.get('cimer-listings')).find((item) => item.id === created.id).userId,
    firstUser.id,
  )
  assert.equal((await listingsApi.list('Test room publication')).length, 1)
  await usersApi.updateCurrent({
    name: 'Updated User',
    age: 26,
    occupation: 'Architect',
    city: 'Novi Sad',
    bio: 'Updated biography',
    avatar: '/new-avatar.svg',
  })
  const updated = await listingsApi.get(created.id)
  assert.equal(updated.name, 'Updated User')
  assert.equal(updated.avatar, '/new-avatar.svg')
  assert.equal(updated.authorBio, 'Updated biography')
  assert.equal(updated.imageUrl, input.imageUrl, 'Room photography must remain independent')
  assert.equal((await listingsApi.get(roommate.id)).imageUrl, '/new-avatar.svg')
  assert.equal((await listingsApi.list('Updated User')).length, 2)
  assert.equal(
    (await listingsApi.get(1)).name,
    original[0].name,
    'Legacy listings must not be assigned by matching names',
  )
  failWrites = true
  assert.throws(
    () =>
      usersApi.updateCurrent({
        name: 'Unsaved',
        age: 26,
        occupation: 'Architect',
        city: '',
        bio: '',
        avatar: '',
      }),
    /Storage full/,
  )
  failWrites = false
  assert.equal((await usersApi.getCurrent()).name, 'Updated User')
  signOut()
  await assert.rejects(() => usersApi.updateCurrent({}), /Prijavi/)
  signIn('other@example.com')
  assert.equal((await listingsApi.list()).filter((item) => item.userId === 'other@example.com').length, 0)
  await assert.rejects(() => listingsApi.update(created.id, { title: 'Not mine' }), /svoje/)
  await assert.rejects(() => listingsApi.remove(created.id), /svoje/)
  const restored = signIn('FIRST@example.com')
  assert.equal(restored.name, 'Updated User')
  assert.equal(restored.avatar, '/new-avatar.svg')
  assert.equal((await listingsApi.list()).filter((item) => item.userId === restored.id).length, 2)
  await listingsApi.update(created.id, { price: 210 })
  assert.equal((await listingsApi.get(created.id)).price, 210)
  failWrites = true
  assert.throws(() => listingsApi.remove(created.id), /Storage full/)
  failWrites = false
  assert.equal(
    (await listingsApi.get(created.id)).id,
    created.id,
    'Failed deletion must preserve the listing',
  )
  await listingsApi.remove(created.id)
  await listingsApi.remove(roommate.id)
  await assert.rejects(() => listingsApi.get(created.id), /does not exist/)
  await assert.rejects(() => listingsApi.remove(created.id), /does not exist/)
  assert.equal((await listingsApi.list()).length, original.length)
  assert.equal(JSON.parse(storage.get('cimer-listings')).length, original.length)
  console.log(
    'Mock API: search, CRUD, profile propagation, independent room photos, ownership, account switching, storage failures and persistence passed.',
  )
} finally {
  await server.close()
}
