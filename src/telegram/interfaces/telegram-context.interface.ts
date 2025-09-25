import type { Context } from 'telegraf';
import type { Update as TelegramUpdateType } from 'telegraf/types';
import type { FeedbackContactPreference } from '../../feedback/feedback.types';

export interface UserSessionState {
  userId?: number;
  phoneNumber?: string;
  cardNumber?: string;
  discountPercent?: number;
  isAuthenticated?: boolean;
  dynamicCode?: {
    value: string;
    expiresAt: number;
  };
  feedbackDraft?: {
    contactPreference?: FeedbackContactPreference;
    message?: string;
  };
}

export type TelegramContext = Context<TelegramUpdateType> & {
  session?: UserSessionState;
};
