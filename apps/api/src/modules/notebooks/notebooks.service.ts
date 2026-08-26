import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Notebook } from '@margem/database'
import { IsNull, Repository } from 'typeorm'
@Injectable()
export class NotebooksService {
  constructor(@InjectRepository(Notebook) private readonly notebooks: Repository<Notebook>) {}
  async get(userId: string, documentId?: string) {
    const where = { user_id: userId, document_id: documentId ? documentId : IsNull() }
    let notebook = await this.notebooks.findOneBy(where)
    if (!notebook)
      notebook = await this.notebooks.save(
        this.notebooks.create({ user_id: userId, document_id: documentId || null, content_json: {} })
      )
    return notebook
  }
  async update(userId: string, id: string, content: unknown) {
    const notebook = await this.notebooks.findOneBy({ id, user_id: userId })
    if (!notebook) throw new NotFoundException('Notebook not found')
    notebook.content_json = content
    return this.notebooks.save(notebook)
  }
}
