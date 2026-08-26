import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Document, User } from '@margem/database'
import { randomUUID } from 'node:crypto'
import { Repository } from 'typeorm'
import { s3Service } from '../../infrastructure/integrations/storage/s3.adapter'
import { getPlan } from '../billing/domain/plans'

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly documents: Repository<Document>,
    @InjectRepository(User) private readonly users: Repository<User>
  ) {}
  list(userId: string) {
    return this.documents.find({ where: { user_id: userId }, order: { created_at: 'DESC' } })
  }
  async url(userId: string, id: string) {
    const document = await this.owned(userId, id)
    return { url: await s3Service.getDownloadUrl(document.file_path) }
  }
  async upload(userId: string, file: Express.Multer.File | undefined, body: Record<string, string>) {
    if (!file) throw new BadRequestException('No file uploaded')
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Only PDF files are allowed')
    const user = await this.users.findOneBy({ id: userId })
    const plan = getPlan(user?.plan_status === 'ACTIVE' ? user.current_plan : 'FREE')
    if (plan.documentLimit !== null && (await this.documents.countBy({ user_id: userId })) >= plan.documentLimit)
      throw new HttpException('Limite de documentos do plano atingido. Atualize seu plano para continuar.', 402)
    const id = randomUUID()
    const filePath = `documents/${userId}/${id}.pdf`
    await s3Service.uploadFile(filePath, file.buffer, 'application/pdf')
    try {
      return await this.documents.save(
        this.documents.create({
          id,
          user_id: userId,
          title: body.title || file.originalname,
          file_path: filePath,
          file_size: file.size,
          total_pages: Number.parseInt(body.total_pages || '', 10) || 0
        })
      )
    } catch (error) {
      await s3Service.deleteFile(filePath).catch(() => undefined)
      throw error
    }
  }
  async progress(userId: string, id: string, body: Record<string, unknown>) {
    const current = positiveInt(body.current_page)
    const total = positiveInt(body.total_pages)
    if (current === null && total === null) throw new BadRequestException('No progress data provided')
    const document = await this.owned(userId, id)
    document.total_pages = total ?? document.total_pages
    document.current_page =
      current === null ? document.current_page : Math.min(Math.max(current, 1), Math.max(document.total_pages, 1))
    return this.documents.save(document)
  }
  async remove(userId: string, id: string) {
    const document = await this.owned(userId, id)
    await s3Service.deleteFile(document.file_path)
    await this.documents.remove(document)
    return { success: true }
  }
  private async owned(userId: string, id: string) {
    const document = await this.documents.findOneBy({ id, user_id: userId })
    if (!document) throw new NotFoundException('Document not found')
    return document
  }
}
const positiveInt = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}
