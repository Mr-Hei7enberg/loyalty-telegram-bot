import { Update, Ctx, Start, On } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { Markup } from 'telegraf';
import type { Message } from 'telegraf/types';
import type { TelegramContext } from './interfaces/telegram-context.interface';
import { UsersService } from '../users/users.service';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(private readonly usersService: UsersService) {}

  @Start()
  async start(@Ctx() ctx: TelegramContext) {
    this.logger.log(`Start command from chat ${ctx.chat?.id}`);
    await ctx.reply(
      'Вітаємо у програмі лояльності! Поділіться номером телефону, щоб ми підтвердили ваш акаунт.',
      Markup.keyboard([[Markup.button.contactRequest('Поділитись номером')]])
        .oneTime()
        .resize(),
    );
  }

  private isContactMessage(
    message: Message | undefined,
  ): message is Message.ContactMessage {
    return (
      typeof message === 'object' &&
      message !== null &&
      'contact' in message &&
      typeof message.contact?.phone_number === 'string'
    );
  }

  @On('message')
  async handleContact(@Ctx() ctx: TelegramContext) {
    const maybeMessage: Message | undefined = ctx.message;

    if (!this.isContactMessage(maybeMessage)) {
      return; // Игнорируем все сообщения без контакта
    }

    const contactMessage: Message.ContactMessage = maybeMessage;
    const phone = contactMessage.contact.phone_number;
    this.logger.debug(`Received contact ${phone} from chat ${ctx.chat?.id}`);
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      await ctx.reply(
        'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      );
      return;
    }

    await ctx.reply(
      `Вітаємо!\nID: ${user.id}\nНомер: ${user.phone}\nКарта: ${user.card_number}\nПерсональна знижка: ${user.discount_percent}%`,
    );
  }
}
