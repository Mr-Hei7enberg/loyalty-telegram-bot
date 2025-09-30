import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { toDataURL } from 'qrcode';
import { RedisService } from '../../redis/redis.service';

const CODE_TTL_MS = 150_000; // 2,5 хвилини
const CODE_TTL_SECONDS = Math.ceil(CODE_TTL_MS / 1000);

export interface DynamicCodeResult {
  value: string;
  expiresAt: number;
  image: Buffer;
  isNew: boolean;
}

type SessionWithDynamicCode = {
  dynamicCode?: { value: string; expiresAt: number };
};

@Injectable()
export class DynamicCodeService {
  private readonly logger = new Logger(DynamicCodeService.name);

  constructor(private readonly redisService: RedisService) {}

  async getOrCreateCode(
    session: SessionWithDynamicCode,
    cardNumber: string,
  ): Promise<DynamicCodeResult> {
    const now = Date.now();

    if (session.dynamicCode && session.dynamicCode.expiresAt > now) {
      const isValid = await this.isCodeActive(session.dynamicCode.value);

      if (isValid) {
        const image = await this.generateImage(session.dynamicCode.value);

        return {
          value: session.dynamicCode.value,
          expiresAt: session.dynamicCode.expiresAt,
          image,
          isNew: false,
        };
      }
    }

    const result = await this.generateCode(cardNumber);

    session.dynamicCode = { value: result.value, expiresAt: result.expiresAt };

    return { ...result, isNew: true };
  }

  async generateCode(cardNumber: string) {
    const value = this.composeCodeValue(cardNumber);
    const expiresAt = Date.now() + CODE_TTL_MS;
    const image = await this.generateImage(value);

    await this.redisService.set(
      this.buildRedisKey(value),
      cardNumber,
      CODE_TTL_SECONDS,
    );

    this.logger.log(`Generated dynamic code for card ${cardNumber}`);

    return {
      value,
      expiresAt,
      image,
      isNew: true,
    };
  }

  private composeCodeValue(cardNumber: string) {
    const normalizedCard = cardNumber.replace(/\s+/g, '');
    const randomPart = randomBytes(6).toString('hex');

    return `${normalizedCard}-${randomPart}`;
  }

  private async generateImage(value: string) {
    const dataUrl = await toDataURL(value, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    const [, base64] = dataUrl.split(',', 2);

    if (!base64) {
      throw new Error('Не вдалося згенерувати код картки. Спробуйте ще раз.');
    }

    return Buffer.from(base64, 'base64');
  }

  formatExpiry(expiresAt: number) {
   return new Intl.DateTimeFormat('uk-UA', {
     hour: '2-digit',
     minute: '2-digit',
     timeZone: 'Europe/Kyiv',
   }).format(expiresAt);
  }

  private buildRedisKey(value: string) {
    return `card-code:${value}`;
  }

  private async isCodeActive(value: string) {
    const stored = await this.redisService.get(this.buildRedisKey(value));

    return Boolean(stored);
  }
}
