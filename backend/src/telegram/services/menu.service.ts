import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import type { InlineKeyboardButton } from 'telegraf/types';
import type {
  DiscountGroup,
  FeedbackContactPreference,
  RegionInfo,
  RegionNetwork,
} from '../interfaces/loyalty.interface';

@Injectable()
export class MenuService {
  buildContactRequestKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('Поділитись номером')],
    ])
      .oneTime()
      .resize();
  }

  buildMainMenuKeyboard() {
    return Markup.keyboard([
      [Markup.button.text('Моя знижка'), Markup.button.text('Моя карта')],
      [Markup.button.text('Мережа АЗС зі знижкою')],
      [Markup.button.text('Скарга / Пропозиція')],
    ]).resize();
  }

  buildDiscountGroupsKeyboard(groups: DiscountGroup[]) {
    const buttons = groups.map((group) => [
      Markup.button.callback(group.title, `discount_group:${group.id}`),
    ]);

    return Markup.inlineKeyboard(buttons);
  }

  buildRegionsKeyboard(regions: RegionInfo[]) {
    const buttons = regions.map((region) =>
      Markup.button.callback(region.title, `region:${region.id}`),
    );

    return Markup.inlineKeyboard(this.chunkButtons(buttons, 2));
  }

  buildNetworksKeyboard(regionId: string, networks: RegionNetwork[]) {
    const buttons = networks.map((network) =>
      Markup.button.callback(
        network.title,
        `network:${regionId}:${network.id}`,
      ),
    );

    return Markup.inlineKeyboard(this.chunkButtons(buttons, 1));
  }

  buildFeedbackContactKeyboard(selected?: FeedbackContactPreference) {
    const callLabel = `${selected === 'call' ? '✅ ' : ''}Подзвоніть мені`;
    const telegramLabel = `${selected === 'telegram' ? '✅ ' : ''}Напишіть мені у Telegram`;

    return Markup.inlineKeyboard([
      [Markup.button.callback(callLabel, 'feedback_contact:call')],
      [Markup.button.callback(telegramLabel, 'feedback_contact:telegram')],
    ]);
  }

  buildFeedbackSubmitKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Відправити', 'feedback_submit')],
      [Markup.button.callback('Скасувати', 'feedback_cancel')],
    ]);
  }

  private chunkButtons(buttons: InlineKeyboardButton[], perRow: number) {
    const rows: InlineKeyboardButton[][] = [];

    for (let i = 0; i < buttons.length; i += perRow) {
      rows.push(buttons.slice(i, i + perRow));
    }

    return rows;
  }
}
