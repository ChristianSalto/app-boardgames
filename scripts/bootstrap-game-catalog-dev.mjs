import { readFileSync } from 'node:fs'
import { generateKeyPairSync } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { initialCatalogGames } from '../src/games/initialCatalogGames.ts'
import { isValidGameId, isValidGameName } from '../src/games/domain/game.ts'

const DEV_PROJECT = 'mesa-abierta-dev'
const EMULATOR_PROJECT = 'demo-mesa-abierta-game-catalog-bootstrap-tests'
const EMULATOR_HOST = '127.0.0.1:8180'

export function parseOptions(args, env = process.env) {
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index]
    if (flag === '--dry-run' || flag === '--apply' || flag === '--emulator') {
      if (options[flag]) throw new Error(`Duplicate ${flag}`)
      options[flag] = true
      continue
    }
    if (flag !== '--project' && flag !== '--confirm-project') throw new Error(`Unknown argument: ${flag}`)
    if (options[flag] !== undefined || !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error(`Missing or duplicate ${flag}`)
    }
    options[flag] = args[++index]
  }
  if (Boolean(options['--dry-run']) === Boolean(options['--apply'])) {
    throw new Error('Choose exactly one of --dry-run or --apply')
  }
  const project = options['--emulator'] ? EMULATOR_PROJECT : DEV_PROJECT
  if (options['--project'] !== project) throw new Error(`Explicit --project ${project} is required`)
  if (options['--apply'] && options['--confirm-project'] !== project) {
    throw new Error(`Apply requires --confirm-project ${project}`)
  }
  if (options['--dry-run'] && options['--confirm-project']) {
    throw new Error('--confirm-project is only accepted with --apply')
  }
  for (const key of ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT']) {
    if (env[key] && env[key] !== project) throw new Error(`${key} conflicts with --project`)
  }
  if (env.FIREBASE_CONFIG) {
    let configured
    try { configured = JSON.parse(env.FIREBASE_CONFIG) } catch { throw new Error('Ambiguous FIREBASE_CONFIG') }
    if (configured.projectId !== project) throw new Error('FIREBASE_CONFIG conflicts with --project')
  }
  if (options['--emulator']) {
    if (env.FIRESTORE_EMULATOR_HOST !== EMULATOR_HOST) {
      throw new Error(`Emulator mode requires FIRESTORE_EMULATOR_HOST=${EMULATOR_HOST}`)
    }
  } else {
    if (env.FIRESTORE_EMULATOR_HOST) throw new Error('DEV mode rejects FIRESTORE_EMULATOR_HOST')
    if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('DEV mode requires GOOGLE_APPLICATION_CREDENTIALS for a DEV service account')
    }
  }
  return { project, mode: options['--apply'] ? 'APPLY' : 'DRY-RUN', emulator: Boolean(options['--emulator']) }
}

function credentialForDev(env) {
  let account
  try { account = JSON.parse(readFileSync(resolve(env.GOOGLE_APPLICATION_CREDENTIALS), 'utf8')) } catch {
    throw new Error('Cannot read service account JSON from GOOGLE_APPLICATION_CREDENTIALS')
  }
  if (account?.type !== 'service_account' || account.project_id !== DEV_PROJECT ||
    !account.client_email || !account.private_key) {
    throw new Error('Service account JSON must belong to mesa-abierta-dev')
  }
  return account
}

function expectedDocuments() {
  if (initialCatalogGames.length !== 8) throw new Error('Initial catalog must contain exactly eight games')
  const ids = new Set()
  for (const game of initialCatalogGames) {
    if (!isValidGameId(game.id) || ids.has(game.id) || !isValidGameName(game.name) ||
      game.name !== game.name.trim() || game.aliases !== undefined) {
      throw new Error(`Invalid initial catalog entry: ${game.id}`)
    }
    ids.add(game.id)
  }
  return initialCatalogGames.map(({ id, name }) => ({ id, document: { name } }))
}

export async function run(args = process.argv.slice(2), env = process.env) {
  const options = parseOptions(args, env)
  const expected = expectedDocuments()
  const credentials = options.emulator ? undefined : credentialForDev(env)
  // All destination and credential checks precede loading the privileged SDK.
  const [{ initializeApp, cert, deleteApp }, { getFirestore }] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/firestore'),
  ])
  const app = initializeApp(options.emulator
    ? { projectId: options.project, credential: cert({ projectId: options.project, clientEmail: 'emulator@local.invalid', privateKey: generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }) }) }
    : { projectId: options.project, credential: cert(credentials) })
  try {
    const db = getFirestore(app)
    const collection = db.collection('games')
    const snapshot = await collection.get()
    const existing = new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]))
    const create = []
    const unchanged = []
    const conflict = []
    for (const item of expected) {
      const value = existing.get(item.id)
      if (value === undefined) create.push(item)
      else if (Object.keys(value).length === 1 && value.name === item.document.name) unchanged.push(item)
      else conflict.push(item)
    }
    const expectedIds = new Set(expected.map(({ id }) => id))
    const extra = snapshot.docs.map(({ id }) => id).filter((id) => !expectedIds.has(id)).sort()
    console.log(`Project: ${options.project}`)
    console.log(`Mode: ${options.mode}${options.emulator ? ' (EMULATOR)' : ''}`)
    for (const [label, entries] of [
      ['CREATE', create.map(({ id }) => id)],
      ['UNCHANGED', unchanged.map(({ id }) => id)],
      ['CONFLICT', conflict.map(({ id }) => id)],
      ['EXTRA', extra],
    ]) console.log(`${label}: ${entries.length}${entries.length ? ` [${entries.join(', ')}]` : ''}`)
    console.log(`Total: ${expected.length}`)
    if (conflict.length || extra.length) throw new Error('Conflict or extra documents: no write performed')
    if (options.mode === 'DRY-RUN') return
    if (create.length) {
      const batch = db.batch()
      for (const { id, document } of create) batch.create(collection.doc(id), document)
      await batch.commit()
    }
    const verified = await collection.get()
    const verifiedById = new Map(verified.docs.map((doc) => [doc.id, doc.data()]))
    if (verified.size !== expected.length || expected.some(({ id, document }) => {
      const value = verifiedById.get(id)
      return !value || Object.keys(value).length !== 1 || value.name !== document.name
    })) throw new Error('Post-apply verification failed')
    console.log(`Applied: ${create.length} created; ${unchanged.length} unchanged`)
  } finally {
    await deleteApp(app)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run().catch((error) => {
    console.error(`Bootstrap failed: ${error.message}`)
    process.exitCode = 1
  })
}


