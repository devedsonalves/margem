import { randomUUID } from 'node:crypto'
import { type CallHandler, type ExecutionContext, Injectable, Logger, type NestInterceptor } from '@nestjs/common'
import type { Request, Response } from 'express'
import { type Observable, tap } from 'rxjs'

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const requestId = request.header('x-request-id') || randomUUID()
    response.setHeader('x-request-id', requestId)
    const started = Date.now()

    return next.handle().pipe(
      tap({
        finalize: () =>
          this.logger.log(
            JSON.stringify({
              requestId,
              method: request.method,
              path: request.path,
              status: response.statusCode,
              durationMs: Date.now() - started
            })
          )
      })
    )
  }
}
