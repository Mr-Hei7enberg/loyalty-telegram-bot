import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { sanitizeStringInput } from './transformers';

export class NetworksQueryDto {
  @Transform(({ value }) => sanitizeStringInput(value))
  @IsString({ message: 'Параметр region має бути рядком.' })
  @IsNotEmpty({ message: 'Параметр region є обов’язковим.' })
  region!: string;
}
