import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from '../users/users.module';
import { MenuService } from './services/menu.service';
import { LoyaltyContentService } from './services/loyalty-content.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('BOT_TOKEN');
        const webhookDomain = configService.get<string>(
          'TELEGRAM_WEBHOOK_DOMAIN',
        );
        const webhookPath = configService.get<string>(
          'TELEGRAM_WEBHOOK_PATH',
          '/telegram/webhook',
        );
        const webhookSecret = configService.get<string>(
          'TELEGRAM_WEBHOOK_SECRET',
        );

        if (!token) {
          throw new Error('BOT_TOKEN is not defined in environment variables');
        }

        return {
          token,
          middlewares: [session()],
          launchOptions: webhookDomain
            ? {
                webhook: {
                  domain: webhookDomain,
                  path: webhookPath,
                  secretToken: webhookSecret || undefined,
                },
              }
            : undefined,
        };
      },
    }),
    UsersModule,
    LoyaltyModule,
    FeedbackModule,
    AnalyticsModule,
  ],
  providers: [TelegramUpdate, MenuService, LoyaltyContentService],
})
export class TelegramModule {}
