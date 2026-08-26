import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard, type Principal } from '../auth/auth.guard'
import { DocumentsService } from './documents.service'
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}
  @Get() list(@CurrentUser() user: Principal) {
    return this.service.list(user.id)
  }
  @Get(':id/url') url(@CurrentUser() user: Principal, @Param('id') id: string) {
    return this.service.url(user.id, id)
  }
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf', { storage: memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: Principal,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>
  ) {
    return this.service.upload(user.id, file, body)
  }
  @Patch(':id/progress') progress(
    @CurrentUser() user: Principal,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>
  ) {
    return this.service.progress(user.id, id, body)
  }
  @Delete(':id') remove(@CurrentUser() user: Principal, @Param('id') id: string) {
    return this.service.remove(user.id, id)
  }
}
