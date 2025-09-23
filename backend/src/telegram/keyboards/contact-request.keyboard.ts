import { Markup } from 'telegraf';

export const buildContactRequestKeyboard = () =>
  Markup.keyboard([[Markup.button.contactRequest('Поділитися номером')]])
    .oneTime()
    .resize();

export type ContactRequestKeyboard = ReturnType<
  typeof buildContactRequestKeyboard
>;
