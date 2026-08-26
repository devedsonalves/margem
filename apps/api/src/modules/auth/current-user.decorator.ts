import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { AuthenticatedRequest, Principal } from './auth.guard'

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user
)
