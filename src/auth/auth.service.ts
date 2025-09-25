import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { RedisService } from '../redis/redis.service';

export interface AuthTokenPayload extends JwtPayload {
  clientId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly tokenTtlSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.tokenTtlSeconds = Number(
      this.configService.get<string>('AUTH_TOKEN_TTL', '3600'),
    );
  }

  async login(clientId: string, clientSecret: string) {
    const expectedClientId = this.configService.get<string>('AUTH_CLIENT_ID');
    const expectedSecret = this.configService.get<string>('AUTH_CLIENT_SECRET');

    if (!expectedClientId || !expectedSecret) {
      this.logger.error('API credentials are not configured');
      throw new UnauthorizedException(
        'API недоступний. Зверніться до адміністратора.',
      );
    }

    if (clientId !== expectedClientId || clientSecret !== expectedSecret) {
      throw new UnauthorizedException('Невірні облікові дані API.');
    }

    const payload: AuthTokenPayload = { clientId };
    const token = sign(payload, this.getJwtSecret(), {
      expiresIn: this.tokenTtlSeconds,
    });

    await this.redisService.set(
      this.buildRedisKey(token),
      clientId,
      this.tokenTtlSeconds,
    );

    this.logger.log(`API клієнт ${clientId} отримав токен доступу.`);

    return { token, expiresIn: this.tokenTtlSeconds };
  }

  async validateToken(token: string): Promise<AuthTokenPayload> {
    try {
      const payload = verify(token, this.getJwtSecret()) as AuthTokenPayload;
      const exists = await this.redisService.get(this.buildRedisKey(token));

      if (!exists) {
        throw new UnauthorizedException(
          'Токен протерміновано. Авторизуйтеся знову.',
        );
      }

      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Token validation failed: ${message}`);
      throw new UnauthorizedException('Недійсний токен авторизації.');
    }
  }

  async invalidateToken(token: string) {
    await this.redisService.del(this.buildRedisKey(token));
  }

  private getJwtSecret() {
    const secret = this.configService.get<string>('AUTH_JWT_SECRET');

    if (!secret) {
      throw new UnauthorizedException('Секрет для токенів не налаштовано.');
    }

    return secret;
  }

  private buildRedisKey(token: string) {
    return `api-token:${token}`;
  }
}
