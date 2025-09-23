import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import type { AuthenticatedUserPayload } from '../interfaces/telegram-context.interface';

@Injectable()
export class TelegramAuthService {
  constructor(private readonly usersService: UsersService) {}

  async authenticateByPhone(
    phone: string,
  ): Promise<AuthenticatedUserPayload | null> {
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      cardNumber: user.card_number ?? null,
      discountPercent: user.discount_percent ?? null,
    };
  }
}
