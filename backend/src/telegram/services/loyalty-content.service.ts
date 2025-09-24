import { Injectable } from '@nestjs/common';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';

export interface DiscountGroupView {
  id: string;
  title: string;
  items: string[];
}

export interface RegionNetworkView {
  id: string;
  title: string;
  locations: string[];
}

export interface RegionView {
  id: string;
  title: string;
  networks: RegionNetworkView[];
}

@Injectable()
export class LoyaltyContentService {
  constructor(private readonly loyaltyService: LoyaltyService) {}

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

  async getDiscountGroups(): Promise<DiscountGroupView[]> {
    const groups = await this.loyaltyService.getDiscountGroups();

    return groups.map((group) => ({
      id: group.id,
      title: group.title,
      items: group.items.map((item) => item.title),
    }));
  }

  async findDiscountGroup(
    groupId: string,
  ): Promise<DiscountGroupView | undefined> {
    const group = await this.loyaltyService.findDiscountGroup(groupId);

    if (!group) {
      return undefined;
    }

    return {
      id: group.id,
      title: group.title,
      items: group.items.map((item) => item.title),
    };
  }

  async getRegions(): Promise<RegionView[]> {
    const regions = await this.loyaltyService.getRegions();

    return Promise.all(
      regions.map(async (region) => ({
        id: region.id,
        title: region.title,
        networks: await this.getNetworks(region.id),
      })),
    );
  }

  async findRegion(regionId: string): Promise<RegionView | undefined> {
    const regions = await this.getRegions();

    return regions.find((region) => region.id === regionId);
  }

  async getNetworks(regionId: string): Promise<RegionNetworkView[]> {
    const networks = await this.loyaltyService.getNetworks(regionId);

    return Promise.all(
      networks.map(async (network) => ({
        id: network.id,
        title: network.title,
        locations: await this.getLocations(network.id),
      })),
    );
  }

  async findNetwork(regionId: string, networkId: string) {
    const networks = await this.getNetworks(regionId);

    return networks.find((network) => network.id === networkId);
  }

  async getLocations(networkId: string) {
    const locations = await this.loyaltyService.getLocations(networkId);

    return locations.map((location) => location.address);
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
