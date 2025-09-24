import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { sanitizeStringInput } from './transformers';

export class GenerateCodeQueryDto {
  @Expose({ name: 'card_id' })
  @Transform(({ value, obj }) => {
    const fallback = (obj as Record<string, unknown>)?.['card_id'];

    return sanitizeStringInput(value ?? fallback);
  })
  @IsString({ message: 'Ідентифікатор картки має бути рядком.' })
  @IsNotEmpty({ message: 'Необхідно передати ідентифікатор картки.' })
  cardId!: string;
}
