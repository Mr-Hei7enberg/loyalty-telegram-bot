import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { DiscountCatalogService } from './discount-catalog.service';
import { RegionDirectoryService } from './region-directory.service';
import { PurchasesService } from './purchases.service';
import { LoyaltyUserInfo } from '../dto/user-info.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly purchasesService: PurchasesService,
    private readonly discountCatalogService: DiscountCatalogService,
    private readonly regionDirectoryService: RegionDirectoryService,
  ) {}

  async getUserInfoByPhone(phone: string): Promise<LoyaltyUserInfo | null> {
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      return null;
    }

    const stats = await this.purchasesService.getMonthlyStats(user.id);

    const userInfo: LoyaltyUserInfo = {
      id: user.id,
      phone: user.phone,
      cardNumber: user.card_number ?? null,
      discountPercent: stats.discountPercent,
      monthlyStats: stats,
    };

    return userInfo;
  }

  getDiscountGroups() {
    return this.discountCatalogService.getGroupsWithItems();
  }

  findDiscountGroup(groupId: string) {
    return this.discountCatalogService.findGroup(groupId);
  }

  getRegions() {
    return this.regionDirectoryService.getRegions();
  }

  getNetworks(regionId: string) {
    return this.regionDirectoryService.getNetworks(regionId);
  }

  getLocations(networkId: string) {
    return this.regionDirectoryService.getLocations(networkId);
  }
}
