import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { toDataURL } from 'qrcode';
import type { UserSessionState } from '../interfaces/telegram-context.interface';

const CODE_TTL_MS = 150_000; // 2,5 хвилини

export interface DynamicCodeResult {
  value: string;
  expiresAt: number;
  image: Buffer;
  isNew: boolean;
}

@Injectable()
export class DynamicCodeService {
  private readonly logger = new Logger(DynamicCodeService.name);

  async getOrCreateCode(
    session: UserSessionState,
    cardNumber: string,
  ): Promise<DynamicCodeResult> {
    const now = Date.now();

    if (session.dynamicCode && session.dynamicCode.expiresAt > now) {
      const image = await this.generateImage(session.dynamicCode.value);

      return {
        value: session.dynamicCode.value,
        expiresAt: session.dynamicCode.expiresAt,
        image,
        isNew: false,
      };
    }

    const value = this.composeCodeValue(cardNumber);
    const expiresAt = now + CODE_TTL_MS;
    const image = await this.generateImage(value);

    session.dynamicCode = { value, expiresAt };

    this.logger.log(`Generated new dynamic code for card ${cardNumber}`);

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
    return new Date(expiresAt).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
