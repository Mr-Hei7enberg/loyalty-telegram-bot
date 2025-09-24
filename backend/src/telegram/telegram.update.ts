import { Update, Ctx, Start, On, Hears, Action } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import type { TelegramContext } from './interfaces/telegram-context.interface';
import { MenuService } from './services/menu.service';
import { LoyaltyContentService } from './services/loyalty-content.service';
import { DynamicCodeService } from '../loyalty/services/dynamic-code.service';
import { FeedbackService } from '../feedback/feedback.service';
import { isFeedbackContactPreference } from '../feedback/feedback.types';
import { LoyaltyService } from '../loyalty/services/loyalty.service';
import { AnalyticsService } from '../analytics/analytics.service';

const MAIN_MENU_COMMANDS = new Set([
  'Моя знижка',
  'Моя карта',
  'Мережа АЗС зі знижкою',
  'Скарга / Пропозиція',
]);

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly menuService: MenuService,
    private readonly loyaltyContentService: LoyaltyContentService,
    private readonly dynamicCodeService: DynamicCodeService,
    private readonly feedbackService: FeedbackService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Start()
  async start(@Ctx() ctx: TelegramContext) {
    this.logger.log(`Start command from chat ${ctx.chat?.id}`);
    this.resetSession(ctx);

    await this.analyticsService.record('bot_start', {
      metadata: { chatId: ctx.chat?.id },
    });

    await ctx.reply(
      'Вітаємо у програмі лояльності! Поділіться номером телефону, щоб ми підтвердили ваш акаунт.',
      this.menuService.buildContactRequestKeyboard(),
    );
  }

  @On('contact')
  async handleContact(@Ctx() ctx: TelegramContext) {
    const phone = this.getContactPhone(ctx);

    if (!phone) {
      return;
    }

    this.logger.debug(`Received contact ${phone} from chat ${ctx.chat?.id}`);

    const user = await this.loyaltyService.getUserInfoByPhone(phone);

    if (!user) {
      this.logger.warn(`User with phone ${phone} not found`);
      await ctx.reply(
        'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      );
      await ctx.reply(
        'Якщо вважаєте, що сталася помилка, надішліть правильний номер телефону або зверніться до менеджера.',
        this.menuService.buildContactRequestKeyboard(),
      );
      await this.analyticsService.record('auth_failed', {
        metadata: { phone },
      });
      return;
    }

    const session = this.getSession(ctx);
    session.isAuthenticated = true;
    session.phoneNumber = user.phone;
    session.cardNumber = user.cardNumber ?? '';
    session.discountPercent = user.discountPercent ?? undefined;
    session.dynamicCode = undefined;
    session.feedbackDraft = undefined;
    session.userId = user.id;

    await this.analyticsService.record('user_authenticated', {
      userId: user.id,
      phoneNumber: user.phone,
      metadata: { chatId: ctx.chat?.id },
    });

    await ctx.reply(
      [
        'Вітаємо! Ваш акаунт підтверджено.',
        `Номер телефону: ${user.phone}`,
        `Номер картки: ${user.cardNumber ?? '—'}`,
        `Поточна знижка: ${user.discountPercent}%`,
        `Чеків цього місяця: ${user.monthlyStats.totalChecks} (днів із покупками: ${user.monthlyStats.uniqueDays})`,
        '',
        'Оберіть потрібну функцію за допомогою кнопок нижче.',
      ].join('\n'),
      this.menuService.buildMainMenuKeyboard(),
    );
  }

  @Hears('Моя знижка')
  async handleDiscount(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      return;
    }

    const session = this.getSession(ctx);
    if (session.phoneNumber) {
      const updated = await this.loyaltyService.getUserInfoByPhone(
        session.phoneNumber,
      );

      if (updated) {
        session.discountPercent = updated.discountPercent;
        session.userId = updated.id;
      }
    }

    const discountIntro = this.loyaltyContentService.getDiscountIntroduction(
      session.discountPercent,
    );
    const groups = await this.loyaltyContentService.getDiscountGroups();

    await this.analyticsService.record('menu_discount', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });

    await ctx.reply(
      discountIntro,
      this.menuService.buildDiscountGroupsKeyboard(groups),
    );
  }

  @Action(/discount_group:.+/)
  async handleDiscountGroup(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      await ctx.answerCbQuery(
        'Спочатку авторизуйтеся через кнопку «Поділитись номером».',
        {
          show_alert: true,
        },
      );
      return;
    }

    const data = this.getCallbackData(ctx);

    if (!data) {
      await ctx.answerCbQuery();
      return;
    }

    const [, groupId] = data.split(':');

    if (!groupId) {
      await ctx.answerCbQuery();
      return;
    }

    const group = await this.loyaltyContentService.findDiscountGroup(groupId);

    if (!group) {
      await ctx.answerCbQuery('Не вдалося знайти групу товарів.', {
        show_alert: true,
      });
      return;
    }

    await ctx.answerCbQuery();

    const itemsList = this.loyaltyContentService.formatItemsList(group.items);

    const session = this.getSession(ctx);
    await this.analyticsService.record('discount_group_opened', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
      metadata: { groupId },
    });

    await ctx.reply(
      `Товари категорії «${group.title}» зі знижкою:\n${itemsList}`,
      this.menuService.buildDiscountGroupsKeyboard(
        await this.loyaltyContentService.getDiscountGroups(),
      ),
    );
  }

  @Hears('Моя карта')
  async handleCard(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      return;
    }

    const session = this.getSession(ctx);

    await this.analyticsService.record('menu_card', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });

    if (!session.cardNumber) {
      await ctx.reply(
        'У вашому профілі поки немає активної карти. Зверніться до менеджера.',
      );
      return;
    }

    try {
      const dynamicCode = await this.dynamicCodeService.getOrCreateCode(
        session,
        session.cardNumber,
      );

      const expiryTime = this.dynamicCodeService.formatExpiry(
        dynamicCode.expiresAt,
      );

      await this.analyticsService.record('card_code_generated', {
        userId: session.userId,
        phoneNumber: session.phoneNumber,
        metadata: { isNew: dynamicCode.isNew },
      });

      await ctx.replyWithPhoto(
        { source: dynamicCode.image },
        {
          caption: `Код діятиме до ${expiryTime} (приблизно 2 хвилини).`,
        },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неочікувана помилка';
      this.logger.error(`Помилка генерації коду картки: ${message}`);
      await ctx.reply(
        'Не вдалося згенерувати код картки. Спробуйте, будь ласка, ще раз пізніше.',
      );
    }
  }

  @Hears('Мережа АЗС зі знижкою')
  async handleNetworks(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      return;
    }

    const regions = await this.loyaltyContentService.getRegions();

    const session = this.getSession(ctx);
    await this.analyticsService.record('menu_networks', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });

    await ctx.reply(
      'Оберіть область України, щоб переглянути партнерські мережі АЗС:',
      this.menuService.buildRegionsKeyboard(regions),
    );
  }

  @Action(/region:.+/)
  async handleRegion(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      await ctx.answerCbQuery(
        'Спочатку авторизуйтеся через кнопку «Поділитись номером».',
        {
          show_alert: true,
        },
      );
      return;
    }

    const data = this.getCallbackData(ctx);

    if (!data) {
      await ctx.answerCbQuery();
      return;
    }

    const [, regionId] = data.split(':');

    if (!regionId) {
      await ctx.answerCbQuery();
      return;
    }

    const region = await this.loyaltyContentService.findRegion(regionId);

    if (!region) {
      await ctx.answerCbQuery('Область не знайдено.', { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();

    if (!region.networks.length) {
      await ctx.reply(
        `У регіоні «${region.title}» партнерські мережі поки відсутні.`,
      );
      return;
    }

    const session = this.getSession(ctx);
    await this.analyticsService.record('region_selected', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
      metadata: { regionId },
    });

    await ctx.reply(
      `Мережі, що діють у регіоні «${region.title}»:`,
      this.menuService.buildNetworksKeyboard(regionId, region.networks),
    );
  }

  @Action(/network:.+/)
  async handleNetwork(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      await ctx.answerCbQuery(
        'Спочатку авторизуйтеся через кнопку «Поділитись номером».',
        {
          show_alert: true,
        },
      );
      return;
    }

    const data = this.getCallbackData(ctx);

    if (!data) {
      await ctx.answerCbQuery();
      return;
    }

    const [, regionId, networkId] = data.split(':');

    if (!regionId || !networkId) {
      await ctx.answerCbQuery();
      return;
    }

    const network = await this.loyaltyContentService.findNetwork(
      regionId,
      networkId,
    );

    if (!network) {
      await ctx.answerCbQuery('Партнерську мережу не знайдено.', {
        show_alert: true,
      });
      return;
    }

    await ctx.answerCbQuery();

    const locations = this.loyaltyContentService.formatLocationsList(
      network.locations,
    );

    const session = this.getSession(ctx);
    await this.analyticsService.record('network_selected', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
      metadata: { regionId, networkId },
    });

    await ctx.reply(`Точки мережі «${network.title}»:\n${locations}`);
  }

  @Hears('Скарга / Пропозиція')
  async handleFeedbackEntry(@Ctx() ctx: TelegramContext) {
    if (!(await this.ensureAuthenticated(ctx))) {
      return;
    }

    const session = this.getSession(ctx);
    session.feedbackDraft = {};

    await this.analyticsService.record('menu_feedback', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });

    await ctx.reply(
      'Оберіть бажаний спосіб зв’язку з вами:',
      this.menuService.buildFeedbackContactKeyboard(),
    );

    await ctx.reply(
      [
        'Опишіть, будь ласка, скаргу або пропозицію одним повідомленням.',
        'Ваш номер телефону додасться автоматично.',
        'Коли будете готові, натисніть «Відправити».',
      ].join('\n'),
      this.menuService.buildFeedbackSubmitKeyboard(),
    );
  }

  @Action(/feedback_contact:.+/)
  async handleFeedbackContact(@Ctx() ctx: TelegramContext) {
    const session = this.getSession(ctx);

    if (!session.feedbackDraft) {
      await ctx.answerCbQuery(
        'Спочатку відкрийте форму звернення через меню.',
        {
          show_alert: true,
        },
      );
      return;
    }

    const data = this.getCallbackData(ctx);

    if (!data) {
      await ctx.answerCbQuery();
      return;
    }

    const [, preferenceRaw] = data.split(':');

    if (!isFeedbackContactPreference(preferenceRaw)) {
      await ctx.answerCbQuery();
      return;
    }

    session.feedbackDraft.contactPreference = preferenceRaw;

    await this.analyticsService.record('feedback_contact_selected', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
      metadata: { preference: preferenceRaw },
    });

    await ctx.answerCbQuery('Спосіб зв’язку збережено.');

    try {
      await ctx.editMessageReplyMarkup(
        this.menuService.buildFeedbackContactKeyboard(preferenceRaw)
          .reply_markup,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.debug(
        `Не вдалося оновити клавіатуру способу зв’язку: ${message}`,
      );
    }
  }

  @Action('feedback_submit')
  async submitFeedback(@Ctx() ctx: TelegramContext) {
    const session = this.getSession(ctx);
    const draft = session.feedbackDraft;

    if (!draft) {
      await ctx.answerCbQuery(
        'Спочатку відкрийте форму звернення через меню.',
        {
          show_alert: true,
        },
      );
      return;
    }

    if (!draft.message) {
      await ctx.answerCbQuery(
        'Будь ласка, опишіть скаргу або пропозицію текстом.',
        {
          show_alert: true,
        },
      );
      return;
    }

    if (!draft.contactPreference) {
      await ctx.answerCbQuery(
        'Оберіть спосіб зв’язку для зворотнього контакту.',
        {
          show_alert: true,
        },
      );
      return;
    }

    await this.feedbackService.submitFeedback({
      phoneNumber: session.phoneNumber ?? 'невідомий номер',
      message: draft.message,
      contactPreference: draft.contactPreference,
    });

    await this.analyticsService.record('feedback_submitted', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });

    session.feedbackDraft = undefined;

    await ctx.answerCbQuery('Повідомлення надіслано!');
    await ctx.reply('Ваше повідомлення надіслано. Ми зв’яжемось з вами.');
  }

  @Action('feedback_cancel')
  async cancelFeedback(@Ctx() ctx: TelegramContext) {
    const session = this.getSession(ctx);

    if (!session.feedbackDraft) {
      await ctx.answerCbQuery();
      return;
    }

    session.feedbackDraft = undefined;
    await this.analyticsService.record('feedback_cancelled', {
      userId: session.userId,
      phoneNumber: session.phoneNumber,
    });
    await ctx.answerCbQuery('Відправлення скасовано.');
    await ctx.reply(
      'Надсилання звернення скасовано. Ви завжди можете створити нове у головному меню.',
    );
  }

  @On('text')
  async handleText(@Ctx() ctx: TelegramContext) {
    const text = this.getTextPayload(ctx)?.trim();

    if (!text) {
      return;
    }

    const session = this.getSession(ctx);

    if (session.feedbackDraft) {
      session.feedbackDraft.message = text;
      await ctx.reply(
        'Повідомлення збережено. Натисніть «Відправити», коли будете готові.',
      );
      return;
    }

    if (!session.isAuthenticated) {
      await ctx.reply(
        'Щоб продовжити, натисніть /start та поділіться номером телефону.',
        this.menuService.buildContactRequestKeyboard(),
      );
      return;
    }

    if (MAIN_MENU_COMMANDS.has(text)) {
      return;
    }

    await ctx.reply(
      'Скористайтеся, будь ласка, кнопками меню для взаємодії з ботом.',
    );
  }

  private getCallbackData(ctx: TelegramContext) {
    const data = (ctx.callbackQuery as { data?: unknown } | undefined)?.data;

    return typeof data === 'string' ? data : undefined;
  }

  private getContactPhone(ctx: TelegramContext) {
    const phone = (
      ctx.message as { contact?: { phone_number?: unknown } } | undefined
    )?.contact?.phone_number;

    return typeof phone === 'string' ? phone : undefined;
  }

  private getTextPayload(ctx: TelegramContext) {
    const text = (ctx.message as { text?: unknown } | undefined)?.text;

    return typeof text === 'string' ? text : undefined;
  }

  private resetSession(ctx: TelegramContext) {
    ctx.session = {};
  }

  private getSession(ctx: TelegramContext) {
    if (!ctx.session) {
      ctx.session = {};
    }

    return ctx.session;
  }

  private async ensureAuthenticated(ctx: TelegramContext) {
    const session = this.getSession(ctx);

    if (!session.isAuthenticated) {
      await ctx.reply(
        'Щоб отримати доступ до функцій програми, натисніть /start та поділіться номером телефону.',
        this.menuService.buildContactRequestKeyboard(),
      );
      return false;
    }

    return true;
  }
}
