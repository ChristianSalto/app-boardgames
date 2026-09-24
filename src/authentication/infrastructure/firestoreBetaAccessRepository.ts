import { doc, getDoc, type Firestore } from 'firebase/firestore'
import type { BetaAccessRepository } from '../application/betaAccess'

export const createFirestoreBetaAccessRepository = (
  firestore: Firestore,
): BetaAccessRepository => ({
  isActiveTester: async (userId) => {
    const snapshot = await getDoc(doc(firestore, 'betaTesters', userId))
    return snapshot.exists() && snapshot.data().active === true
  },
})
