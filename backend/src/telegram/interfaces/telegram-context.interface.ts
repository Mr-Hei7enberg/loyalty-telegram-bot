import type { Context } from 'telegraf';
import type { Update as TelegramUpdateType } from 'telegraf/types';

export interface UserSessionState {
  phoneNumber?: string;
  cardNumber?: string;
  discountPercent?: number;
  isAuthenticated?: boolean;
  dynamicCode?: {
    value: string;
    expiresAt: number;
  };
  feedbackDraft?: {
    contactPreference?: 'call' | 'telegram';
    message?: string;
  };
}

export type TelegramContext = Context<TelegramUpdateType> & {
  session?: UserSessionState;
};
