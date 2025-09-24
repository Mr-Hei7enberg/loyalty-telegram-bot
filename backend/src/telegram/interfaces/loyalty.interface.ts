export interface DiscountGroup {
  id: string;
  title: string;
  items: string[];
}

export interface RegionNetwork {
  id: string;
  title: string;
  locations: string[];
}

export interface RegionInfo {
  id: string;
  title: string;
  networks: RegionNetwork[];
}

export type FeedbackContactPreference = 'call' | 'telegram';

export interface FeedbackPayload {
  phoneNumber: string;
  message: string;
  contactPreference: FeedbackContactPreference;
}
