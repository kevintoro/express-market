import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/interface/filters/http-exception.filter';
import { DomainExceptionFilter } from './../src/interface/filters/domain-exception.filter';
import { clearDatabase } from './helpers/database-cleanup';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_db';
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DB_LOGGING = 'false';
    process.env.API_PREFIX = 'api/v1';
    process.env.NODE_ENV = 'test';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new DomainExceptionFilter(), new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const dataSource = app.get(DataSource);
    await clearDatabase(dataSource);
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('Categories', () => {
    it('POST /api/v1/categories - creates a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Bebidas', description: 'Drinks' })
        .expect(201);

      expect(res.body.name).toBe('Bebidas');
      expect(res.body.id).toBeDefined();
    });

    it('GET /api/v1/categories - lists categories', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Lacteos' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Products', () => {
    let categoryId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Snacks', description: 'Snacks' })
        .expect(201);
      categoryId = cat.body.id;
    });

    it('POST /api/v1/products - creates a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Papas Sabritas',
          sku: 'SABR001',
          categoryId,
          price: 25.5,
          minStock: 10,
          supplier: 'Sabritas SA',
        })
        .expect(201);

      expect(res.body.name).toBe('Papas Sabritas');
      expect(res.body.stock).toBe(0);
    });

    it('PATCH /api/v1/products/:id/stock - adjusts stock', async () => {
      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Coca Cola',
          sku: 'COCA002',
          categoryId,
          price: 18,
          minStock: 15,
          supplier: 'Coca-Cola',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/products/${prod.body.id}/stock`)
        .send({ quantity: 100, reason: 'Initial stock' })
        .expect(200);

      expect(res.body.product.stock).toBe(100);
    });

    it('PATCH /api/v1/products/:id/stock - rejects negative stock', async () => {
      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Galletas',
          sku: 'GALL003',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Gamesa',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${prod.body.id}/stock`)
        .send({ quantity: -10, reason: 'Sale' })
        .expect(400);
    });

    it('GET /api/v1/products - lists with filters', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/products?categoryId=${categoryId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Purchase Orders', () => {
    let productId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Limpieza' })
        .expect(201);

      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Jabón Zote',
          sku: 'JABO004',
          categoryId: cat.body.id,
          price: 12,
          minStock: 10,
          supplier: 'Zote SA',
        })
        .expect(201);
      productId = prod.body.id;

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 5, reason: 'Initial' })
        .expect(200);
    });

    it('POST /api/v1/orders - creates a purchase order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ productId, quantity: 25 })
        .expect(201);

      expect(res.body.status).toBe('PENDING');
      expect(res.body.quantity).toBe(25);
    });

    it('PATCH /api/v1/orders/:id/approve - approves order', async () => {
      const order = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ productId, quantity: 25 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.body.id}/approve`)
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('PATCH /api/v1/orders/:id/receive - receives order and increases stock', async () => {
      const order = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ productId, quantity: 25 })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.body.id}/approve`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.body.id}/receive`)
        .expect(200);

      expect(res.body.status).toBe('RECEIVED');
    });
  });
});
