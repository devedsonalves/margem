import { entities } from '@margem/database'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities,
        synchronize: false,
        autoLoadEntities: false,
        logging: false,
        extra: { max: Number(config.get('DB_POOL_SIZE', 10)), idleTimeoutMillis: 30_000 }
      })
    })
  ]
})
export class DatabaseModule {}
