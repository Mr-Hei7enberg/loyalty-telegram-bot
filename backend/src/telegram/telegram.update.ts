import { Update, Ctx, Start, On } from 'nestjs-telegraf';
import { TelegramAuthService } from './services/telegram-auth.service';
import {
  AuthenticatedUserPayload,
  TelegramContext,
  TelegramSessionData,
  TelegramContactMessage,
  TelegramContact,
  TelegramUser,
} from './interfaces/telegram-context.interface';
import { buildContactRequestKeyboard } from './keyboards/contact-request.keyboard';
import { buildMainMenuKeyboard } from './keyboards/main-menu.keyboard';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramAuthService: TelegramAuthService) {}

  @Start()
  async start(@Ctx() ctx: TelegramContext) {
    const session = this.ensureSession(ctx);

    if (session.isAuthenticated && session.user) {
      await ctx.reply(
        'Вітаємо з поверненням! Скористайтеся меню нижче, щоб отримати потрібну інформацію.',
        buildMainMenuKeyboard(),
      );
      return;
    }

    this.resetSession(session);

    await this.promptForContact(
      ctx,
      'Вітаємо у програмі лояльності! Щоб продовжити, поділіться, будь ласка, своїм номером телефону.',
    );
  }

  @On('contact')
  async handleContact(@Ctx() ctx: TelegramContext) {
    const session = this.ensureSession(ctx);
    const messageCandidate: unknown = ctx.message;

    if (!this.isContactMessage(messageCandidate)) {
      await this.promptForContact(
        ctx,
        'Не вдалося отримати номер телефону. Спробуйте ще раз за допомогою кнопки нижче.',
      );
      return;
    }

    const message: TelegramContactMessage = messageCandidate;
    const contact: TelegramContact = message.contact;

    const fromCandidate: unknown = ctx.from;
    if (
      this.isTelegramUser(fromCandidate) &&
      typeof contact.user_id === 'number' &&
      contact.user_id !== fromCandidate.id
    ) {
      this.resetSession(session);
      await this.promptForContact(
        ctx,
        'Поділіться, будь ласка, власним номером телефону за допомогою кнопки нижче.',
      );
      return;
    }

    const authenticatedUser =
      await this.telegramAuthService.authenticateByPhone(contact.phone_number);

    if (!authenticatedUser) {
      this.resetSession(session);
      await this.promptForContact(
        ctx,
        'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      );
      return;
    }

    this.storeAuthenticatedUser(session, authenticatedUser);

    await ctx.reply(
      this.buildWelcomeMessage(authenticatedUser),
      buildMainMenuKeyboard(),
    );
  }

  private ensureSession(ctx: TelegramContext): TelegramSessionData {
    if (!ctx.session) {
      ctx.session = { isAuthenticated: false };
    } else if (typeof ctx.session.isAuthenticated !== 'boolean') {
      ctx.session.isAuthenticated = false;
    }

    return ctx.session;
  }

  private resetSession(session: TelegramSessionData): void {
    session.isAuthenticated = false;
    delete session.user;
  }

  private storeAuthenticatedUser(
    session: TelegramSessionData,
    user: AuthenticatedUserPayload,
  ): void {
    session.isAuthenticated = true;
    session.user = user;
  }

  private async promptForContact(
    ctx: TelegramContext,
    message: string,
  ): Promise<void> {
    await ctx.reply(message, buildContactRequestKeyboard());
  }

  private buildWelcomeMessage(user: AuthenticatedUserPayload): string {
    const card = user.cardNumber ? `№ ${user.cardNumber}` : 'не прив’язана';
    const discount =
      typeof user.discountPercent === 'number'
        ? `${user.discountPercent}%`
        : 'ще не нарахована';

    return [
      'Авторизацію успішно завершено ✅',
      `Номер телефону: ${user.phone}`,
      `Карта лояльності: ${card}`,
      `Персональна знижка: ${discount}`,
      '',
      'Оберіть розділ у головному меню нижче.',
    ].join('\n');
  }

  private isContactMessage(
    message: unknown,
  ): message is TelegramContactMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const candidate = message as Partial<TelegramContactMessage>;

    if (!candidate.contact || typeof candidate.contact !== 'object') {
      return false;
    }

    const contact = candidate.contact as Partial<TelegramContact>;

    return typeof contact.phone_number === 'string';
  }

  private isTelegramUser(from: unknown): from is TelegramUser {
    return (
      !!from &&
      typeof from === 'object' &&
      'id' in from &&
      typeof (from as TelegramUser).id === 'number'
    );
  }
}
