import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'feedback_entries',
  timestamps: true,
  updatedAt: false,
})
export class FeedbackEntry extends Model<FeedbackEntry> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

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
}
