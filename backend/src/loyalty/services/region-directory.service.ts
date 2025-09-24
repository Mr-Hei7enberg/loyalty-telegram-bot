import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Region } from '../entities/region.model';
import { RegionNetwork } from '../entities/region-network.model';
import { RegionLocation } from '../entities/region-location.model';
import { REGIONS } from '../data/regions.seed';

@Injectable()
export class RegionDirectoryService {
  private seeded = false;

  constructor(
    @InjectModel(Region)
    private readonly regionModel: typeof Region,
    @InjectModel(RegionNetwork)
    private readonly networkModel: typeof RegionNetwork,
    @InjectModel(RegionLocation)
    private readonly locationModel: typeof RegionLocation,
  ) {}

  async getRegions(): Promise<Region[]> {
    await this.ensureSeeded();

    return this.regionModel.findAll({
      order: [['title', 'ASC']],
    });
  }

  async getNetworks(regionId: string): Promise<RegionNetwork[]> {
    await this.ensureSeeded();

    return this.networkModel.findAll({
      where: { regionId },
      order: [['title', 'ASC']],
    });
  }

  async getLocations(networkId: string): Promise<RegionLocation[]> {
    await this.ensureSeeded();

    return this.locationModel.findAll({
      where: { networkId },
      order: [['title', 'ASC']],
    });
  }

  private async ensureSeeded() {
    if (this.seeded) {
      return;
    }

    const count = await this.regionModel.count();

    if (count === 0) {
      for (const region of REGIONS) {
        await this.regionModel.create({
          id: region.id,
          title: region.title,
        });

        for (const network of region.networks) {
          await this.networkModel.create({
            id: network.id,
            regionId: region.id,
            title: network.title,
          });

          await this.locationModel.bulkCreate(
            network.locations.map((location, index) => ({
              id: `${network.id}-${index + 1}`,
              title: location,
              address: location,
              networkId: network.id,
            })),
          );
        }
      }
    }

    this.seeded = true;
  }
}
