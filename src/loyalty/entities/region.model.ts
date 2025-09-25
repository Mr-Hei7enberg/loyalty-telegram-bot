import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { RegionNetwork } from './region-network.model';

@Table({
  tableName: 'regions',
  timestamps: false,
})
export class Region extends Model<Region> {
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

  @HasMany(() => RegionNetwork)
  declare networks?: RegionNetwork[];
}
