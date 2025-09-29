import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { FeedbackContactPreference } from '../feedback.types';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @IsIn(['call', 'telegram'])
  contactPreference!: FeedbackContactPreference;
}
