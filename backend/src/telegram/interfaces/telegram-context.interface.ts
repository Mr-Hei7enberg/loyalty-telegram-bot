import type { Context } from 'telegraf';
import type { Update as TelegramUpdateType } from 'telegraf/types';
import type {
  DynamicCodeSnapshot,
  FeedbackContactPreference,
} from '../../loyalty/interfaces/loyalty.interface';

export interface UserSessionState {
  phoneNumber?: string;
  cardNumber?: string;
  discountPercent?: number;
  isAuthenticated?: boolean;
  dynamicCode?: DynamicCodeSnapshot;
  feedbackDraft?: {
    contactPreference?: FeedbackContactPreference;
    message?: string;
  };
}

export type TelegramContext = Context<TelegramUpdateType> & {
  session?: UserSessionState;
};
