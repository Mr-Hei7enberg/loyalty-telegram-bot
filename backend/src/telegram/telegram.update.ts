import { Update, Ctx, Start, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UsersService } from '../users/users.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      'Привет! Нажми кнопку ниже, чтобы поделиться своим номером.',
      {
        reply_markup: {
          keyboard: [[{ text: 'Поделиться номером', request_contact: true }]],
          one_time_keyboard: true,
        },
      },
    );
  }

  @On('message')
  async handleContact(@Ctx() ctx: Context) {
    const message: any = ctx.message;

    // Проверяем, есть ли контакт
    if (!message?.contact?.phone_number) {
      return; // Игнорируем все сообщения без контакта
    }

    const phone = message.contact.phone_number;
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      await ctx.reply(
        'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      );
      return;
    }

    await ctx.reply(
      `Привет, ваш ID: ${user.id}\nНомер: ${user.phone}\nКарта: ${user.card_number}\nСкидка: ${user.discount_percent}%`,
    );
  }
}
