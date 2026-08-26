import { entities } from '@margem/database'
import { DataSource } from 'typeorm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databaseUrl = process.env.TEST_DATABASE_URL
const suite = databaseUrl ? describe : describe.skip

suite('TypeORM integration', () => {
  let source: DataSource
  beforeAll(async () => {
    source = new DataSource({ type: 'postgres', url: databaseUrl, entities, synchronize: false })
    await source.initialize()
  })
  afterAll(async () => source?.destroy())
  it('connects without schema synchronization', () => expect(source.options.synchronize).toBe(false))
})
