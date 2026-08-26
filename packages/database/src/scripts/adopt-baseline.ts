import { AppDataSource } from '../data-source'

const baseline: Record<string, string[]> = {
  User: ['id', 'email', 'name', 'password', 'created_at', 'current_plan', 'plan_status'],
  Document: ['id', 'user_id', 'title', 'file_path', 'file_size', 'total_pages', 'current_page', 'created_at'],
  Highlight: ['id', 'document_id', 'page_number', 'text_content', 'color_token', 'bounding_rects', 'created_at'],
  MarginNote: ['id', 'highlight_id', 'comment_text', 'updated_at'],
  Notebook: ['id', 'document_id', 'user_id', 'content_json', 'updated_at'],
  BillingCheckoutSession: ['id', 'user_id', 'provider', 'plan', 'status', 'external_id', 'external_reference'],
  BillingSubscription: ['id', 'user_id', 'provider', 'plan', 'status', 'external_subscription_id'],
  BillingWebhookEvent: ['id', 'provider', 'external_id', 'event_name', 'processed_at', 'raw_payload']
}

const run = async (): Promise<void> => {
  await AppDataSource.initialize()

  try {
    const q = AppDataSource.createQueryRunner()
    const differences: string[] = []
    for (const [name, columns] of Object.entries(baseline)) {
      const table = await q.getTable(name)
      if (!table) {
        differences.push(`tabela ${name}`)
        continue
      }
      for (const column of columns) if (!table.findColumnByName(column)) differences.push(`coluna ${name}.${column}`)
      if (!table.primaryColumns.some(column => column.name === 'id')) differences.push(`chave primária ${name}.id`)
    }
    if (differences.length) throw new Error(`Baseline incompatível; ausências: ${differences.join(', ')}`)

    await q.query(
      `CREATE TABLE IF NOT EXISTS "typeorm_migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_typeorm_migrations" PRIMARY KEY ("id"))`
    )
    await q.query(
      `INSERT INTO "typeorm_migrations" ("timestamp", "name") SELECT $1::bigint, $2::character varying WHERE NOT EXISTS (SELECT 1 FROM "typeorm_migrations" WHERE "name" = $2::character varying)`,
      [1779327423000, 'InitialSchema1779327423000']
    )
    await q.release()
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
