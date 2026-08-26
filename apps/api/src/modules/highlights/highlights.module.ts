import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Document, Highlight, User } from '@margem/database'
import { AuthModule } from '../auth/auth.module'
import { HighlightsController } from './highlights.controller'
import { HighlightsService } from './highlights.service'
@Module({
  imports: [TypeOrmModule.forFeature([Highlight, Document, User]), AuthModule],
  controllers: [HighlightsController],
  providers: [HighlightsService]
})
export class HighlightsModule {}
