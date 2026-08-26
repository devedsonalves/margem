import { AppDataSource } from '../data-source'
const run = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') throw new Error('Seed não é permitido em produção')
  await AppDataSource.initialize()
  await AppDataSource.destroy()
}
run().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
