import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Purchase } from '../entities/purchase.model';
import { calculateDiscount } from '../utils/discount.utils';
import { MonthlyPurchaseStats } from '../interfaces/monthly-purchase-stats.interface';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase)
    private readonly purchaseModel: typeof Purchase,
  ) {}

  async getMonthlyStats(userId: number, referenceDate = new Date()) {
    const { start, end } = this.getMonthRange(referenceDate);
    const purchases = await this.purchaseModel.findAll({
      where: {
        userId,
        purchaseDate: {
          [Op.between]: [start, end],
        },
      },
      attributes: ['purchaseDate'],
    });

    const uniqueDays = new Set(
      purchases.map((purchase) => purchase.purchaseDate),
    ).size;

    const stats: MonthlyPurchaseStats = {
      uniqueDays,
      totalChecks: purchases.length,
      discountPercent: calculateDiscount(uniqueDays),
    };

    return stats;
  }

  private getMonthRange(referenceDate: Date) {
    const start = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    )
      .toISOString()
      .slice(0, 10);

    const endDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
    )
      .toISOString()
      .slice(0, 10);

    return { start, end: endDate };
  }
}
