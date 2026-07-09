import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/interface/filters/http-exception.filter';
import { DomainExceptionFilter } from './../src/interface/filters/domain-exception.filter';
import { clearDatabase } from './helpers/database-cleanup';

async function waitForAlertStatus(
  productId: string,
  expectedStatus: string,
  app: any,
  timeout = 3000,
): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/products/${productId}/alerts`)
      .expect(200);
    if (res.body.length > 0 && res.body[0].status === expectedStatus) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(
    `Expected alert status "${expectedStatus}" not reached within ${timeout}ms`,
  );
}

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
    app.useGlobalFilters(
      new DomainExceptionFilter(),
      new HttpExceptionFilter(),
    );
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

  describe('Alerts', () => {
    let categoryId: string;
    let productId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Bebidas', description: 'Drinks' })
        .expect(201);
      categoryId = cat.body.id;

      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Gaseosa',
          sku: 'GASE005',
          categoryId,
          price: 10,
          minStock: 10,
          supplier: 'Bebidas SA',
        })
        .expect(201);
      productId = prod.body.id;
    });

    it('creates STOCK_LOW alert when stock drops below minimum', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 5, reason: 'Initial stock' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/alerts`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].type).toBe('STOCK_LOW');
      expect(res.body[0].status).toBe('ACTIVE');
      expect(res.body[0].productId).toBe(productId);
    });

    it('resolves alert when stock rises above minimum', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 5, reason: 'Initial' })
        .expect(200);

      await waitForAlertStatus(productId, 'ACTIVE', app);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 20, reason: 'Restock' })
        .expect(200);

      await waitForAlertStatus(productId, 'RESOLVED', app);

      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/alerts`)
        .expect(200);
      expect(getRes.body.length).toBe(1);
      expect(getRes.body[0].resolvedAt).toBeDefined();
    });

    it('does not create duplicate active alerts', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 5, reason: 'Initial' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 2, reason: 'More stock' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/alerts`)
        .expect(200);

      expect(res.body.length).toBe(1);
    });
  });

  describe('Order Receives and Closes Alert', () => {
    let productId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Limpieza' })
        .expect(201);

      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Cloro',
          sku: 'CLOR006',
          categoryId: cat.body.id,
          price: 8,
          minStock: 10,
          supplier: 'Químicos SA',
        })
        .expect(201);
      productId = prod.body.id;

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 5, reason: 'Initial' })
        .expect(200);
    });

    it('receiving an order auto-closes the active alert', async () => {
      await waitForAlertStatus(productId, 'ACTIVE', app);

      const order = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ productId, quantity: 25 })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.body.id}/approve`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.body.id}/receive`)
        .expect(200);

      await waitForAlertStatus(productId, 'RESOLVED', app);

      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/alerts`)
        .expect(200);
      expect(getRes.body.length).toBe(1);
    });
  });

  describe('Query Filters', () => {
    let categoryId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Comestibles' })
        .expect(201);
      categoryId = cat.body.id;
    });

    it('filters products by supplier', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Product A',
          sku: 'SUPPA01',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Supplier A',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Product B',
          sku: 'SUPPB01',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Supplier B',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/products?supplier=Supplier%20A')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Product A');
    });

    it('filters products by active alert', async () => {
      const prodA = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Low Stock Product',
          sku: 'ALERT01',
          categoryId,
          price: 10,
          minStock: 10,
          supplier: 'Test Supplier',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Well Stocked Product',
          sku: 'ALERT02',
          categoryId,
          price: 10,
          minStock: 10,
          supplier: 'Test Supplier',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${prodA.body.id}/stock`)
        .send({ quantity: 5, reason: 'Low stock' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/v1/products?hasActiveAlert=true')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].sku).toBe('ALERT01');
    });

    it('filters products by stock range', async () => {
      const prodA = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Low Stock',
          sku: 'RANGE01',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Supplier',
        })
        .expect(201);

      const prodB = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Medium Stock',
          sku: 'RANGE02',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Supplier',
        })
        .expect(201);

      const prodC = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'High Stock',
          sku: 'RANGE03',
          categoryId,
          price: 10,
          minStock: 5,
          supplier: 'Supplier',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${prodA.body.id}/stock`)
        .send({ quantity: 10, reason: 'Initial' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${prodB.body.id}/stock`)
        .send({ quantity: 50, reason: 'Initial' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${prodC.body.id}/stock`)
        .send({ quantity: 100, reason: 'Initial' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/v1/products?stockMin=20&stockMax=60')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].sku).toBe('RANGE02');
    });
  });

  describe('Inventory Movements', () => {
    let productId: string;

    beforeEach(async () => {
      const cat = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: 'Lácteos' })
        .expect(201);

      const prod = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Queso',
          sku: 'QUES007',
          categoryId: cat.body.id,
          price: 15,
          minStock: 10,
          supplier: 'Lácteos SA',
        })
        .expect(201);
      productId = prod.body.id;
    });

    it('returns movement history with all required fields', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 50, reason: 'Initial stock' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/movements`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].type).toBe('IN');
      expect(res.body[0].quantity).toBe(50);
      expect(res.body[0].reason).toBe('Initial stock');
      expect(res.body[0].productId).toBe(productId);
      expect(res.body[0].createdAt).toBeDefined();
    });

    it('tracks multiple movements in order', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 100, reason: 'First shipment' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: -30, reason: 'Sale to customer' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: 20, reason: 'Restock' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}/movements`)
        .expect(200);

      expect(res.body.length).toBe(3);
      expect(res.body[0].type).toBe('IN');
      expect(res.body[0].reason).toBe('Restock');
      expect(res.body[1].type).toBe('OUT');
      expect(res.body[1].reason).toBe('Sale to customer');
      expect(res.body[2].type).toBe('IN');
      expect(res.body[2].reason).toBe('First shipment');
    });
  });
});
