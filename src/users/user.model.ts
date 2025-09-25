import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Purchase } from '../loyalty/entities/purchase.model';
import { UserActionLog } from '../analytics/entities/user-action-log.model';

@Table({ tableName: 'users', timestamps: false }) // отключаем createdAt/updatedAt если их нет
export class User extends Model<
  InferAttributes<User, { omit: 'purchases' | 'actions' }>,
  InferCreationAttributes<User, { omit: 'purchases' | 'actions' }>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare card_number: CreationOptional<string | null>;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare discount_percent: CreationOptional<number | null>;

  @HasMany(() => Purchase)
  declare purchases?: NonAttribute<Purchase[]>;

  @HasMany(() => UserActionLog)
  declare actions?: NonAttribute<UserActionLog[]>;
}
