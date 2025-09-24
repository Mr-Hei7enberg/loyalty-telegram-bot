import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { toDataURL } from 'qrcode';
import type { DynamicCodeSnapshot } from '../interfaces/loyalty.interface';

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

  private readonly cache = new Map<string, DynamicCodeSnapshot>();

  async getOrCreate(
    cardNumber: string,
    snapshot?: DynamicCodeSnapshot,
  ): Promise<DynamicCodeResult> {
    const activeSnapshot = this.getActiveSnapshot(snapshot);

    if (activeSnapshot) {
      const image = await this.generateImage(activeSnapshot.value);

      return {
        value: activeSnapshot.value,
        expiresAt: activeSnapshot.expiresAt,
        image,
        isNew: false,
      };
    }

    return this.generateNewCode(cardNumber);
  }

  async getOrCreateForCard(cardNumber: string): Promise<DynamicCodeResult> {
    const cached = this.cache.get(cardNumber);
    const result = await this.getOrCreate(cardNumber, cached);

    if (result.isNew) {
      this.cache.set(cardNumber, {
        value: result.value,
        expiresAt: result.expiresAt,
      });
    }

    return result;
  }

  invalidateCard(cardNumber: string) {
    this.cache.delete(cardNumber);
  }

  getRemainingSeconds(expiresAt: number, now = Date.now()) {
    return Math.max(0, Math.round((expiresAt - now) / 1000));
  }

  formatExpiry(expiresAt: number) {
    return new Date(expiresAt).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getActiveSnapshot(snapshot?: DynamicCodeSnapshot) {
    if (!snapshot) {
      return undefined;
    }

    return snapshot.expiresAt > Date.now() ? snapshot : undefined;
  }

  private async generateNewCode(cardNumber: string) {
    const value = this.composeCodeValue(cardNumber);
    const expiresAt = Date.now() + CODE_TTL_MS;
    const image = await this.generateImage(value);

    this.logger.log(
      `Згенеровано новий код для картки ${this.normalizeCardNumber(cardNumber)}`,
    );

    return {
      value,
      expiresAt,
      image,
      isNew: true,
    } satisfies DynamicCodeResult;
  }

  private composeCodeValue(cardNumber: string) {
    const normalizedCard = this.normalizeCardNumber(cardNumber);
    const randomPart = randomBytes(6).toString('hex');

    return `${normalizedCard}-${randomPart}`;
  }

  private normalizeCardNumber(cardNumber: string) {
    return cardNumber.replace(/\s+/g, '');
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
}
