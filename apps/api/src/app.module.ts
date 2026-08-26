import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnvironment } from './config/environment'
import { DatabaseModule } from './infrastructure/database/database.module'
import { AuthModule } from './modules/auth/auth.module'
import { BillingModule } from './modules/billing/billing.module'
import { DocumentsModule } from './modules/documents/documents.module'
import { HealthModule } from './modules/health/health.module'
import { HighlightsModule } from './modules/highlights/highlights.module'
import { NotebooksModule } from './modules/notebooks/notebooks.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'], validate: validateEnvironment }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    DocumentsModule,
    HighlightsModule,
    NotebooksModule,
    BillingModule
  ]
})
export class AppModule {}
