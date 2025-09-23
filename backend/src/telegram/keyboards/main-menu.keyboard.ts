import { Markup } from 'telegraf';

const MAIN_MENU_BUTTONS: string[][] = [
  ['Моя знижка', 'Моя карта'],
  ['Мережа АЗС зі знижкою', 'Скарга / Пропозиція'],
];

export const buildMainMenuKeyboard = () =>
  Markup.keyboard(MAIN_MENU_BUTTONS).resize();

export type MainMenuKeyboard = ReturnType<typeof buildMainMenuKeyboard>;
