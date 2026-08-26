import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBillingUpdatedAtDefaults1787745600000 implements MigrationInterface {
  name = 'AddBillingUpdatedAtDefaults1787745600000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "BillingCheckoutSession" ALTER COLUMN "updated_at" SET DEFAULT now()`
    )
    await queryRunner.query(
      `ALTER TABLE "BillingSubscription" ALTER COLUMN "updated_at" SET DEFAULT now()`
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "BillingSubscription" ALTER COLUMN "updated_at" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "BillingCheckoutSession" ALTER COLUMN "updated_at" DROP DEFAULT`
    )
  }
}
