import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { sanitizeStringInput } from './transformers';

export class LocationsQueryDto {
  @Transform(({ value }) => sanitizeStringInput(value))
  @IsString({ message: 'Параметр region має бути рядком.' })
  @IsNotEmpty({ message: 'Параметр region є обов’язковим.' })
  region!: string;

  @Transform(({ value }) => sanitizeStringInput(value))
  @IsString({ message: 'Параметр network має бути рядком.' })
  @IsNotEmpty({ message: 'Параметр network є обов’язковим.' })
  network!: string;
}
