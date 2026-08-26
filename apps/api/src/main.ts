import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './infrastructure/http/api-exception.filter'
import { RequestLoggingInterceptor } from './infrastructure/http/request-logging.interceptor'
import { ensureAsaasBillingWebhook } from './infrastructure/integrations/asaas/asaas.adapter'

export const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin:
      process.env.CORS_ORIGINS?.split(',')
        .map(value => value.trim())
        .filter(Boolean) || true
  })
  app.enableShutdownHooks()
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.useGlobalFilters(new ApiExceptionFilter())
  app.useGlobalInterceptors(new RequestLoggingInterceptor())
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Margem API')
      .setDescription('API for Margem - reading and annotating documents')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build()
  )
  SwaggerModule.setup('docs', app, document)
  await app.listen(Number(process.env.PORT || 3001))
  if (process.env.ASAAS_AUTO_CONFIGURE_WEBHOOK === 'true')
    await ensureAsaasBillingWebhook().catch(error =>
      console.error('Failed to configure Asaas billing webhook:', error instanceof Error ? error.message : error)
    )
}

if (require.main === module)
  bootstrap().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
