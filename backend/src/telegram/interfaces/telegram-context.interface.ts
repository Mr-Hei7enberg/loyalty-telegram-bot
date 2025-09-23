import { Context } from 'telegraf';
import type { Update as TelegramUpdateType } from 'telegraf/typings/core/types/typegram';

export interface AuthenticatedUserPayload {
  id: number;
  phone: string;
  cardNumber: string | null;
  discountPercent: number | null;
}

export interface TelegramSessionData {
  isAuthenticated: boolean;
  user?: AuthenticatedUserPayload;
}

export interface TelegramContext extends Context<TelegramUpdateType> {
  session?: TelegramSessionData;
}

export interface TelegramContact {
  phone_number: string;
  user_id?: number;
}

export interface TelegramContactMessage {
  contact: TelegramContact;
}

export interface TelegramUser {
  id: number;
}
