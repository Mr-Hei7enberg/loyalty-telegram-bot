export enum FeedbackContactPreference {
  Call = 'call',
  Telegram = 'telegram',
}

export const FEEDBACK_CONTACT_PREFERENCES: FeedbackContactPreference[] = [
  FeedbackContactPreference.Call,
  FeedbackContactPreference.Telegram,
];

export function isFeedbackContactPreference(
  value: unknown,
): value is FeedbackContactPreference {
  return (
    typeof value === 'string' &&
    FEEDBACK_CONTACT_PREFERENCES.includes(value as FeedbackContactPreference)
  );
}
