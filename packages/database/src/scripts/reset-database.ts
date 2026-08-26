import { AppDataSource } from '../data-source'
const run = async (): Promise<void> => {
  if (!['development', 'test'].includes(process.env.NODE_ENV || ''))
    throw new Error('db:reset exige NODE_ENV=development ou test')
  if (!/localhost|127\.0\.0\.1|_test|test_/i.test(process.env.DATABASE_URL || ''))
    throw new Error('db:reset recusou uma URL que não parece local/de teste')
  await AppDataSource.initialize()
  await AppDataSource.dropDatabase()
  await AppDataSource.runMigrations()
  await AppDataSource.destroy()
}
run().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
