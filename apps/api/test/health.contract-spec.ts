import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { HealthController } from '../src/modules/health/health.controller'

describe('health contract', () => {
  let app: INestApplication | undefined
  afterEach(async () => app?.close())
  it('preserves GET /health', async () => {
    const module = await Test.createTestingModule({ controllers: [HealthController] }).compile()
    app = module.createNestApplication()
    await app.init()
    const response = await request(app.getHttpServer()).get('/health').expect(200)
    expect(response.body).toMatchObject({ status: 'ok' })
    expect(response.body.timestamp).toEqual(expect.any(String))
  })
})
