import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
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
}
