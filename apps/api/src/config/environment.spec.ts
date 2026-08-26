import { describe, expect, it } from 'vitest'
import { validateEnvironment } from './environment'

describe('validateEnvironment', () => {
  it('fails fast without a database URL', () =>
    expect(() => validateEnvironment({ NODE_ENV: 'production', JWT_SECRET: 'a-secure-secret-value' })).toThrow(
      'DATABASE_URL'
    ))

  it('fails fast with an insecure JWT secret', () =>
    expect(() =>
      validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'postgres://localhost/db', JWT_SECRET: 'short' })
    ).toThrow('JWT_SECRET'))

  it('accepts a test environment without a JWT secret', () =>
    expect(validateEnvironment({ NODE_ENV: 'test', DATABASE_URL: 'postgres://localhost/db_test' })).toBeTruthy())
})
