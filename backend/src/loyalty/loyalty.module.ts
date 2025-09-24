import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from '../users/users.module';
import { Purchase } from './entities/purchase.model';
import { DiscountGroup } from './entities/discount-group.model';
import { DiscountItem } from './entities/discount-item.model';
import { Region } from './entities/region.model';
import { RegionNetwork } from './entities/region-network.model';
import { RegionLocation } from './entities/region-location.model';
import { DiscountCatalogService } from './services/discount-catalog.service';
import { RegionDirectoryService } from './services/region-directory.service';
import { PurchasesService } from './services/purchases.service';
import { LoyaltyService } from './services/loyalty.service';
import { DynamicCodeService } from './services/dynamic-code.service';
import { LoyaltyController } from './loyalty.controller';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([
      Purchase,
      DiscountGroup,
      DiscountItem,
      Region,
      RegionNetwork,
      RegionLocation,
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [
    DiscountCatalogService,
    RegionDirectoryService,
    PurchasesService,
    LoyaltyService,
    DynamicCodeService,
  ],
  exports: [
    DiscountCatalogService,
    RegionDirectoryService,
    PurchasesService,
    LoyaltyService,
    DynamicCodeService,
    SequelizeModule,
  ],
})
export class LoyaltyModule {}
