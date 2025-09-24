import { Injectable } from '@nestjs/common';
import { DISCOUNT_GROUPS } from '../data/discount-groups.data';
import { REGIONS } from '../data/regions.data';
import type {
  DiscountGroup,
  RegionInfo,
  RegionNetwork,
} from '../interfaces/loyalty.interface';

@Injectable()
export class LoyaltyContentService {
  getDiscountIntroduction(discountPercent?: number) {
    const percentText = discountPercent
      ? `Ваша персональна знижка: ${discountPercent}%`
      : 'Ваша персональна знижка буде визначена після першої покупки';

    return [
      percentText,
      'Умови програми лояльності:',
      '• -25% при купівлі 1–3 чеків у різні дні протягом місяця',
      '• -30% при купівлі 4–7 чеків у різні дні протягом місяця',
      '• -35% при купівлі 8 і більше чеків у різні дні протягом місяця',
      '',
      'Оберіть групу товарів, щоб переглянути повний перелік позицій зі знижкою.',
    ].join('\n');
  }

  getDiscountGroups(): DiscountGroup[] {
    return DISCOUNT_GROUPS;
  }

  findDiscountGroup(groupId: string): DiscountGroup | undefined {
    return DISCOUNT_GROUPS.find((group) => group.id === groupId);
  }

  getRegions(): RegionInfo[] {
    return REGIONS;
  }

  findRegion(regionId: string): RegionInfo | undefined {
    return REGIONS.find((region) => region.id === regionId);
  }

  findNetwork(regionId: string, networkId: string): RegionNetwork | undefined {
    const region = this.findRegion(regionId);

    return region?.networks.find((network) => network.id === networkId);
  }

  formatItemsList(items: string[]): string {
    return items.map((item) => `• ${item}`).join('\n');
  }

  formatLocationsList(locations: string[]): string {
    return locations
      .map((location, index) => `${index + 1}. ${location}`)
      .join('\n');
  }
}
