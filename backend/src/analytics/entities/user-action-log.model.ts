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
  tableName: 'user_action_logs',
  timestamps: true,
  updatedAt: false,
})
export class UserActionLog extends Model<UserActionLog> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'user_id',
  })
  declare userId?: number | null;

  @BelongsTo(() => User)
  declare user?: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'phone_number',
  })
  declare phoneNumber?: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare action: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata?: Record<string, unknown> | null;
}
