import { Op } from 'sequelize';
import { PurchasesService } from './purchases.service';
import type { Purchase } from '../entities/purchase.model';

describe('PurchasesService', () => {
  const findAll = jest.fn();
  const service = new PurchasesService({
    findAll,
  } as unknown as typeof Purchase);

  beforeEach(() => {
    findAll.mockReset();
  });

  it('calculates monthly stats and discount', async () => {
    findAll.mockResolvedValue([
      { purchaseDate: '2024-12-01' },
      { purchaseDate: '2024-12-02' },
      { purchaseDate: '2024-12-02' },
    ]);

    const stats = await service.getMonthlyStats(42, new Date('2024-12-15'));

    expect(findAll).toHaveBeenCalledTimes(1);
    const callArgs = findAll.mock.calls as Array<
      [
        {
          where: {
            userId: number;
            purchaseDate: Record<symbol, [string, string]>;
          };
        },
      ]
    >;

    const args = callArgs[0]?.[0];

    expect(args).toBeDefined();
    if (!args) {
      return;
    }

    expect(args.where.userId).toBe(42);
    expect(args.where.purchaseDate[Op.between]).toEqual([
      '2024-12-01',
      '2024-12-31',
    ]);

    expect(stats.uniqueDays).toBe(2);
    expect(stats.totalChecks).toBe(3);
    expect(stats.discountPercent).toBe(25);
  });
});
