CREATE TYPE "PlanCode" AS ENUM ('FREE', 'ESSENTIAL', 'PREMIUM');
CREATE TYPE "PlanStatus" AS ENUM ('FREE', 'PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "BillingProvider" AS ENUM ('ASAAS');
CREATE TYPE "CheckoutStatus" AS ENUM ('CREATED', 'PAID', 'EXPIRED', 'CANCELED');
CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

ALTER TABLE "User"
  ADD COLUMN "current_plan" "PlanCode" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "plan_status" "PlanStatus" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "plan_activated_at" TIMESTAMP(3),
  ADD COLUMN "plan_expires_at" TIMESTAMP(3);

CREATE TABLE "BillingCheckoutSession" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS',
  "plan" "PlanCode" NOT NULL,
  "status" "CheckoutStatus" NOT NULL DEFAULT 'CREATED',
  "external_id" TEXT NOT NULL,
  "external_reference" TEXT NOT NULL,
  "checkout_url" TEXT NOT NULL,
  "amount_cents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "raw_response" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingCheckoutSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingSubscription" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS',
  "plan" "PlanCode" NOT NULL,
  "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
  "external_subscription_id" TEXT,
  "external_customer_id" TEXT,
  "latest_payment_id" TEXT,
  "latest_checkout_id" TEXT,
  "current_period_start" TIMESTAMP(3),
  "current_period_end" TIMESTAMP(3),
  "activated_at" TIMESTAMP(3),
  "canceled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingWebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL DEFAULT 'ASAAS',
  "external_id" TEXT NOT NULL,
  "event_name" TEXT NOT NULL,
  "payment_id" TEXT,
  "subscription_id" TEXT,
  "processed_at" TIMESTAMP(3),
  "raw_payload" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingCheckoutSession_external_id_key" ON "BillingCheckoutSession"("external_id");
CREATE UNIQUE INDEX "BillingCheckoutSession_external_reference_key" ON "BillingCheckoutSession"("external_reference");
CREATE UNIQUE INDEX "BillingSubscription_external_subscription_id_key" ON "BillingSubscription"("external_subscription_id");
CREATE INDEX "BillingSubscription_user_id_status_idx" ON "BillingSubscription"("user_id", "status");
CREATE UNIQUE INDEX "BillingWebhookEvent_external_id_key" ON "BillingWebhookEvent"("external_id");

ALTER TABLE "BillingCheckoutSession" ADD CONSTRAINT "BillingCheckoutSession_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
