import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto, @Query() query: LoginRequestDto) {
    const dto = this.resolveLoginPayload(body, query);
    const { token, expiresIn } = await this.authService.login(
      dto.clientId,
      dto.clientSecret,
    );

    return {
      token,
      tokenType: 'Bearer',
      expiresIn,
      message: 'Авторизація успішна.',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: AuthenticatedRequest) {
    if (request.authToken) {
      await this.authService.invalidateToken(request.authToken);
    }

    return { message: 'Сесію завершено.' };
  }

  private resolveLoginPayload(
    body: LoginRequestDto,
    query: LoginRequestDto,
  ): LoginDto {
    if (body.clientId && body.clientSecret) {
      return body as LoginDto;
    }

    if (query.clientId && query.clientSecret) {
      return query as LoginDto;
    }

    throw new BadRequestException(
      'Передайте clientId та clientSecret у форматі JSON або як query-параметри.',
    );
  }
}
