import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoyaltyService } from './services/loyalty.service';
import { DynamicCodeService } from './services/dynamic-code.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoyaltyUserInfoResponse } from './dto/user-info.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly dynamicCodeService: DynamicCodeService,
  ) {}

  @Get('user-info')
  async getUserInfo(
    @Query('phone') phone: string,
  ): Promise<LoyaltyUserInfoResponse> {
    if (!phone) {
      throw new BadRequestException('Потрібно передати номер телефону.');
    }

    const user = await this.loyaltyService.getUserInfoByPhone(phone);

    if (!user) {
      throw new NotFoundException(
        'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      );
    }

    return {
      message: 'Дані користувача успішно отримано.',
      user,
    };
  }

  @Get('discount-items')
  async getDiscountItems() {
    const groups = await this.loyaltyService.getDiscountGroups();

    return {
      message: 'Перелік акційних категорій.',
      groups: groups.map((group) => ({
        id: group.id,
        title: group.title,
        items: group.items?.map((item) => ({
          id: item.id,
          title: item.title,
        })),
      })),
    };
  }

  @Get('regions')
  async getRegions() {
    const regions = await this.loyaltyService.getRegions();

    return {
      message: 'Області з активною програмою лояльності.',
      regions: regions.map((region) => ({
        id: region.id,
        title: region.title,
      })),
    };
  }

  @Get('networks')
  async getNetworks(@Query('region') region: string) {
    if (!region) {
      throw new BadRequestException('Потрібно вказати область.');
    }

    const networks = await this.loyaltyService.getNetworks(region);

    return {
      message: 'Мережі у вибраній області.',
      networks: networks.map((network) => ({
        id: network.id,
        title: network.title,
      })),
    };
  }

  @Get('locations')
  async getLocations(@Query('network') network: string) {
    if (!network) {
      throw new BadRequestException('Потрібно вибрати мережу.');
    }

    const locations = await this.loyaltyService.getLocations(network);

    if (!locations.length) {
      throw new NotFoundException(
        'Для обраної мережі поки немає активних точок.',
      );
    }

    return {
      message: 'Точки, де діє програма лояльності.',
      locations: locations.map((location, index) => ({
        id: location.id,
        title: location.title,
        address: location.address,
        order: index + 1,
      })),
    };
  }

  @Get('generate-code')
  async generateCode(@Query('card_id') cardId: string) {
    if (!cardId) {
      throw new BadRequestException('Потрібно передати номер картки.');
    }

    const result = await this.dynamicCodeService.generateCode(cardId);
    const ttlSeconds = Math.ceil((result.expiresAt - Date.now()) / 1000);

    const base64 = result.image.toString('base64');

    return {
      message: 'Динамічний код створено.',
      code: result.value,
      expiresAt: result.expiresAt,
      ttlSeconds: ttlSeconds > 0 ? ttlSeconds : 0,
      imageDataUrl: `data:image/png;base64,${base64}`,
    };
  }
}
