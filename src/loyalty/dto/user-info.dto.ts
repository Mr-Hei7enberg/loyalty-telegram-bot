import { MonthlyPurchaseStats } from '../interfaces/monthly-purchase-stats.interface';

export interface LoyaltyUserInfo {
  id: number;
  phone: string;
  cardNumber: string | null;
  discountPercent: number;
  monthlyStats: MonthlyPurchaseStats;
}

export interface LoyaltyUserInfoResponse {
  message: string;
  user: LoyaltyUserInfo;
}
