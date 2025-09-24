import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import type {
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { RegionNetwork } from './region-network.model';

@Table({
  tableName: 'regions',
  timestamps: false,
})
export class Region extends Model<
  InferAttributes<Region>,
  InferCreationAttributes<Region>
> {
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
  declare networks?: NonAttribute<RegionNetwork[]>;
}
