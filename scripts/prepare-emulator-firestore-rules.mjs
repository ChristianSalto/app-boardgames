import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const sourcePath = fileURLToPath(new URL('../firestore.rules', import.meta.url))
const outputDirectory = fileURLToPath(new URL('../.firebase', import.meta.url))
const outputPath = fileURLToPath(new URL('../.firebase/firestore.emulator.rules', import.meta.url))

const cloudAccessGate = `    function hasActiveBetaAccess() {
      return isAuthenticated()
        && exists(betaTesterPath(request.auth.uid))
        && get(betaTesterPath(request.auth.uid)).data.active == true;
    }`

const localAccessGate = `    function hasActiveBetaAccess() {
      return isAuthenticated();
    }`

const cloudRules = await readFile(sourcePath, 'utf8')
if (!cloudRules.includes(cloudAccessGate)) {
  throw new Error(`No se encontró el guard cloud esperado en ${sourcePath}.`)
}

await mkdir(outputDirectory, { recursive: true })
await writeFile(
  outputPath,
  cloudRules.replace(cloudAccessGate, localAccessGate),
  'utf8',
)

console.log(`Rules locales preparadas desde ${projectRoot}: ${outputPath}`)
