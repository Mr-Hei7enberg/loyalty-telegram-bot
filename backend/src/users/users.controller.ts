import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user-info')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUserInfo(@Query('phone') phone: string) {
    const user = await this.usersService.getUserByPhone(phone);

    if (!user) {
      return {
        message:
          'Вас не знайдено у системі. Для участі в програмі лояльності зверніться до менеджера системи «Дизель менеджер».',
      };
    }

    return {
      id: user.id,
      phone: user.phone,
      card_number: user.card_number,
      discount_percent: user.discount_percent,
    };
  }
}
