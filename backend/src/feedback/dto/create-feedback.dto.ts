import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FeedbackContactPreference } from '../feedback.types';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;

  @IsEnum(FeedbackContactPreference)
  contactPreference!: FeedbackContactPreference;
}
