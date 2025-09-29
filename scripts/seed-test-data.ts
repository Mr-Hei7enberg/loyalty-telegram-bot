import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../src/users/user.model';
import { Purchase } from '../src/loyalty/entities/purchase.model';
import { DiscountGroup } from '../src/loyalty/entities/discount-group.model';
import { DiscountItem } from '../src/loyalty/entities/discount-item.model';
import { Region } from '../src/loyalty/entities/region.model';
import { RegionNetwork } from '../src/loyalty/entities/region-network.model';
import { RegionLocation } from '../src/loyalty/entities/region-location.model';
import { FeedbackEntry } from '../src/feedback/entities/feedback.model';
import { UserActionLog } from '../src/analytics/entities/user-action-log.model';
import { DISCOUNT_GROUPS } from '../src/loyalty/data/discount-groups.seed';
import { REGIONS } from '../src/loyalty/data/regions.seed';
import { calculateDiscount } from '../src/loyalty/utils/discount.utils';

interface TestUserConfig {
  phone: string;
  cardNumber: string;
  purchases: Array<{ day: number; totalAmount: number }>;
  feedback?: { contactPreference: 'call' | 'telegram'; message: string };
  actions?: Array<{ action: string; metadata?: Record<string, unknown> }>;
}

const TEST_USERS: TestUserConfig[] = [
  {
    phone: '380501234567',
    cardNumber: '700000000001',
    purchases: [
      { day: 2, totalAmount: 820.4 },
      { day: 5, totalAmount: 612.15 },
      { day: 5, totalAmount: 190.2 },
    ],
    feedback: {
      contactPreference: 'call',
      message:
        'Дуже сподобався сервіс у Вінницькій області. Хотілось би більше здорових снеків.',
    },
    actions: [
      { action: 'bot_start' },
      { action: 'view_discount', metadata: { source: 'main_menu' } },
      { action: 'generate_card_code' },
    ],
  },
  {
    phone: '380671112233',
    cardNumber: '700000000002',
    purchases: [
      { day: 1, totalAmount: 540.0 },
      { day: 3, totalAmount: 210.5 },
      { day: 7, totalAmount: 330.0 },
      { day: 12, totalAmount: 410.25 },
      { day: 17, totalAmount: 950.5 },
    ],
    feedback: {
      contactPreference: 'telegram',
      message: 'Прошу додати можливість зберігати копії чеків у боті.',
    },
    actions: [
      { action: 'bot_start' },
      { action: 'open_networks', metadata: { region: 'kyivska' } },
      { action: 'send_feedback' },
    ],
  },
  {
    phone: '380931009988',
    cardNumber: '700000000003',
    purchases: [
      { day: 1, totalAmount: 480.7 },
      { day: 4, totalAmount: 230.3 },
      { day: 6, totalAmount: 310.8 },
      { day: 9, totalAmount: 255.6 },
      { day: 13, totalAmount: 712.45 },
      { day: 16, totalAmount: 198.0 },
      { day: 20, totalAmount: 640.75 },
      { day: 24, totalAmount: 530.1 },
      { day: 27, totalAmount: 850.0 },
    ],
    actions: [
      { action: 'bot_start' },
      { action: 'view_discount', metadata: { source: 'shortcut_button' } },
      { action: 'open_card_code' },
      { action: 'send_feedback' },
    ],
  },
  {
    phone: '380975025543',
    cardNumber: '700000000004',
    purchases: [
      { day: 3, totalAmount: 715.4 },
      { day: 9, totalAmount: 410.3 },
      { day: 19, totalAmount: 512.6 },
      { day: 25, totalAmount: 398.45 },
    ],
    feedback: {
      contactPreference: 'telegram',
      message: 'Додайте будь ласка можливість перегляду історії покупок.',
    },
    actions: [
      { action: 'bot_start' },
      { action: 'open_networks', metadata: { region: 'lvivska' } },
      { action: 'view_discount', metadata: { source: 'main_menu' } },
    ],
  },
  {
    phone: '380982572607',
    cardNumber: '700000000005',
    purchases: [
      { day: 2, totalAmount: 520.6 },
      { day: 6, totalAmount: 330.0 },
      { day: 11, totalAmount: 408.9 },
      { day: 15, totalAmount: 295.75 },
      { day: 22, totalAmount: 612.8 },
      { day: 28, totalAmount: 780.25 },
      { day: 29, totalAmount: 415.2 },
      { day: 30, totalAmount: 650.0 },
    ],
    actions: [
      { action: 'bot_start' },
      { action: 'open_card_code' },
      { action: 'generate_card_code' },
      { action: 'send_feedback' },
    ],
  },
];

function resolveDate(day: number, base: Date) {
  const candidate = new Date(base.getFullYear(), base.getMonth(), day);
  candidate.setHours(0, 0, 0, 0);
  return candidate.toISOString().slice(0, 10);
}

async function seedDiscountCatalog(sequelize: Sequelize) {
  const transaction = await sequelize.transaction();

  try {
    await DiscountItem.destroy({ where: {}, transaction });
    await DiscountGroup.destroy({ where: {}, transaction });

    for (const group of DISCOUNT_GROUPS) {
      await DiscountGroup.create(
        {
          id: group.id,
          title: group.title,
        },
        { transaction },
      );

      await DiscountItem.bulkCreate(
        group.items.map((item, index) => ({
          id: `${group.id}-${index + 1}`,
          title: item,
          groupId: group.id,
        })),
        { transaction },
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function seedRegionsDirectory(sequelize: Sequelize) {
  const transaction = await sequelize.transaction();

  try {
    await RegionLocation.destroy({ where: {}, transaction });
    await RegionNetwork.destroy({ where: {}, transaction });
    await Region.destroy({ where: {}, transaction });

    for (const region of REGIONS) {
      await Region.create(
        {
          id: region.id,
          title: region.title,
        },
        { transaction },
      );

      for (const network of region.networks) {
        await RegionNetwork.create(
          {
            id: network.id,
            regionId: region.id,
            title: network.title,
          },
          { transaction },
        );

        await RegionLocation.bulkCreate(
          network.locations.map((location, index) => ({
            id: `${network.id}-${index + 1}`,
            title: location,
            address: location,
            networkId: network.id,
          })),
          { transaction },
        );
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function seedUsers(sequelize: Sequelize) {
  const users = [] as Array<{ user: User; discountPercent: number }>;
  const transaction = await sequelize.transaction();

  try {
    const now = new Date();
    for (const config of TEST_USERS) {
      const [user] = await User.findOrCreate({
        where: { phone: config.phone },
        defaults: {
          phone: config.phone,
          card_number: config.cardNumber,
          discount_percent: 0,
        },
        transaction,
      });

      user.card_number = config.cardNumber;

      await Purchase.destroy({ where: { userId: user.id }, transaction });

      const purchases = await Purchase.bulkCreate(
        config.purchases.map((purchase) => ({
          userId: user.id,
          purchaseDate: resolveDate(purchase.day, now),
          totalAmount: purchase.totalAmount,
        })),
        { transaction },
      );

      const uniqueDays = new Set(
        purchases.map((purchase) => purchase.purchaseDate),
      ).size;
      const discountPercent = calculateDiscount(uniqueDays);
      user.discount_percent = discountPercent;
      await user.save({ transaction });

      if (config.feedback) {
        await FeedbackEntry.create(
          {
            phoneNumber: user.phone,
            contactPreference:
              config.feedback.contactPreference === 'call'
                ? 'call'
                : 'telegram',
            message: config.feedback.message,
          },
          { transaction },
        );
      }

      if (config.actions?.length) {
        await UserActionLog.bulkCreate(
          config.actions.map((action) => ({
            userId: user.id,
            phoneNumber: user.phone,
            action: action.action,
            metadata: action.metadata ?? null,
          })),
          { transaction },
        );
      }

      users.push({ user, discountPercent });
    }

    await transaction.commit();

    return users;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function main() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'myuser',
    password: process.env.POSTGRES_PASSWORD ?? 'mypassword',
    database: process.env.POSTGRES_DB ?? 'mydb',
    models: [
      User,
      Purchase,
      DiscountGroup,
      DiscountItem,
      Region,
      RegionNetwork,
      RegionLocation,
      FeedbackEntry,
      UserActionLog,
    ],
    logging: process.env.DB_LOGGING === 'true',
  });

  try {
    await sequelize.authenticate();

    await sequelize.sync();
    await seedDiscountCatalog(sequelize);
    await seedRegionsDirectory(sequelize);
    const seededUsers = await seedUsers(sequelize);

    const stats = await Purchase.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('purchase_date'))), 'unique_days'],
      ],
      group: ['userId'],
    });

    console.log('Створено або оновлено тестових користувачів:');
    for (const item of seededUsers) {
      const row = stats.find((stat) => stat.get('userId') === item.user.id);
      const checks = row ? Number(row.get('total')) : 0;
      const days = row ? Number(row.get('unique_days')) : 0;
      console.log(
        ` • ${item.user.phone} — карта ${item.user.card_number}, чеків: ${checks}, унікальних днів: ${days}, знижка: ${item.discountPercent}%`,
      );
    }
  } catch (error) {
    console.error('Помилка під час наповнення тестовими даними:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

void main();
