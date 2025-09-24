import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import type {
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Region } from './region.model';
import { RegionLocation } from './region-location.model';

@Table({
  tableName: 'region_networks',
  timestamps: false,
})
export class RegionNetwork extends Model<
  InferAttributes<RegionNetwork>,
  InferCreationAttributes<RegionNetwork>
> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Region)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'region_id',
  })
  declare regionId: string;

  @BelongsTo(() => Region)
  declare region?: NonAttribute<Region>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @HasMany(() => RegionLocation)
  declare locations?: NonAttribute<RegionLocation[]>;
}
