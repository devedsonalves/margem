import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard, type Principal } from './auth.guard'
import { AuthService } from './auth.service'
import { CurrentUser } from './current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() body: Record<string, string>) {
    return this.auth.register(body)
  }
  @Post('login') login(@Body() body: Record<string, string>) {
    return this.auth.login(body)
  }
  @Get('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) me(@CurrentUser() user: Principal) {
    return this.auth.me(user.id)
  }
  @Patch('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) update(
    @CurrentUser() user: Principal,
    @Body() body: Record<string, string>
  ) {
    return this.auth.update(user.id, body)
  }
  @Patch('password') @ApiBearerAuth() @UseGuards(JwtAuthGuard) password(
    @CurrentUser() user: Principal,
    @Body() body: Record<string, string>
  ) {
    return this.auth.changePassword(user.id, body)
  }
  @Get('export') @ApiBearerAuth() @UseGuards(JwtAuthGuard) export(@CurrentUser() user: Principal) {
    return this.auth.export(user.id)
  }
  @Delete('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) remove(
    @CurrentUser() user: Principal,
    @Body('password') password?: string
  ) {
    return this.auth.remove(user.id, password)
  }
}
