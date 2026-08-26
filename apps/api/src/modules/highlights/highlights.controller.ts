import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard, type Principal } from '../auth/auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { HighlightsService } from './highlights.service'

@ApiTags('Highlights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('highlights')
export class HighlightsController {
  constructor(private readonly service: HighlightsService) {}
  @Get(':documentId') list(@CurrentUser() user: Principal, @Param('documentId') id: string) {
    return this.service.list(user.id, id)
  }
  @Post() create(@CurrentUser() user: Principal, @Body() body: Record<string, unknown>) {
    return this.service.create(user.id, body)
  }
  @Delete(':id') remove(@CurrentUser() user: Principal, @Param('id') id: string) {
    return this.service.remove(user.id, id)
  }
}
