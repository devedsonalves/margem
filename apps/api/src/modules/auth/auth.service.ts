import { BillingCheckoutSession, BillingSubscription, Document, Notebook, User } from '@margem/database'
import {
    BadGatewayException,
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { DataSource, Repository } from 'typeorm'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService
  ) {}
  async register(input: { email?: string; name?: string; password?: string }) {
    const email = input.email?.trim().toLowerCase() || ''
    if (!emailPattern.test(email) || !input.password || !input.name)
      throw new BadRequestException('Invalid registration data')
    if (await this.users.findOneBy({ email })) throw new BadRequestException('User already exists')
    const user = await this.users.save(
      this.users.create({ email, name: input.name.trim(), password: await bcrypt.hash(input.password, 10) })
    )
    return { user: this.serialize(user), token: this.token(user) }
  }
  async login(input: { email?: string; password?: string }) {
    const user = await this.users.findOneBy({ email: input.email?.trim().toLowerCase() || '' })
    if (!user || !input.password || !(await bcrypt.compare(input.password, user.password)))
      throw new BadRequestException('Invalid credentials')
    return { user: this.serialize(user), token: this.token(user) }
  }
  async me(id: string) {
    const user = await this.find(id)
    return { user: this.serialize(user) }
  }
  async update(id: string, input: { name?: string; email?: string }) {
    const name = input.name?.trim() || ''
    const email = input.email?.trim().toLowerCase() || ''
    if (name.length < 2) throw new BadRequestException('Informe um nome com pelo menos 2 caracteres')
    if (!emailPattern.test(email)) throw new BadRequestException('Informe um e-mail válido')
    const owner = await this.users.findOneBy({ email })
    if (owner && owner.id !== id) throw new ConflictException('Este e-mail já está em uso')
    const user = await this.find(id)
    Object.assign(user, { name, email })
    await this.users.save(user)
    return { user: this.serialize(user), token: this.token(user) }
  }
  async changePassword(id: string, input: { currentPassword?: string; newPassword?: string }) {
    if (!input.newPassword || input.newPassword.length < 8)
      throw new BadRequestException('A nova senha deve ter pelo menos 8 caracteres')
    const user = await this.find(id)
    if (!input.currentPassword || !(await bcrypt.compare(input.currentPassword, user.password)))
      throw new BadRequestException('A senha atual está incorreta')
    if (await bcrypt.compare(input.newPassword, user.password))
      throw new BadRequestException('A nova senha deve ser diferente da senha atual')
    user.password = await bcrypt.hash(input.newPassword, 10)
    await this.users.save(user)
    return { message: 'Senha atualizada com sucesso' }
  }
  async export(id: string) {
    const user = await this.users.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        current_plan: true,
        plan_status: true,
        plan_activated_at: true,
        plan_expires_at: true
      }
    })
    if (!user) throw new NotFoundException('Conta não encontrada')
    const documents = await this.dataSource
      .getRepository(Document)
      .find({ where: { user_id: id }, relations: { highlights: { margin_notes: true } } })
    const notebooks = await this.dataSource.getRepository(Notebook).findBy({ user_id: id })
    return { exportedAt: new Date().toISOString(), profile: user, documents, notebooks }
  }
  async remove(id: string, password?: string) {
    const user = await this.find(id)
    if (!password || !(await bcrypt.compare(password, user.password)))
      throw new BadRequestException('A senha está incorreta')
    try {
      await this.dataSource.transaction(async manager => {
        await manager.delete(Notebook, { user_id: id })
        await manager.delete(Document, { user_id: id })
        await manager.delete(BillingCheckoutSession, { user_id: id })
        await manager.delete(BillingSubscription, { user_id: id })
        await manager.delete(User, { id })
      })
    } catch {
      throw new BadGatewayException('Não foi possível excluir a conta')
    }
    return { message: 'Conta excluída com sucesso' }
  }
  private async find(id: string) {
    const user = await this.users.findOneBy({ id })
    if (!user) throw new NotFoundException('Conta não encontrada')
    return user
  }
  private token(user: User) {
    return jwt.sign({ id: user.id, email: user.email }, this.config.getOrThrow<string>('JWT_SECRET'), {
      expiresIn: '7d'
    })
  }
  private serialize(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      currentPlan: user.current_plan,
      planStatus: user.plan_status
    }
  }
}
