import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from '../users/users.module';
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
  providers: [TelegramUpdate],
})
export class TelegramModule {}
