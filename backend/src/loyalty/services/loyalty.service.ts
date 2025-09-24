import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { DiscountCatalogService } from './discount-catalog.service';
import { RegionDirectoryService } from './region-directory.service';
import { PurchasesService } from './purchases.service';
import type {
  DiscountGroupDto,
  DiscountItemDto,
  RegionDto,
  RegionLocationDto,
  RegionNetworkDto,
  UserInfoDto,
} from '../dto/loyalty.dto';
import type { DiscountGroup } from '../entities/discount-group.model';
import type { DiscountItem } from '../entities/discount-item.model';
import type { Region } from '../entities/region.model';
import type { RegionNetwork } from '../entities/region-network.model';
import type { RegionLocation } from '../entities/region-location.model';

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly purchasesService: PurchasesService,
    private readonly discountCatalogService: DiscountCatalogService,
    private readonly regionDirectoryService: RegionDirectoryService,
  ) {}

  async getUserInfoByPhone(phone: string): Promise<UserInfoDto | null> {
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      return null;
    }

    const stats = await this.purchasesService.getMonthlyStats(user.id);

    return {
      id: user.id,
      phone: user.phone,
      cardNumber: user.card_number ?? null,
      discountPercent: stats.discountPercent,
      monthlyStats: {
        uniqueDays: stats.uniqueDays,
        totalChecks: stats.totalChecks,
        discountPercent: stats.discountPercent,
      },
    };
  }

  async getDiscountGroups(): Promise<DiscountGroupDto[]> {
    const groups = await this.discountCatalogService.getGroupsWithItems();

    return groups.map((group) => this.mapDiscountGroup(group));
  }

  async findDiscountGroup(groupId: string): Promise<DiscountGroupDto | null> {
    const group = await this.discountCatalogService.findGroup(groupId);

    if (!group) {
      return null;
    }

    return this.mapDiscountGroup(group);
  }

  async getRegions(): Promise<RegionDto[]> {
    const regions = await this.regionDirectoryService.getRegions();

    return regions.map((region) => this.mapRegion(region));
  }

  async getNetworks(regionId: string): Promise<RegionNetworkDto[]> {
    const networks = await this.regionDirectoryService.getNetworks(regionId);

    return networks.map((network) => this.mapNetwork(network));
  }

  async getLocations(networkId: string): Promise<RegionLocationDto[]> {
    const locations = await this.regionDirectoryService.getLocations(networkId);

    return locations.map((location) => this.mapLocation(location));
  }

  private mapDiscountGroup(group: DiscountGroup): DiscountGroupDto {
    return {
      id: group.id,
      title: group.title,
      items: this.mapItems(group.items ?? []),
    };
  }

  private mapItems(items: DiscountItem[]): DiscountItemDto[] {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
    }));
  }

  private mapRegion(region: Region): RegionDto {
    return {
      id: region.id,
      title: region.title,
    };
  }

  private mapNetwork(network: RegionNetwork): RegionNetworkDto {
    return {
      id: network.id,
      title: network.title,
    };
  }

  private mapLocation(location: RegionLocation): RegionLocationDto {
    return {
      id: location.id,
      title: location.title,
      address: location.address,
    };
  }
}
