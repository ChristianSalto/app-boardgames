export type BetaAccessRepository = Readonly<{
  isActiveTester: (userId: string) => Promise<boolean>
}>

export const checkBetaAccess = (
  repository: BetaAccessRepository,
  userId: string,
) => repository.isActiveTester(userId)
