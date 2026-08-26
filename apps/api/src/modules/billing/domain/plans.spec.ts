import { describe, expect, it } from 'vitest'
import { getPaidPlan, getPlan, serializePlan } from './plans'

describe('billing plans', () => {
  it('falls back to FREE', () => expect(getPlan('unknown').code).toBe('FREE'))
  it('allows checkout only for paid plans', () => {
    expect(getPaidPlan('FREE')).toBeNull()
    expect(getPaidPlan('PREMIUM')?.priceCents).toBe(990)
  })
  it('serializes currency and interval', () =>
    expect(serializePlan(getPlan('FREE'))).toMatchObject({ currency: 'BRL', interval: 'MONTHLY' }))
})
