export interface DiscountItemDto {
  id: string;
  title: string;
}

export interface DiscountGroupDto {
  id: string;
  title: string;
  items: DiscountItemDto[];
}

export interface RegionDto {
  id: string;
  title: string;
}

export interface RegionNetworkDto {
  id: string;
  title: string;
}

export interface RegionLocationDto {
  id: string;
  title: string;
  address: string;
}

export interface UserMonthlyStatsDto {
  uniqueDays: number;
  totalChecks: number;
  discountPercent: number;
}

export interface UserInfoDto {
  id: number;
  phone: string;
  cardNumber: string | null;
  discountPercent: number;
  monthlyStats: UserMonthlyStatsDto;
}

export interface UserInfoResponseDto {
  message: string;
  user: UserInfoDto;
}

export interface DiscountGroupsResponseDto {
  message: string;
  groups: DiscountGroupDto[];
}

export interface RegionsResponseDto {
  message: string;
  regions: RegionDto[];
}

export interface NetworksResponseDto {
  message: string;
  networks: RegionNetworkDto[];
}

export interface RegionLocationWithOrderDto extends RegionLocationDto {
  order: number;
}

export interface LocationsResponseDto {
  message: string;
  locations: RegionLocationWithOrderDto[];
}

export interface GenerateCodeResponseDto {
  message: string;
  code: string;
  expiresAt: number;
  ttlSeconds: number;
  imageDataUrl: string;
}
