export type RuntimeAccessEnvironment = Readonly<{
  mode: string
  firebaseProjectId?: string
  useFirebaseEmulators?: string
}>

export type RuntimeAccessPolicy = Readonly<{
  closedBetaEnabled: boolean
  registrationEnabled: boolean
}>

export const resolveRuntimeAccessPolicy = (
  environment: RuntimeAccessEnvironment,
): RuntimeAccessPolicy => {
  const closedBetaEnabled = environment.mode === 'cloud'
    && environment.firebaseProjectId === 'mesa-abierta-dev'
    && environment.useFirebaseEmulators === 'false'

  return {
    closedBetaEnabled,
    registrationEnabled: !closedBetaEnabled,
  }
}
