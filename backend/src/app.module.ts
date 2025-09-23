import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { User } from './users/user.model';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'mydb',
      models: [User],
      autoLoadModels: true,
      synchronize: true,
    }),
    UsersModule,
    TelegramModule, // ← обязательно
  ],
})
export class AppModule {}
