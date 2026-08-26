import { Body, Controller, Delete, Get, Headers, Post, Query, Redirect, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard, type Principal } from '../auth/auth.guard'
import { BillingService } from './billing.service'
@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly service: BillingService,
    private readonly config: ConfigService
  ) {}
  @Get('plans') plans() {
    return this.service.plans()
  }
  @Get('subscription') @ApiBearerAuth() @UseGuards(JwtAuthGuard) overview(@CurrentUser() user: Principal) {
    return this.service.overview(user.id)
  }
  @Post('checkout') @ApiBearerAuth() @UseGuards(JwtAuthGuard) checkout(
    @CurrentUser() user: Principal,
    @Body('plan') plan: unknown
  ) {
    return this.service.checkout(user.id, plan)
  }
  @Delete('subscription') @ApiBearerAuth() @UseGuards(JwtAuthGuard) cancel(@CurrentUser() user: Principal) {
    return this.service.cancel(user.id)
  }
  @Get('checkout-return') @Redirect() redirect(@Query('status') status = 'success') {
    const url = this.config.get('APP_URL') || this.config.get('FRONTEND_URL') || 'http://localhost:3000'
    return { url: `${String(url).replace(/\/$/, '')}/planos/retorno?status=${encodeURIComponent(status)}` }
  }
  @Post('webhooks/asaas') webhook(
    @Headers('asaas-access-token') token: string | undefined,
    @Body() body: Record<string, unknown>
  ) {
    return this.service.webhook(token, body)
  }
}
