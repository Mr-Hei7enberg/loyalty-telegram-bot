import { Table, Column, Model, DataType } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'feedback_entries',
  timestamps: true,
  updatedAt: false,
})
export class FeedbackEntry extends Model<
  InferAttributes<FeedbackEntry>,
  InferCreationAttributes<FeedbackEntry>
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
    field: 'phone_number',
  })
  declare phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'contact_preference',
  })
  declare contactPreference: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare message: string;

  declare readonly createdAt: CreationOptional<Date>;
}
