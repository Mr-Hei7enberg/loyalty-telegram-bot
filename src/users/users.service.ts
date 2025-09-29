import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getUserByPhone(phone: string): Promise<User | null> {
    const normalized = phone.replace(/\D/g, ''); // убираем всё кроме цифр

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
