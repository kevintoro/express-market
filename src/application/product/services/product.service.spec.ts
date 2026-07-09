import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { Product } from '../../../domain/product/entities/product.entity';
import { SKU } from '../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../domain/product/value-objects/price.vo';
import { MinStock } from '../../../domain/product/value-objects/min-stock.vo';
import { DuplicateSkuException } from '../../../domain/product/exceptions/duplicate-sku.exception';
import { ProductNotFoundException } from '../../../domain/product/exceptions/product-not-found.exception';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepo: jest.Mocked<ProductRepositoryPort>;

  beforeEach(async () => {
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepositoryPort, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('register', () => {
    it('creates a product when SKU is unique', async () => {
      mockRepo.findBySku.mockResolvedValue(null);
      mockRepo.save.mockImplementation(async (p) => p);

      const result = await service.register(
        'Test Product',
        'TEST001',
        'cat-1',
        100,
        10,
        'Supplier',
      );

      expect(mockRepo.findBySku).toHaveBeenCalledWith('TEST001');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Test Product');
      expect(result.skuValue).toBe('TEST001');
    });

    it('throws DuplicateSkuException when SKU exists', async () => {
      mockRepo.findBySku.mockResolvedValue({} as Product);

      await expect(
        service.register('Test', 'DUPE001', 'cat-1', 100, 10, 'Supplier'),
      ).rejects.toThrow(DuplicateSkuException);
    });
  });

  describe('findById', () => {
    it('returns a product when found', async () => {
      const product = Product.create(
        'Test',
        new SKU('TEST001'),
        'cat-1',
        new Price(100),
        new MinStock(10),
        'Supplier',
      );
      mockRepo.findById.mockResolvedValue(product);

      const result = await service.findById(product.id);

      expect(result).toBe(product);
    });

    it('throws ProductNotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });
});
