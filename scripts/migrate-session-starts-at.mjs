import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { Timestamp, collection, getDocs, updateDoc } from 'firebase/firestore'
import { madridCivilToInstant } from '../src/game-sessions/madridDateTime.ts'

const projectId = process.env.GCLOUD_PROJECT ?? 'demo-mesa-abierta'
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
const [host, portText] = firestoreHost.split(':')
const port = Number(portText)

if (!['127.0.0.1', 'localhost'].includes(host) || !Number.isInteger(port)) {
  throw new Error('La migración solo puede ejecutarse contra un Firestore Emulator local.')
}

const environment = await initializeTestEnvironment({
  projectId,
  firestore: { host, port },
})
const report = { migrated: 0, skipped: 0, errors: 0 }

try {
  await environment.withSecurityRulesDisabled(async (context) => {
    const snapshots = await getDocs(collection(context.firestore(), 'gameSessions'))
    for (const snapshot of snapshots.docs) {
      const data = snapshot.data()
      if (data.startsAt instanceof Timestamp) {
        report.skipped += 1
        continue
      }
      if (typeof data.date !== 'string' || typeof data.time !== 'string') {
        report.errors += 1
        console.error(`${snapshot.id}: no contiene date/time legacy válidos.`)
        continue
      }
      const result = madridCivilToInstant(data.date, data.time)
      if (!result.ok) {
        report.errors += 1
        console.error(`${snapshot.id}: ${result.reason}; no se ha modificado.`)
        continue
      }
      await updateDoc(snapshot.ref, {
        startsAt: Timestamp.fromDate(new Date(result.instant)),
      })
      report.migrated += 1
    }
  })
} finally {
  await environment.cleanup()
}

console.log(`Migración startsAt: ${report.migrated} migradas, ${report.skipped} omitidas, ${report.errors} con error.`)
if (report.errors > 0) process.exitCode = 1
