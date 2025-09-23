import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App as SupertestApp } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    const server: unknown = app.getHttpServer();
    if (
      !server ||
      (typeof server !== 'function' && typeof server !== 'object')
    ) {
      throw new Error('HTTP server is not initialized');
    }

    return request(server as SupertestApp)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
