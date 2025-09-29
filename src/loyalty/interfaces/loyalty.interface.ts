export interface DiscountGroupSeed {
  id: string;
  title: string;
  items: string[];
}

export interface RegionNetworkSeed {
  id: string;
  title: string;
  locations: string[];
}

export interface RegionInfoSeed {
  id: string;
  title: string;
  networks: RegionNetworkSeed[];
}
