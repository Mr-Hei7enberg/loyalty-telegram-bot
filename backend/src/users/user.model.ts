import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Purchase } from '../loyalty/entities/purchase.model';
import { UserActionLog } from '../analytics/entities/user-action-log.model';

@Table({ tableName: 'users', timestamps: false }) // отключаем createdAt/updatedAt если их нет
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
  })
  declare card_number: string;

  @Column({
    type: DataType.INTEGER,
  })
  declare discount_percent: number;

  @HasMany(() => Purchase)
  declare purchases?: Purchase[];

  @HasMany(() => UserActionLog)
  declare actions?: UserActionLog[];
}
