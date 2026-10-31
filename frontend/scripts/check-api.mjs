import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backendRoot = path.resolve(frontendRoot, '../backend')
const python = path.join(
  backendRoot,
  process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python',
)
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'cimer-api-'))
const env = {
  ...process.env,
  UPLOAD_DIR: path.join(temporary, 'uploads'),
  DATABASE_URL: 'sqlite:///' + path.join(temporary, 'test.db').split(path.sep).join('/'),
  JWT_SECRET_KEY: 'integration-test-key-only-not-a-production-secret',
}
const realFetch = globalThis.fetch
const storage = new Map()
globalThis.sessionStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
}
globalThis.window = new EventTarget()
let backend, vite
let log = ''
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function freePort() {
  const server = net.createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  await new Promise((resolve) => server.close(resolve))
  return port
}
const backendPort = await freePort()
async function stopBackend() {
  if (!backend) return
  if (backend.exitCode === null) {
    const exited = once(backend, 'exit')
    backend.kill()
    await exited
  }
  backend = undefined
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await realFetch('http://127.0.0.1:' + backendPort + '/live')
    } catch {
      return
    }
    await wait(100)
  }
  assert.fail('The owned backend did not stop before restart')
}
async function start() {
  backend = spawn(
    python,
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(backendPort)],
    { cwd: backendRoot, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  backend.on('error', (error) => {
    log += error.message
  })
  backend.stderr.on('data', (chunk) => {
    log = (log + chunk).slice(-4000)
  })
  let ready = false
  for (let i = 0; i < 100; i++) {
    try {
      if ((await realFetch('http://127.0.0.1:' + backendPort + '/ready')).ok) {
        ready = true
        break
      }
    } catch {}
    if (backend.exitCode !== null) break
    await wait(100)
  }
  assert.ok(ready, 'Backend did not start: ' + log)
  vite = await createServer({
    root: frontendRoot,
    logLevel: 'error',
    server: {
      host: '127.0.0.1',
      port: 0,
      proxy: { '/api': { target: 'http://127.0.0.1:' + backendPort, changeOrigin: true } },
    },
  })
  await vite.listen()
  const address = 'http://127.0.0.1:' + vite.httpServer.address().port
  globalThis.fetch = (url, options) => realFetch(new URL(url, address), options)
  const auth = (await vite.ssrLoadModule('/src/features/auth/api/auth-api.ts')).authApi
  const users = (await vite.ssrLoadModule('/src/features/users/api/users-api.ts')).usersApi
  const listings = (await vite.ssrLoadModule('/src/features/listings/api/listings-api.ts')).listingsApi
  const current = (await vite.ssrLoadModule('/src/lib/current-user-api.ts')).getCurrentProfile
  const media = (await vite.ssrLoadModule('/src/lib/media-api.ts')).mediaApi
  const favorites = (await vite.ssrLoadModule('/src/lib/favorites-api.ts')).favoritesApi
  const chat = (await vite.ssrLoadModule('/src/lib/chat-api.ts')).chatApi
  const messageId = (await vite.ssrLoadModule('/src/lib/message-id.ts')).createMessageId
  return { auth, users, listings, current, media, favorites, chat, messageId }
}
try {
  const migrated = spawnSync(python, ['manage.py', 'migrate'], {
    cwd: backendRoot,
    env,
    windowsHide: true,
    encoding: 'utf8',
  })
  assert.equal(migrated.status, 0, migrated.stderr)
  const encoded = spawnSync(
    python,
    [
      '-c',
      'from PIL import Image; import sys; Image.new("RGB", (24, 16), "purple").save(sys.stdout.buffer, "PNG")',
    ],
    { cwd: backendRoot, windowsHide: true },
  )
  assert.equal(encoded.status, 0, encoded.stderr.toString())
  const photo = () => new File([encoded.stdout], 'photo.png', { type: 'image/png' })
  const served = async (url, status = 200) => {
    const response = await fetch(url)
    assert.equal(response.status, status)
    if (status === 200) {
      assert.equal(response.headers.get('content-type'), 'image/webp')
      assert.ok((await response.arrayBuffer()).byteLength > 0)
    }
  }
  let app = await start()
  await assert.rejects(
    () => app.current(),
    (error) => error.status === 401,
  )
  const account = await app.auth.register({
    email: 'first@example.com',
    password: 'secret123',
    displayName: 'Prvi korisnik',
  })
  assert.ok(account.id)
  await assert.rejects(
    () => app.auth.login({ email: 'first@example.com', password: 'wrongpass' }),
    (error) => error.status === 401,
  )
  assert.equal(
    (await app.current()).email,
    'first@example.com',
    'Wrong credentials must not invalidate the existing session',
  )
  const profile = await app.users.updateCurrent({
    name: 'Novo ime',
    age: 25,
    occupation: 'Dizajner',
    city: 'Beograd',
    bio: 'Volim miran dom.',
    avatar: 'https://example.com/avatar.jpg',
  })
  const input = {
    title: 'Svijetla soba za novi početak',
    description: 'Prostrana soba u prijatnom zajedničkom stanu sa dovoljno prostora za rad i odmor.',
    price: 280,
    city: 'Beograd',
    neighborhood: 'Vračar',
    area: 18,
    roommates: 1,
    tags: ['Pet friendly', 'Wi-Fi'],
    kind: 'room',
    imageUrl: 'https://example.com/room.jpg',
    userId: 'forged-owner',
    name: 'Wrong author',
    age: 99,
    occupation: 'Wrong',
    avatar: '/ignored.svg',
  }
  const created = await app.listings.create(input)
  await app.favorites.save(created.id)
  await app.favorites.save(created.id)
  assert.deepEqual(await app.favorites.ids(), [created.id])
  assert.equal((await app.listings.listPage('', { favorites: true })).total, 1)
  assert.equal(created.userId, account.id)
  assert.equal(created.name, profile.name)
  assert.equal((await app.listings.listPage('', { mine: true })).total, 1)
  assert.equal(
    (await app.listings.listPage('', { city: 'Beograd', maxPrice: 300, petFriendly: true })).total,
    1,
  )
  assert.equal((await app.listings.listPage('', { maxPrice: 100 })).total, 0)
  assert.equal((await app.listings.listPage('', { ids: [] })).total, 0)
  const edited = await app.listings.update(created.id, {
    price: 210,
    title: 'Ažurirana soba za novi početak',
  })
  assert.equal(edited.id, created.id)
  assert.equal(edited.createdAt, created.createdAt)
  await app.users.updateCurrent({
    ...profile,
    name: 'Ažurirano ime',
    avatar: 'https://example.com/new-avatar.jpg',
  })
  const refreshed = await app.listings.get(created.id)
  assert.equal(refreshed.name, 'Ažurirano ime')
  assert.equal(refreshed.avatar, 'https://example.com/new-avatar.jpg')
  assert.equal(refreshed.imageUrl, input.imageUrl)
  const avatar = await app.media.upload(photo(), 'avatar')
  await app.users.updateCurrent({ avatar: avatar.url })
  const firstPhoto = await app.media.upload(photo(), 'listing')
  const secondPhoto = await app.media.upload(photo(), 'listing')
  const gallery = await app.listings.update(created.id, { imageUrls: [secondPhoto.url, firstPhoto.url] })
  assert.deepEqual(gallery.imageUrls, [secondPhoto.url, firstPhoto.url])
  assert.equal(gallery.imageUrl, secondPhoto.url)
  await served(avatar.url)
  await served(firstPhoto.url)
  await assert.rejects(
    () => app.media.remove(firstPhoto.id),
    (error) => error.status === 409,
  )
  await app.auth.register({
    email: 'second@example.com',
    password: 'secret123',
    displayName: 'Drugi korisnik',
  })
  assert.equal((await app.listings.listPage('', { mine: true })).total, 0)
  await assert.rejects(
    () => app.listings.update(created.id, { price: 1 }),
    (error) => error.status === 403,
  )
  await assert.rejects(
    () => app.listings.remove(created.id),
    (error) => error.status === 403,
  )
  await assert.rejects(
    () => app.users.updateCurrent({ avatar: avatar.url }),
    (error) => error.status === 403,
  )
  await assert.rejects(
    () => app.media.remove(firstPhoto.id),
    (error) => error.status === 403,
  )
  assert.deepEqual(await app.favorites.ids(), [])
  // Simulate the crypto interface on a phone accessing a private IP over HTTP.
  const lanCrypto = { getRandomValues: (values) => crypto.getRandomValues(values) }
  const generated = Array.from({ length: 1000 }, () => app.messageId(lanCrypto))
  assert.equal(new Set(generated).size, generated.length)
  for (const key of generated)
    assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.match(app.messageId(), /^[0-9a-f-]{36}$/)
  const firstMessageId = generated[0]
  const conversation = await app.chat.start(created.id, 'Hello from the second account', firstMessageId)
  assert.equal(
    (await app.chat.start(created.id, 'Hello from the second account', firstMessageId)).id,
    conversation.id,
  )
  assert.equal((await app.chat.history(conversation.id)).items.length, 1)
  // Restart both processes, retaining the database and uploaded photo files.
  await vite.close()
  vite = undefined
  await stopBackend()
  storage.clear()
  app = await start()
  await app.auth.login({ email: 'first@example.com', password: 'secret123' })
  assert.equal((await app.current()).name, 'Ažurirano ime')
  assert.equal((await app.listings.get(created.id)).price, 210)
  assert.equal((await app.listings.listPage('', { mine: true })).total, 1)
  assert.deepEqual(await app.favorites.ids(), [created.id])
  await app.favorites.remove(created.id)
  assert.deepEqual(await app.favorites.ids(), [])
  await app.favorites.save(created.id)
  assert.equal((await app.chat.unread()).count, 1)
  const storedMessages = await app.chat.history(conversation.id)
  assert.equal(storedMessages.items[0].body, 'Hello from the second account')
  await app.chat.read(conversation.id, storedMessages.items[0].id)
  assert.equal((await app.chat.unread()).count, 0)
  const replyKey = app.messageId({ getRandomValues: (values) => crypto.getRandomValues(values) })
  await app.chat.send(conversation.id, 'Hello, the room is available!', replyKey)
  await app.chat.send(conversation.id, 'Hello, the room is available!', replyKey)
  assert.equal((await app.chat.history(conversation.id)).items.length, 2)
  const roommate = await app.listings.create({ ...input, kind: 'roommate' })
  assert.equal(roommate.imageUrl, avatar.url)
  assert.equal((await app.current()).avatar, avatar.url)
  assert.deepEqual((await app.listings.get(created.id)).imageUrls, [secondPhoto.url, firstPhoto.url])
  await served(avatar.url)
  await served(secondPhoto.url)
  await app.listings.update(created.id, { imageUrls: [firstPhoto.url] })
  await served(secondPhoto.url, 404)
  await served(firstPhoto.url)
  await app.listings.remove(roommate.id)
  await app.listings.remove(created.id)
  await assert.rejects(
    () => app.listings.get(created.id),
    (error) => error.status === 404,
  )
  assert.equal((await app.chat.get(conversation.id)).listingId, null)
  assert.equal((await app.chat.history(conversation.id)).items.length, 2)
  assert.deepEqual(await app.favorites.ids(), [])
  await served(firstPhoto.url, 404)
  await app.users.updateCurrent({ avatar: '/profile-placeholder.svg' })
  await served(avatar.url, 404)
  const discarded = await app.media.upload(photo(), 'listing')
  await app.media.remove(discarded.id)
  await served(discarded.url, 404)
  storage.set('cimer-api-token', 'expired-or-invalid-token')
  await assert.rejects(
    () => app.current(),
    (error) => error.status === 401,
  )
  assert.equal(storage.get('cimer-api-token'), undefined)
  console.log(
    'API integration passed: real auth, Vite proxy, profiles, listing CRUD/filtering, ownership, persistent chat with replies/read counts, account favorites, photo upload/serving/gallery/cleanup and persistence after restarting both servers.',
  )
} finally {
  globalThis.fetch = realFetch
  if (vite) await vite.close()
  await stopBackend()
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()))
  assert.ok(path.basename(temporary).startsWith('cimer-api-'))
  await fs.rm(temporary, { recursive: true, force: true, maxRetries: 30, retryDelay: 100 })
}
