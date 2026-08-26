import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard, type Principal } from '../auth/auth.guard'
import { NotebooksService } from './notebooks.service'
@ApiTags('Notebooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notebooks')
export class NotebooksController {
  constructor(private readonly service: NotebooksService) {}
  @Get() get(@CurrentUser() user: Principal, @Query('documentId') id?: string) {
    return this.service.get(user.id, id)
  }
  @Patch(':id') update(
    @CurrentUser() user: Principal,
    @Param('id') id: string,
    @Body('content_json') content: unknown
  ) {
    return this.service.update(user.id, id, content)
  }
}
