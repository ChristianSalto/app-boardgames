import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

const projectId = 'demo-mesa-abierta'
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
const [host, portText] = firestoreHost.split(':')
const port = Number(portText)

if (!['127.0.0.1', 'localhost'].includes(host) || !Number.isInteger(port)) {
  throw new Error('La semilla solo puede ejecutarse contra un Firestore Emulator local.')
}

const cover = (title, background, foreground) => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="${background}"/><circle cx="675" cy="115" r="92" fill="${foreground}" opacity=".14"/><path d="M80 90h640v330H80z" fill="none" stroke="${foreground}" stroke-width="10" opacity=".3"/><text x="70" y="275" fill="${foreground}" font-family="Georgia,serif" font-size="58" font-weight="700">${title}</text><text x="72" y="370" fill="${foreground}" font-family="Arial,sans-serif" font-size="22" letter-spacing="5">MESA ABIERTA</text></svg>`,
)}`

const fixtures = [
  ['catan', 'Catan', 'sale', 'likeNew', 'Chamberí', 2400, '#d7e6dc', '#153c31'],
  ['dune', 'Dune: Imperium', 'trade', 'good', 'Retiro', null, '#f5ded5', '#973e25'],
  ['wingspan', 'Wingspan', 'sale', 'new', 'Centro', 3600, '#f6e8c5', '#6d4a08'],
  ['brass', 'Brass: Birmingham', 'sale', 'used', 'Arganzuela', 2800, '#dce9ed', '#426f7d'],
  ['root', 'Root', 'trade', 'likeNew', 'Moncloa', null, '#eadfd5', '#5d493b'],
  ['azul', 'Azul', 'sale', 'good', 'Salamanca', 1900, '#dbe6ef', '#28536b'],
  ['ark-nova', 'Ark Nova', 'sale', 'likeNew', 'Getafe', 4200, '#dfe8d5', '#365330'],
  ['seven-wonders', '7 Wonders', 'trade', 'used', 'Alcobendas', null, '#f1dfce', '#7b432c'],
  ['terraforming', 'Terraforming Mars', 'sale', 'good', 'Chamberí', 3100, '#e8d9cf', '#6c3828'],
  ['castillos', 'Los Castillos de Borgoña: Edición especial', 'trade', 'new', 'Retiro', null, '#e5ded1', '#4a554f'],
  ['cascadia', 'Cascadia', 'sale', 'likeNew', 'Centro', 2200, '#dbe8df', '#275743'],
  ['tripulacion', 'La tripulación: Misión mar profundo', 'sale', 'used', 'Arganzuela', 1200, '#dce3ec', '#304f73'],
]

const testEnvironment = await initializeTestEnvironment({
  projectId,
  firestore: { host, port },
})

try {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore()
    await Promise.all(fixtures.map(([id, gameName, listingType, condition, district, priceInCents, background, foreground], index) => {
      const listing = {
        ownerId: 'visual-seed-owner',
        gameName,
        imageUrl: cover(gameName, background, foreground),
        description: `Fixture visual de ${gameName} para validar el grid de Juegos de la comunidad.`,
        condition,
        listingType,
        city: 'Madrid',
        district,
        status: 'active',
        createdAt: Timestamp.fromDate(new Date(Date.UTC(2026, 8, 14, 18, 0, 0) - index * 60_000)),
        ...(priceInCents === null ? {} : { priceInCents }),
      }
      return setDoc(doc(firestore, 'gameListings', `visual-seed-${id}`), listing)
    }))
  })
  console.log(`${fixtures.length} anuncios visuales cargados en Firestore Emulator (${projectId}).`)
} finally {
  await testEnvironment.cleanup()
}
