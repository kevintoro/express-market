import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderRepositoryPort } from '../../../domain/product/ports/purchase-order.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';
import { Product } from '../../../domain/product/entities/product.entity';
import { SKU } from '../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../domain/product/value-objects/price.vo';
import { MinStock } from '../../../domain/product/value-objects/min-stock.vo';
import { PurchaseOrder } from '../../../domain/product/entities/purchase-order.entity';
import { InvalidOrderQuantityException } from '../../../domain/product/exceptions/invalid-order-quantity.exception';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let mockOrderRepo: jest.Mocked<PurchaseOrderRepositoryPort>;
  let mockProductRepo: jest.Mocked<ProductRepositoryPort>;
  let mockAlertRepo: jest.Mocked<StockAlertRepositoryPort>;
  let mockEmitter: jest.Mocked<EventEmitter2>;

  const createTestProduct = (stock = 50) => {
    const p = Product.create(
      'Test',
      new SKU('TEST001'),
      'cat-1',
      new Price(100),
      new MinStock(10),
      'Supplier',
    );
    p.adjustStock(stock);
    return p;
  };

  beforeEach(async () => {
    mockOrderRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    mockProductRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    mockAlertRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findActiveByProductId: jest.fn(),
      findAll: jest.fn(),
    };

    mockEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        { provide: PurchaseOrderRepositoryPort, useValue: mockOrderRepo },
        { provide: ProductRepositoryPort, useValue: mockProductRepo },
        { provide: StockAlertRepositoryPort, useValue: mockAlertRepo },
        { provide: EventEmitter2, useValue: mockEmitter },
      ],
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
  });

  describe('create', () => {
    it('creates an order for a valid product', async () => {
      const product = createTestProduct();
      mockProductRepo.findById.mockResolvedValue(product);
      mockOrderRepo.save.mockImplementation(async (o) => o);

      const order = await service.create(product.id, 25);

      expect(order.quantity).toBe(25);
      expect(order.productId).toBe(product.id);
      expect(order.supplier).toBe('Supplier');
    });

    it('throws when quantity is below minimum', async () => {
      const product = createTestProduct();
      mockProductRepo.findById.mockResolvedValue(product);

      await expect(service.create(product.id, 5)).rejects.toThrow(
        InvalidOrderQuantityException,
      );
    });
  });

  describe('approve', () => {
    it('approves a PENDING order', async () => {
      const order = PurchaseOrder.create('pid', 'Supplier', 25, 20);
      mockOrderRepo.findById.mockResolvedValue(order);
      mockOrderRepo.save.mockImplementation(async (o) => o);

      const result = await service.approve(order.id);

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('receive', () => {
    it('receives an order and adjusts stock', async () => {
      const product = createTestProduct(10);
      const order = PurchaseOrder.create(product.id, 'Supplier', 25, 20);
      order.approve();

      mockOrderRepo.findById.mockResolvedValue(order);
      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.save.mockImplementation(async (p) => p);
      mockOrderRepo.save.mockImplementation(async (o) => o);

      const result = await service.receive(order.id);

      expect(result.status).toBe('RECEIVED');
    });
  });
});
