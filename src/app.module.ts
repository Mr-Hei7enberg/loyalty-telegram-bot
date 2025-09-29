import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.model';
import { TelegramModule } from './telegram/telegram.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FeedbackEntry } from './feedback/entities/feedback.model';
import { Purchase } from './loyalty/entities/purchase.model';
import { DiscountGroup } from './loyalty/entities/discount-group.model';
import { DiscountItem } from './loyalty/entities/discount-item.model';
import { Region } from './loyalty/entities/region.model';
import { RegionNetwork } from './loyalty/entities/region-network.model';
import { RegionLocation } from './loyalty/entities/region-location.model';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserActionLog } from './analytics/entities/user-action-log.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: Number(configService.get('POSTGRES_PORT', 5432)),
        username: configService.get('POSTGRES_USER', 'myuser'),
        password: configService.get('POSTGRES_PASSWORD', 'mypassword'),
        database: configService.get('POSTGRES_DB', 'mydb'),
        models: [
          User,
          Purchase,
          DiscountGroup,
          DiscountItem,
          Region,
          RegionNetwork,
          RegionLocation,
          FeedbackEntry,
          UserActionLog,
        ],
        autoLoadModels: true,
        synchronize: true,
        logging: configService.get('DB_LOGGING') === 'true',
      }),
    }),
    UsersModule,
    LoyaltyModule,
    FeedbackModule,
    AnalyticsModule,
    AuthModule,
    TelegramModule, // ← обязательно
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
