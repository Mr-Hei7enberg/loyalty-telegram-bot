import { requestJson } from './httpClient';
import type { UsageSummary } from '../types/analytics';

export interface UsageSummaryResponse {
  message: string;
  summary: UsageSummary;
}

export async function fetchUsageSummary(authToken: string) {
  return requestJson<UsageSummaryResponse>('/admin/analytics', {
    authToken,
  });
}
