import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

type SupertestServer = Parameters<typeof request>[0];

describe('Loyalty API (e2e)', () => {
  let app: INestApplication;
  let server: SupertestServer;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as SupertestServer;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /discount-items повертає перелік груп', async () => {
    const response = await request(server).get('/discount-items').expect(200);

    const body = response.body as {
      introduction: string;
      rules: unknown[];
      groups: unknown[];
    };

    expect(body.introduction).toContain('програми лояльності');
    expect(Array.isArray(body.groups)).toBe(true);
    expect(body.groups.length).toBeGreaterThan(0);
    expect(Array.isArray(body.rules)).toBe(true);
  });

  it('GET /regions повертає області', async () => {
    const response = await request(server).get('/regions').expect(200);

    const body = response.body as { regions: Array<Record<string, unknown>> };

    expect(Array.isArray(body.regions)).toBe(true);
    expect(body.regions.length).toBeGreaterThan(0);
    expect(body.regions[0]).toHaveProperty('id');
    expect(body.regions[0]).toHaveProperty('title');
  });

  it('GET /networks?region=kyivska повертає мережі області', async () => {
    const response = await request(server)
      .get('/networks')
      .query({ region: 'kyivska' })
      .expect(200);

    const body = response.body as {
      region: { id: string };
      networks: Array<Record<string, unknown>>;
    };

    expect(body.region).toMatchObject({ id: 'kyivska' });
    expect(Array.isArray(body.networks)).toBe(true);
    expect(body.networks.length).toBeGreaterThan(0);
  });

  it('GET /locations повертає точки мережі', async () => {
    const response = await request(server)
      .get('/locations')
      .query({ region: 'kyivska', network: 'truck-fuel' })
      .expect(200);

    const body = response.body as {
      region: { id: string };
      network: { id: string };
      locations: unknown[];
    };

    expect(body.region).toMatchObject({ id: 'kyivska' });
    expect(body.network).toMatchObject({ id: 'truck-fuel' });
    expect(Array.isArray(body.locations)).toBe(true);
    expect(body.locations.length).toBeGreaterThan(0);
  });

  it('GET /generate-code повертає QR-код', async () => {
    const response = await request(server)
      .get('/generate-code')
      .query({ card_id: '1234567890' })
      .expect(200);

    const body = response.body as {
      cardId: string;
      code: string;
      expiresAt: string;
      ttlSeconds: number;
      qrCode: { format: string; base64: string };
    };

    expect(body).toMatchObject({ cardId: '1234567890' });
    expect(typeof body.code).toBe('string');
    expect(typeof body.expiresAt).toBe('string');
    expect(typeof body.ttlSeconds).toBe('number');
    expect(body.qrCode).toMatchObject({ format: 'png' });
    expect(typeof body.qrCode.base64).toBe('string');
  });

  it('POST /feedback приймає валідні дані', async () => {
    const response = await request(server)
      .post('/feedback')
      .send({
        phoneNumber: '+380991112233',
        message: 'Дуже подобається сервіс!',
        contactPreference: 'telegram',
      })
      .expect(202);

    const body = response.body as { message: string };

    expect(body.message).toContain('Ваше повідомлення надіслано');
  });

  it('GET /generate-code без параметрів повертає 400', async () => {
    await request(server).get('/generate-code').expect(400);
  });
});
