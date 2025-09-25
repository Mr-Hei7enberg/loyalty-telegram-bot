import { PartialType } from '@nestjs/mapped-types';
import { LoginDto } from './login.dto';

export class LoginRequestDto extends PartialType(LoginDto) {}
