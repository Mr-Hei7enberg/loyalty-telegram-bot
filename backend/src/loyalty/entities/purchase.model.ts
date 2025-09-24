import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/user.model';

@Table({
  tableName: 'purchases',
  timestamps: true,
  updatedAt: false,
})
export class Purchase extends Model<Purchase> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user?: User;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'purchase_date',
  })
  declare purchaseDate: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_amount',
  })
  declare totalAmount?: number | null;
}
