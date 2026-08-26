import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notebook } from '@margem/database'
import { AuthModule } from '../auth/auth.module'
import { NotebooksController } from './notebooks.controller'
import { NotebooksService } from './notebooks.service'
@Module({
  imports: [TypeOrmModule.forFeature([Notebook]), AuthModule],
  controllers: [NotebooksController],
  providers: [NotebooksService]
})
export class NotebooksModule {}
