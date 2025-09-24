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
