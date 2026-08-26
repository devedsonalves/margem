export const validateEnvironment = (environment: Record<string, unknown>): Record<string, unknown> => {
  const nodeEnv = String(environment.NODE_ENV || 'development')

  if (!environment.DATABASE_URL) throw new Error('DATABASE_URL is required')

  if (nodeEnv !== 'test' && (!environment.JWT_SECRET || String(environment.JWT_SECRET).length < 16)) {
    throw new Error('JWT_SECRET with at least 16 characters is required')
  }
  return environment
}
