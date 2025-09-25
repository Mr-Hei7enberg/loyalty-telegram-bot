import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { RegionNetwork } from './region-network.model';

@Table({
  tableName: 'region_locations',
  timestamps: false,
})
export class RegionLocation extends Model<RegionLocation> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => RegionNetwork)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'network_id',
  })
  declare networkId: string;

  @BelongsTo(() => RegionNetwork)
  declare network?: RegionNetwork;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address: string;
}
