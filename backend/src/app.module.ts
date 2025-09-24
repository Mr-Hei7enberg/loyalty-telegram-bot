import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import type { SequelizeModuleOptions } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { User } from './users/user.model';
import { LoyaltyModule } from './loyalty/loyalty.module';

const isTestEnv =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

const sequelizeOptions: SequelizeModuleOptions = isTestEnv
  ? {
      dialect: 'sqlite',
      storage: ':memory:',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      models: [User],
    }
  : {
      dialect: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'myuser',
      password: process.env.DB_PASSWORD ?? 'mypassword',
      database: process.env.DB_NAME ?? 'mydb',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      models: [User],
    };

function resolveTelegramModule() {
  const moduleRef =
    require('./telegram/telegram.module') as typeof import('./telegram/telegram.module'); // eslint-disable-line @typescript-eslint/no-require-imports

  return moduleRef.TelegramModule;
}

const telegramModule = !isTestEnv ? resolveTelegramModule() : undefined;

const moduleImports = [
  SequelizeModule.forRoot(sequelizeOptions),
  UsersModule,
  LoyaltyModule,
  ...(telegramModule ? [telegramModule] : []),
];

@Module({
  imports: moduleImports,
})
export class AppModule {}
