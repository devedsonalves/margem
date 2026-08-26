import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name)

  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    if (error instanceof HttpException) {
      const payload = error.getResponse()
      const message = typeof payload === 'string' ? payload : this.messageFrom(payload)
      response.status(error.getStatus()).json({ error: message })
      return
    }

    this.logger.error(
      error instanceof Error ? error.message : 'Unknown error',
      error instanceof Error ? error.stack : undefined
    )

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' })
  }

  private messageFrom(payload: object): string {
    const value = payload as { message?: string | string[]; error?: string }
    if (Array.isArray(value.message)) return value.message[0] || 'Invalid request'
    return value.message || value.error || 'Invalid request'
  }
}
