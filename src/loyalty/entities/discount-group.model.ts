import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { DiscountItem } from './discount-item.model';

@Table({
  tableName: 'discount_groups',
  timestamps: false,
})
export class DiscountGroup extends Model<DiscountGroup> {
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
  declare items?: DiscountItem[];
}
