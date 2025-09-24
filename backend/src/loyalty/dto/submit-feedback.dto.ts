import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import type { FeedbackContactPreference } from '../interfaces/loyalty.interface';
import { sanitizeStringInput } from './transformers';

const CONTACT_OPTIONS: FeedbackContactPreference[] = ['call', 'telegram'];

export class SubmitFeedbackDto {
  @Transform(({ value }) => sanitizeStringInput(value))
  @Matches(/^\+380\d{9}$/u, {
    message:
      'Номер телефону має бути у форматі +380XXXXXXXXX (9 цифр після коду країни).',
  })
  phoneNumber!: string;

  @Transform(({ value }) => sanitizeStringInput(value))
  @IsString({ message: 'Повідомлення має бути текстовим.' })
  @IsNotEmpty({ message: 'Текст повідомлення не може бути порожнім.' })
  @MaxLength(2000, {
    message: 'Повідомлення має містити не більше 2000 символів.',
  })
  message!: string;

  @Transform(({ value }) => sanitizeStringInput(value))
  @IsString({ message: 'Спосіб зв’язку має бути рядком.' })
  @IsIn(CONTACT_OPTIONS, {
    message: 'Спосіб зв’язку має бути call або telegram.',
  })
  contactPreference!: FeedbackContactPreference;
}
