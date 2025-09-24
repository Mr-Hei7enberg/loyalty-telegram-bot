import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { User } from '../../users/user.model';

@Table({
  tableName: 'user_action_logs',
  timestamps: true,
  updatedAt: false,
})
export class UserActionLog extends Model<
  InferAttributes<UserActionLog>,
  InferCreationAttributes<UserActionLog>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: CreationOptional<number | null>;

  @BelongsTo(() => User)
  declare user?: NonAttribute<User>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'phone_number',
  })
  declare phoneNumber: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare action: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata: CreationOptional<Record<string, unknown> | null>;

  declare readonly createdAt: CreationOptional<Date>;
}
