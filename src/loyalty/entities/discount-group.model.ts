import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import type {
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { DiscountItem } from './discount-item.model';

@Table({
  tableName: 'discount_groups',
  timestamps: false,
})
export class DiscountGroup extends Model<
  InferAttributes<DiscountGroup, { omit: 'items' }>,
  InferCreationAttributes<DiscountGroup, { omit: 'items' }>
> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @HasMany(() => DiscountItem)
  declare items?: NonAttribute<DiscountItem[]>;
}
