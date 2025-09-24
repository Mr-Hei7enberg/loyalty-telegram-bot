import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import type { InlineKeyboardButton } from 'telegraf/types';
import { FeedbackContactPreference } from '../../feedback/feedback.types';
import type {
  DiscountGroupView,
  RegionNetworkView,
  RegionView,
} from './loyalty-content.service';

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

  buildDiscountGroupsKeyboard(groups: DiscountGroupView[]) {
    const buttons = groups.map((group) => [
      Markup.button.callback(group.title, `discount_group:${group.id}`),
    ]);

    return Markup.inlineKeyboard(buttons);
  }

  buildRegionsKeyboard(regions: RegionView[]) {
    const buttons = regions.map((region) =>
      Markup.button.callback(region.title, `region:${region.id}`),
    );

    return Markup.inlineKeyboard(this.chunkButtons(buttons, 2));
  }

  buildNetworksKeyboard(regionId: string, networks: RegionNetworkView[]) {
    const buttons = networks.map((network) =>
      Markup.button.callback(
        network.title,
        `network:${regionId}:${network.id}`,
      ),
    );

    return Markup.inlineKeyboard(this.chunkButtons(buttons, 1));
  }

  buildFeedbackContactKeyboard(selected?: FeedbackContactPreference) {
    const callLabel = `${
      selected === FeedbackContactPreference.Call ? '✅ ' : ''
    }Подзвоніть мені`;
    const telegramLabel = `${
      selected === FeedbackContactPreference.Telegram ? '✅ ' : ''
    }Напишіть мені у Telegram`;

    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          callLabel,
          `feedback_contact:${FeedbackContactPreference.Call}`,
        ),
      ],
      [
        Markup.button.callback(
          telegramLabel,
          `feedback_contact:${FeedbackContactPreference.Telegram}`,
        ),
      ],
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
