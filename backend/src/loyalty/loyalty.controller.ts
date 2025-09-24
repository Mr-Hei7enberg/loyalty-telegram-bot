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
import type {
  DiscountGroupsResponseDto,
  GenerateCodeResponseDto,
  LocationsResponseDto,
  NetworksResponseDto,
  RegionLocationWithOrderDto,
  RegionsResponseDto,
  UserInfoResponseDto,
} from './dto/loyalty.dto';

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
  ): Promise<UserInfoResponseDto> {
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
  async getDiscountItems(): Promise<DiscountGroupsResponseDto> {
    const groups = await this.loyaltyService.getDiscountGroups();

    return {
      message: 'Перелік акційних категорій.',
      groups,
    };
  }

  @Get('regions')
  async getRegions(): Promise<RegionsResponseDto> {
    const regions = await this.loyaltyService.getRegions();

    return {
      message: 'Області з активною програмою лояльності.',
      regions,
    };
  }

  @Get('networks')
  async getNetworks(
    @Query('region') region: string,
  ): Promise<NetworksResponseDto> {
    if (!region) {
      throw new BadRequestException('Потрібно вказати область.');
    }

    const networks = await this.loyaltyService.getNetworks(region);

    return {
      message: 'Мережі у вибраній області.',
      networks,
    };
  }

  @Get('locations')
  async getLocations(
    @Query('network') network: string,
  ): Promise<LocationsResponseDto> {
    if (!network) {
      throw new BadRequestException('Потрібно вибрати мережу.');
    }

    const locations = await this.loyaltyService.getLocations(network);

    if (!locations.length) {
      throw new NotFoundException(
        'Для обраної мережі поки немає активних точок.',
      );
    }

    const orderedLocations: RegionLocationWithOrderDto[] = locations.map(
      (location, index) => ({
        id: location.id,
        title: location.title,
        address: location.address,
        order: index + 1,
      }),
    );

    return {
      message: 'Точки, де діє програма лояльності.',
      locations: orderedLocations,
    };
  }

  @Get('generate-code')
  async generateCode(
    @Query('card_id') cardId: string,
  ): Promise<GenerateCodeResponseDto> {
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
