export interface UsageSummaryItem {
  action: string;
  count: number;
}

export interface UsageSummary {
  total: number;
  actions: UsageSummaryItem[];
}
