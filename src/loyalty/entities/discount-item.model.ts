import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DiscountGroup } from './discount-group.model';

@Table({
  tableName: 'discount_items',
  timestamps: false,
})
export class DiscountItem extends Model<DiscountItem> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => DiscountGroup)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'group_id',
  })
  declare groupId: string;

  @BelongsTo(() => DiscountGroup)
  declare group?: DiscountGroup;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;
}
