import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from '../users/users.module';
import { MenuService } from './services/menu.service';
import { LoyaltyContentService } from './services/loyalty-content.service';
import { DynamicCodeService } from './services/dynamic-code.service';
import { FeedbackService } from './services/feedback.service';
dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error('BOT_TOKEN is not defined in environment variables');
}
@Module({
  imports: [
    TelegrafModule.forRoot({
      token: botToken, // токен из BotFather
      middlewares: [session()],
    }),
    UsersModule,
  ],
  providers: [
    TelegramUpdate,
    MenuService,
    LoyaltyContentService,
    DynamicCodeService,
    FeedbackService,
  ],
})
export class TelegramModule {}
