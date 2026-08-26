import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BillingCheckoutSession, BillingSubscription, BillingWebhookEvent, User } from '@margem/database'
import { AuthModule } from '../auth/auth.module'
import { BillingController } from './billing.controller'
import { BillingService } from './billing.service'
@Module({
  imports: [
    TypeOrmModule.forFeature([User, BillingCheckoutSession, BillingSubscription, BillingWebhookEvent]),
    AuthModule
  ],
  controllers: [BillingController],
  providers: [BillingService]
})
export class BillingModule {}
