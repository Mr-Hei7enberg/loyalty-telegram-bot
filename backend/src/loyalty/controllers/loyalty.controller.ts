import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { LoyaltyContentService } from '../services/loyalty-content.service';
import { DynamicCodeService } from '../services/dynamic-code.service';
import { FeedbackService } from '../services/feedback.service';
import { GenerateCodeQueryDto } from '../dto/generate-code.dto';
import { NetworksQueryDto } from '../dto/networks-query.dto';
import { LocationsQueryDto } from '../dto/locations-query.dto';
import { SubmitFeedbackDto } from '../dto/submit-feedback.dto';
import { sanitizeStringInput } from '../dto/transformers';

@Controller()
export class LoyaltyController {
  private readonly logger = new Logger(LoyaltyController.name);

  constructor(
    private readonly loyaltyContentService: LoyaltyContentService,
    private readonly dynamicCodeService: DynamicCodeService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Get('discount-items')
  getDiscountItems() {
    const groups = this.loyaltyContentService.getDiscountGroups();
    const introduction = this.loyaltyContentService.getDiscountIntroduction();

    return {
      introduction,
      rules: this.loyaltyContentService.getDiscountRules(),
      groups,
    };
  }

  @Get('regions')
  getRegions() {
    const regions = this.loyaltyContentService
      .getRegions()
      .map(({ id, title }) => ({ id, title }));

    return { regions };
  }

  @Get('networks')
  getNetworks(@Query() query: NetworksQueryDto) {
    const region = this.loyaltyContentService.findRegion(query.region);

    if (!region) {
      throw new NotFoundException('Вказану область не знайдено.');
    }

    return {
      region: { id: region.id, title: region.title },
      networks: region.networks.map(({ id, title }) => ({ id, title })),
    };
  }

  @Get('locations')
  getLocations(@Query() query: LocationsQueryDto) {
    const region = this.loyaltyContentService.findRegion(query.region);

    if (!region) {
      throw new NotFoundException('Вказану область не знайдено.');
    }

    const network = this.loyaltyContentService.findNetwork(
      region.id,
      query.network,
    );

    if (!network) {
      throw new NotFoundException('Вказану мережу не знайдено.');
    }

    return {
      region: { id: region.id, title: region.title },
      network: { id: network.id, title: network.title },
      locations: [...network.locations],
    };
  }

  @Get('generate-code')
  async generateCode(@Query() rawQuery: Record<string, unknown>) {
    const query = this.parseGenerateCodeQuery(rawQuery);
    const result = await this.dynamicCodeService.getOrCreateForCard(
      query.cardId,
    );
    const ttlSeconds = this.dynamicCodeService.getRemainingSeconds(
      result.expiresAt,
    );

    this.logger.log(
      `Запит на код для картки ${this.maskSensitiveValue(query.cardId)} (оновлено: ${result.isNew})`,
    );

    return {
      cardId: query.cardId,
      code: result.value,
      expiresAt: new Date(result.expiresAt).toISOString(),
      ttlSeconds,
      isNew: result.isNew,
      qrCode: {
        format: 'png',
        base64: result.image.toString('base64'),
      },
    };
  }

  @Post('feedback')
  @HttpCode(HttpStatus.ACCEPTED)
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    await this.feedbackService.submitFeedback(dto);

    this.logger.log(
      `Отримано звернення від ${this.maskSensitiveValue(dto.phoneNumber)} (зв’язок: ${dto.contactPreference})`,
    );

    return {
      message: 'Ваше повідомлення надіслано. Ми зв’яжемось з вами.',
    };
  }

  private maskSensitiveValue(value: string, visible = 4) {
    const compact = value.replace(/\s+/g, '');
    const hasPlus = compact.startsWith('+');
    const normalized = hasPlus ? compact.slice(1) : compact;

    if (normalized.length <= visible) {
      return compact;
    }

    const visiblePart = normalized.slice(-visible);
    const maskedPart = '*'.repeat(Math.max(0, normalized.length - visible));
    const maskedValue = `${maskedPart}${visiblePart}`;

    return hasPlus ? `+${maskedValue}` : maskedValue;
  }

  private parseGenerateCodeQuery(raw: Record<string, unknown>) {
    const candidate = raw.card_id ?? raw.cardId ?? '';
    const cardId = sanitizeStringInput(candidate);

    if (!cardId) {
      throw new BadRequestException(
        'Необхідно передати ідентифікатор картки у параметрі card_id.',
      );
    }

    return { cardId } as GenerateCodeQueryDto;
  }
}
