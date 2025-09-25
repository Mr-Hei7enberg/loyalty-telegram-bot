import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountGroup } from '../entities/discount-group.model';
import { DiscountItem } from '../entities/discount-item.model';
import { DISCOUNT_GROUPS } from '../data/discount-groups.seed';

@Injectable()
export class DiscountCatalogService {
  private seeded = false;

  constructor(
    @InjectModel(DiscountGroup)
    private readonly discountGroupModel: typeof DiscountGroup,
    @InjectModel(DiscountItem)
    private readonly discountItemModel: typeof DiscountItem,
  ) {}

  async getGroupsWithItems(): Promise<DiscountGroup[]> {
    await this.ensureSeeded();

    return this.discountGroupModel.findAll({
      include: [
        {
          model: DiscountItem,
          as: 'items',
          attributes: ['id', 'title'],
        },
      ],
      order: [
        ['title', 'ASC'],
        [{ model: DiscountItem, as: 'items' }, 'title', 'ASC'],
      ],
    });
  }

  async findGroup(groupId: string): Promise<DiscountGroup | null> {
    await this.ensureSeeded();

    return this.discountGroupModel.findOne({
      where: { id: groupId },
      include: [
        {
          model: DiscountItem,
          as: 'items',
          attributes: ['id', 'title'],
        },
      ],
      order: [[{ model: DiscountItem, as: 'items' }, 'title', 'ASC']],
    });
  }

  private async ensureSeeded() {
    if (this.seeded) {
      return;
    }

    const count = await this.discountGroupModel.count();

    if (count === 0) {
      for (const group of DISCOUNT_GROUPS) {
        await this.discountGroupModel.create({
          id: group.id,
          title: group.title,
        });

        await this.discountItemModel.bulkCreate(
          group.items.map((item, index) => ({
            id: `${group.id}-${index + 1}`,
            title: item,
            groupId: group.id,
          })),
        );
      }
    }

    this.seeded = true;
  }
}
