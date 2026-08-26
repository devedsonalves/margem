import 'reflect-metadata'
import path from 'node:path'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { entities } from './entities'

config({ path: path.resolve(process.cwd(), '../../.env') })
config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities,
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
  extra: { max: Number(process.env.DB_POOL_SIZE || 10), idleTimeoutMillis: 30_000 }
})
