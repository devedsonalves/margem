import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1779327423000 implements MigrationInterface {
  name = 'InitialSchema1779327423000'
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "PlanCode" AS ENUM ('FREE', 'ESSENTIAL', 'PREMIUM')`)
    await q.query(`CREATE TYPE "PlanStatus" AS ENUM ('FREE', 'PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED')`)
    await q.query(`CREATE TYPE "BillingProvider" AS ENUM ('ASAAS')`)
    await q.query(`CREATE TYPE "CheckoutStatus" AS ENUM ('CREATED', 'PAID', 'EXPIRED', 'CANCELED')`)
    await q.query(`CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED')`)
    await q.query(
      `CREATE TABLE "User" ("id" text NOT NULL, "email" text NOT NULL, "name" text, "password" text NOT NULL DEFAULT '', "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "current_plan" "PlanCode" NOT NULL DEFAULT 'FREE', "plan_status" "PlanStatus" NOT NULL DEFAULT 'FREE', "plan_activated_at" TIMESTAMP(3), "plan_expires_at" TIMESTAMP(3), CONSTRAINT "User_email_key" UNIQUE ("email"), CONSTRAINT "User_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "Document" ("id" text NOT NULL, "user_id" text NOT NULL, "title" text NOT NULL, "file_path" text NOT NULL, "file_size" integer NOT NULL, "total_pages" integer NOT NULL, "current_page" integer NOT NULL DEFAULT 1, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "Document_file_path_key" UNIQUE ("file_path"), CONSTRAINT "Document_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "Highlight" ("id" text NOT NULL, "document_id" text NOT NULL, "page_number" integer NOT NULL, "text_content" text NOT NULL, "color_token" text NOT NULL, "bounding_rects" jsonb NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "MarginNote" ("id" text NOT NULL, "highlight_id" text NOT NULL, "comment_text" text NOT NULL, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "MarginNote_highlight_id_key" UNIQUE ("highlight_id"), CONSTRAINT "MarginNote_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "Notebook" ("id" text NOT NULL, "document_id" text, "user_id" text NOT NULL, "content_json" jsonb NOT NULL, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "Notebook_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "BillingCheckoutSession" ("id" text NOT NULL, "user_id" text NOT NULL, "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS', "plan" "PlanCode" NOT NULL, "status" "CheckoutStatus" NOT NULL DEFAULT 'CREATED', "external_id" text NOT NULL, "external_reference" text NOT NULL, "checkout_url" text NOT NULL, "amount_cents" integer NOT NULL, "currency" text NOT NULL DEFAULT 'BRL', "raw_response" jsonb NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "BillingCheckoutSession_external_id_key" UNIQUE ("external_id"), CONSTRAINT "BillingCheckoutSession_external_reference_key" UNIQUE ("external_reference"), CONSTRAINT "BillingCheckoutSession_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE TABLE "BillingSubscription" ("id" text NOT NULL, "user_id" text NOT NULL, "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS', "plan" "PlanCode" NOT NULL, "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'PENDING', "external_subscription_id" text, "external_customer_id" text, "latest_payment_id" text, "latest_checkout_id" text, "current_period_start" TIMESTAMP(3), "current_period_end" TIMESTAMP(3), "activated_at" TIMESTAMP(3), "canceled_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "BillingSubscription_external_subscription_id_key" UNIQUE ("external_subscription_id"), CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `CREATE INDEX "BillingSubscription_user_id_status_idx" ON "BillingSubscription" ("user_id", "status")`
    )
    await q.query(
      `CREATE TABLE "BillingWebhookEvent" ("id" text NOT NULL, "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS', "external_id" text NOT NULL, "event_name" text NOT NULL, "payment_id" text, "subscription_id" text, "processed_at" TIMESTAMP(3), "raw_payload" jsonb NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "BillingWebhookEvent_external_id_key" UNIQUE ("external_id"), CONSTRAINT "BillingWebhookEvent_pkey" PRIMARY KEY ("id"))`
    )
    await q.query(
      `ALTER TABLE "Document" ADD CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "MarginNote" ADD CONSTRAINT "MarginNote_highlight_id_fkey" FOREIGN KEY ("highlight_id") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "BillingCheckoutSession" ADD CONSTRAINT "BillingCheckoutSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await q.query(
      `ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }
  async down(q: QueryRunner): Promise<void> {
    for (const table of [
      'BillingWebhookEvent',
      'BillingSubscription',
      'BillingCheckoutSession',
      'Notebook',
      'MarginNote',
      'Highlight',
      'Document',
      'User'
    ])
      await q.query(`DROP TABLE "${table}" CASCADE`)
    for (const type of ['BillingSubscriptionStatus', 'CheckoutStatus', 'BillingProvider', 'PlanStatus', 'PlanCode'])
      await q.query(`DROP TYPE "${type}"`)
  }
}
