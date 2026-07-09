import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from './inventory.service';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { InventoryMovementRepositoryPort } from '../../../domain/product/ports/inventory-movement.repository.port';
import { Product } from '../../../domain/product/entities/product.entity';
import { SKU } from '../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../domain/product/value-objects/price.vo';
import { MinStock } from '../../../domain/product/value-objects/min-stock.vo';
import { InsufficientStockException } from '../../../domain/product/exceptions/insufficient-stock.exception';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockProductRepo: jest.Mocked<ProductRepositoryPort>;
  let mockMovementRepo: jest.Mocked<InventoryMovementRepositoryPort>;
  let mockEmitter: jest.Mocked<EventEmitter2>;

  const createTestProduct = () =>
    Product.create(
      'Test',
      new SKU('TEST001'),
      'cat-1',
      new Price(100),
      new MinStock(10),
      'Supplier',
    );

  beforeEach(async () => {
    mockProductRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    mockMovementRepo = {
      save: jest.fn(),
      findByProductId: jest.fn(),
    };

    mockEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: ProductRepositoryPort, useValue: mockProductRepo },
        {
          provide: InventoryMovementRepositoryPort,
          useValue: mockMovementRepo,
        },
        { provide: EventEmitter2, useValue: mockEmitter },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('increases stock with positive quantity', async () => {
    const product = createTestProduct();
    product.adjustStock(50);
    mockProductRepo.findById.mockResolvedValue(product);
    mockProductRepo.save.mockImplementation(async (p) => p);
    mockMovementRepo.save.mockImplementation(async (m) => m);

    const result = await service.adjustStock(product.id, 30, 'New shipment');

    expect(result.product.stockValue).toBe(80);
    expect(result.movement.type).toBe('IN');
    expect(mockEmitter.emit).toHaveBeenCalledWith(
      'stock.adjusted',
      expect.anything(),
    );
  });

  it('decreases stock with negative quantity', async () => {
    const product = createTestProduct();
    product.adjustStock(100);
    mockProductRepo.findById.mockResolvedValue(product);
    mockProductRepo.save.mockImplementation(async (p) => p);
    mockMovementRepo.save.mockImplementation(async (m) => m);

    const result = await service.adjustStock(product.id, -30, 'Sale');

    expect(result.product.stockValue).toBe(70);
    expect(result.movement.type).toBe('OUT');
  });

  it('throws when decreasing below 0', async () => {
    const product = createTestProduct();
    product.adjustStock(10);
    mockProductRepo.findById.mockResolvedValue(product);

    await expect(service.adjustStock(product.id, -15, 'Sale')).rejects.toThrow(
      InsufficientStockException,
    );
  });
});
