import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getUserByPhone(phone: string): Promise<User | null> {
    const normalized = phone.replace(/\D/g, ''); // убираем всё кроме цифр
    this.logger.debug(`Searching user by normalized phone ${normalized}`);

    return this.userModel.findOne({
      where: this.userModel.sequelize!.where(
        this.userModel.sequelize!.fn(
          'regexp_replace',
          this.userModel.sequelize!.col('phone'),
          '[^0-9]',
          '',
          'g',
        ),
        normalized,
      ),
    });
  }
}
