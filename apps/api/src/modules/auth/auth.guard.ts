import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import jwt from 'jsonwebtoken'

export interface Principal {
  id: string
  email: string
}
export interface AuthenticatedRequest extends Request {
  user: Principal
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const [scheme, token] = request.headers.authorization?.split(' ') || []

    if (!token) throw new UnauthorizedException('No token provided')

    if (!/^Bearer$/i.test(scheme)) throw new UnauthorizedException('Token malformatted')

    try {
      const payload = jwt.verify(token, this.config.getOrThrow<string>('JWT_SECRET')) as Principal

      if (!payload.id || !payload.email) throw new Error('Invalid payload')

      request.user = { id: payload.id, email: payload.email }
      return true
    } catch {
      throw new UnauthorizedException('Token invalid')
    }
  }
}
