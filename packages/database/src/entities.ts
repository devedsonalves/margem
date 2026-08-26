import { randomUUID } from 'node:crypto'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'

export enum PlanCode {
  FREE = 'FREE',
  ESSENTIAL = 'ESSENTIAL',
  PREMIUM = 'PREMIUM'
}
export enum PlanStatus {
  FREE = 'FREE',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED'
}
export enum BillingProvider {
  ASAAS = 'ASAAS'
}
export enum CheckoutStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED'
}
export enum BillingSubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED'
}

@Entity('User')
export class User {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column({ unique: true }) email!: string
  @Column({ type: 'text', nullable: true }) name!: string | null
  @Column({ default: '' }) password!: string
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
  @Column({ type: 'enum', enum: PlanCode, default: PlanCode.FREE }) current_plan!: PlanCode
  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.FREE }) plan_status!: PlanStatus
  @Column({ type: 'timestamp', precision: 3, nullable: true }) plan_activated_at!: Date | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) plan_expires_at!: Date | null
  @OneToMany(() => Document, document => document.user) documents!: Document[]
  @OneToMany(() => Notebook, notebook => notebook.user) notebooks!: Notebook[]
  @OneToMany(() => BillingSubscription, subscription => subscription.user) billingSubscriptions!: BillingSubscription[]
  @OneToMany(() => BillingCheckoutSession, session => session.user) billingCheckoutSessions!: BillingCheckoutSession[]
}

@Entity('Document')
export class Document {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column() user_id!: string
  @ManyToOne(() => User, user => user.documents, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'user_id' }) user!: User
  @Column() title!: string
  @Column({ unique: true }) file_path!: string
  @Column('int') file_size!: number
  @Column('int') total_pages!: number
  @Column('int', { default: 1 }) current_page!: number
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
  @OneToMany(() => Highlight, highlight => highlight.document) highlights!: Highlight[]
  @OneToMany(() => Notebook, notebook => notebook.document) notebooks!: Notebook[]
}

@Entity('Highlight')
export class Highlight {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column() document_id!: string
  @ManyToOne(() => Document, document => document.highlights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document
  @Column('int') page_number!: number
  @Column() text_content!: string
  @Column() color_token!: string
  @Column('jsonb') bounding_rects!: unknown
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
  @OneToMany(() => MarginNote, note => note.highlight, { cascade: true }) margin_notes!: MarginNote[]
}

@Entity('MarginNote')
export class MarginNote {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column({ unique: true }) highlight_id!: string
  @ManyToOne(() => Highlight, highlight => highlight.margin_notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'highlight_id' })
  highlight!: Highlight
  @Column() comment_text!: string
  @UpdateDateColumn({ type: 'timestamp', precision: 3 }) updated_at!: Date
}

@Entity('Notebook')
export class Notebook {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column({ type: 'text', nullable: true }) document_id!: string | null
  @ManyToOne(() => Document, document => document.notebooks, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document!: Document | null
  @Column() user_id!: string
  @ManyToOne(() => User, user => user.notebooks, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'user_id' }) user!: User
  @Column('jsonb') content_json!: unknown
  @UpdateDateColumn({ type: 'timestamp', precision: 3 }) updated_at!: Date
}

@Entity('BillingCheckoutSession')
export class BillingCheckoutSession {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column() user_id!: string
  @ManyToOne(() => User, user => user.billingCheckoutSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User
  @Column({ type: 'enum', enum: BillingProvider, default: BillingProvider.ASAAS }) provider!: BillingProvider
  @Column({ type: 'enum', enum: PlanCode }) plan!: PlanCode
  @Column({ type: 'enum', enum: CheckoutStatus, default: CheckoutStatus.CREATED }) status!: CheckoutStatus
  @Column({ unique: true }) external_id!: string
  @Column({ unique: true }) external_reference!: string
  @Column() checkout_url!: string
  @Column('int') amount_cents!: number
  @Column({ default: 'BRL' }) currency!: string
  @Column('jsonb') raw_response!: Record<string, unknown>
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
  @UpdateDateColumn({ type: 'timestamp', precision: 3 }) updated_at!: Date
}

@Entity('BillingSubscription')
@Index('BillingSubscription_user_id_status_idx', ['user_id', 'status'])
export class BillingSubscription {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column() user_id!: string
  @ManyToOne(() => User, user => user.billingSubscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User
  @Column({ type: 'enum', enum: BillingProvider, default: BillingProvider.ASAAS }) provider!: BillingProvider
  @Column({ type: 'enum', enum: PlanCode }) plan!: PlanCode
  @Column({ type: 'enum', enum: BillingSubscriptionStatus, default: BillingSubscriptionStatus.PENDING })
  status!: BillingSubscriptionStatus
  @Column({ type: 'text', nullable: true, unique: true }) external_subscription_id!: string | null
  @Column({ type: 'text', nullable: true }) external_customer_id!: string | null
  @Column({ type: 'text', nullable: true }) latest_payment_id!: string | null
  @Column({ type: 'text', nullable: true }) latest_checkout_id!: string | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) current_period_start!: Date | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) current_period_end!: Date | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) activated_at!: Date | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) canceled_at!: Date | null
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
  @UpdateDateColumn({ type: 'timestamp', precision: 3 }) updated_at!: Date
}

@Entity('BillingWebhookEvent')
export class BillingWebhookEvent {
  @PrimaryColumn('text') id: string = randomUUID()
  @Column({ type: 'enum', enum: BillingProvider, default: BillingProvider.ASAAS }) provider!: BillingProvider
  @Column({ unique: true }) external_id!: string
  @Column() event_name!: string
  @Column({ type: 'text', nullable: true }) payment_id!: string | null
  @Column({ type: 'text', nullable: true }) subscription_id!: string | null
  @Column({ type: 'timestamp', precision: 3, nullable: true }) processed_at!: Date | null
  @Column('jsonb') raw_payload!: Record<string, unknown>
  @CreateDateColumn({ type: 'timestamp', precision: 3 }) created_at!: Date
}

export const entities = [
  User,
  Document,
  Highlight,
  MarginNote,
  Notebook,
  BillingCheckoutSession,
  BillingSubscription,
  BillingWebhookEvent
]
