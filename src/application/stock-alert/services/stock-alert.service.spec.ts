import { Test, TestingModule } from '@nestjs/testing';
import { StockAlertService } from './stock-alert.service';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { StockAlert } from '../../../domain/product/entities/stock-alert.entity';
import { Product } from '../../../domain/product/entities/product.entity';
import { SKU } from '../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../domain/product/value-objects/price.vo';
import { MinStock } from '../../../domain/product/value-objects/min-stock.vo';
import { StockAdjustedEvent } from '../../../domain/product/events/stock-adjusted.event';

describe('StockAlertService', () => {
  let service: StockAlertService;
  let mockAlertRepo: jest.Mocked<StockAlertRepositoryPort>;
  let mockProductRepo: jest.Mocked<ProductRepositoryPort>;

  const createProduct = (stock: number, minStock: number): Product => {
    const p = Product.create(
      'Test',
      new SKU('TEST001'),
      'cat-1',
      new Price(100),
      new MinStock(minStock),
      'Supplier',
    );
    p.adjustStock(stock);
    return p;
  };

  const createEvent = (productId: string): StockAdjustedEvent =>
    new StockAdjustedEvent(productId, 'mov-1', 'IN', 10, 0, 10);

  beforeEach(async () => {
    mockAlertRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findActiveByProductId: jest.fn(),
      findAll: jest.fn(),
    };

    mockProductRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockAlertService,
        { provide: StockAlertRepositoryPort, useValue: mockAlertRepo },
        { provide: ProductRepositoryPort, useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<StockAlertService>(StockAlertService);
  });

  describe('handleStockAdjusted', () => {
    it('creates an ACTIVE alert when product stock is low', async () => {
      const product = createProduct(5, 10);
      mockProductRepo.findById.mockResolvedValue(product);
      mockAlertRepo.findActiveByProductId.mockResolvedValue(null);

      await service.handleStockAdjusted(createEvent(product.id));

      expect(mockAlertRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: product.id,
          type: 'STOCK_LOW',
          status: 'ACTIVE',
        }),
      );
    });

    it('resolves the active alert when stock recovers above minimum', async () => {
      const product = createProduct(20, 10);
      const existingAlert = StockAlert.create(product.id);
      mockProductRepo.findById.mockResolvedValue(product);
      mockAlertRepo.findActiveByProductId.mockResolvedValue(existingAlert);

      await service.handleStockAdjusted(createEvent(product.id));

      expect(mockAlertRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingAlert.id,
          status: 'RESOLVED',
        }),
      );
    });

    it('does not create a duplicate alert when one is already active', async () => {
      const product = createProduct(3, 10);
      const existingAlert = StockAlert.create(product.id);
      mockProductRepo.findById.mockResolvedValue(product);
      mockAlertRepo.findActiveByProductId.mockResolvedValue(existingAlert);

      await service.handleStockAdjusted(createEvent(product.id));

      expect(mockAlertRepo.save).not.toHaveBeenCalled();
    });

    it('ignores event when product is not found', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await service.handleStockAdjusted(createEvent('nonexistent'));

      expect(mockAlertRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns alerts from repository', async () => {
      const alerts = [StockAlert.create('pid-1')];
      mockAlertRepo.findAll.mockResolvedValue(alerts);

      const result = await service.findAll({ status: 'ACTIVE' });

      expect(result).toBe(alerts);
      expect(mockAlertRepo.findAll).toHaveBeenCalledWith({ status: 'ACTIVE' });
    });
  });

  describe('findById', () => {
    it('returns alert from repository', async () => {
      const alert = StockAlert.create('pid-1');
      mockAlertRepo.findById.mockResolvedValue(alert);

      const result = await service.findById('alert-1');

      expect(result).toBe(alert);
      expect(mockAlertRepo.findById).toHaveBeenCalledWith('alert-1');
    });
  });
});
