import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { AppModule } from './app.module';
import type { TelegramContext } from './telegram/interfaces/telegram-context.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  const adminOrigins = configService.get<string>('ADMIN_FRONTEND_ORIGINS');
  const allowedOrigins = adminOrigins
    ? adminOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : ['http://localhost:5173'];
  const allowAnyOrigin = allowedOrigins.includes('*');

  app.enableCors({
    origin: allowAnyOrigin ? true : allowedOrigins,
    credentials: true,
  });
  const webhookDomain = configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN');

  if (webhookDomain) {
    const webhookPath = configService.get<string>(
      'TELEGRAM_WEBHOOK_PATH',
      '/telegram/webhook',
    );
    const webhookSecret = configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
    const bot = app.get<Telegraf<TelegramContext>>(getBotToken());

    app.use(
      bot.webhookCallback(
        webhookPath,
        webhookSecret ? { secretToken: webhookSecret } : undefined,
      ),
    );
  }
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
