import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { CreationAttributes } from 'sequelize';
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
          attributes: ['id', 'title'],
        },
      ],
      order: [
        ['title', 'ASC'],
        [DiscountItem, 'title', 'ASC'],
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
          attributes: ['id', 'title'],
        },
      ],
      order: [[DiscountItem, 'title', 'ASC']],
    });
  }

  private async ensureSeeded() {
    if (this.seeded) {
      return;
    }

    const count = await this.discountGroupModel.count();

    if (count === 0) {
      for (const group of DISCOUNT_GROUPS) {
        const groupPayload: CreationAttributes<DiscountGroup> = {
          id: group.id,
          title: group.title,
        };

        await this.discountGroupModel.create(groupPayload);

        const itemsPayload: Array<CreationAttributes<DiscountItem>> =
          group.items.map((item, index) => ({
            id: `${group.id}-${index + 1}`,
            title: item,
            groupId: group.id,
          }));

        if (itemsPayload.length > 0) {
          await this.discountItemModel.bulkCreate(itemsPayload);
        }
      }
    }

    this.seeded = true;
  }
}
