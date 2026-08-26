import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Document, Highlight, MarginNote, User } from '@margem/database'
import { DataSource, Repository } from 'typeorm'
import { getPlan } from '../billing/domain/plans'
@Injectable()
export class HighlightsService {
  constructor(
    @InjectRepository(Highlight) private readonly highlights: Repository<Highlight>,
    @InjectRepository(Document) private readonly documents: Repository<Document>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource
  ) {}
  list(userId: string, documentId: string) {
    return this.highlights.find({
      where: { document_id: documentId, document: { user_id: userId } },
      relations: { margin_notes: true }
    })
  }
  async create(userId: string, body: Record<string, unknown>) {
    const documentId = String(body.document_id || '')
    if (!(await this.documents.findOneBy({ id: documentId, user_id: userId })))
      throw new ForbiddenException('Unauthorized')
    const user = await this.users.findOneBy({ id: userId })
    const plan = getPlan(user?.plan_status === 'ACTIVE' ? user.current_plan : 'FREE')
    if (
      plan.highlightLimit !== null &&
      (await this.highlights.count({ where: { document: { user_id: userId } } })) >= plan.highlightLimit
    )
      throw new HttpException('Limite de destaques do plano atingido. Atualize seu plano para continuar.', 402)
    return this.dataSource.transaction(async manager => {
      const highlight = await manager.save(
        Highlight,
        manager.create(Highlight, {
          document_id: documentId,
          page_number: Number(body.page_number),
          text_content: String(body.text_content || ''),
          color_token: String(body.color_token || ''),
          bounding_rects: body.bounding_rects
        })
      )
      if (body.margin_note)
        await manager.save(
          MarginNote,
          manager.create(MarginNote, { highlight_id: highlight.id, comment_text: String(body.margin_note) })
        )
      return manager.findOneOrFail(Highlight, { where: { id: highlight.id }, relations: { margin_notes: true } })
    })
  }
  async remove(userId: string, id: string) {
    const highlight = await this.highlights.findOne({ where: { id, document: { user_id: userId } } })
    if (!highlight) throw new NotFoundException('Highlight not found')
    await this.highlights.remove(highlight)
    return { success: true }
  }
}
