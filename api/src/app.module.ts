import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { getRedisConfig } from './config/redis.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Redis Cache Module
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting Module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60),
          limit: configService.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),

    UsersModule,

    AuthModule,

    ProductsModule,

    OrdersModule,

    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
