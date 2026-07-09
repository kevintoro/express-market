import { Product } from './product.entity';
import { SKU } from '../value-objects/sku.vo';
import { Price } from '../value-objects/price.vo';
import { MinStock } from '../value-objects/min-stock.vo';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';

describe('Product', () => {
  const validProps = () => ({
    name: 'Coca Cola 355ml',
    sku: new SKU('COCA001'),
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    price: new Price(15.5),
    minStock: new MinStock(10),
    supplier: 'Coca-Cola FEMSA',
  });

  it('creates a product with initial stock 0', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    expect(product.name).toBe('Coca Cola 355ml');
    expect(product.stockValue).toBe(0);
    expect(product.skuValue).toBe('COCA001');
  });

  it('increases stock with positive adjustment', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(50);

    expect(product.stockValue).toBe(50);
  });

  it('decreases stock with negative adjustment', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(100);
    product.adjustStock(-30);

    expect(product.stockValue).toBe(70);
  });

  it('throws InsufficientStockException when decreasing below 0', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(10);

    expect(() => product.adjustStock(-15)).toThrow(InsufficientStockException);
    expect(product.stockValue).toBe(10);
  });

  it('detects low stock when stock <= minStock', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(10);

    expect(product.isLowStock).toBe(true);
  });

  it('detects not low stock when stock > minStock', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(100);

    expect(product.isLowStock).toBe(false);
  });

  it('returns minimum order quantity as 2x minStock', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    expect(product.minimumOrderQuantity).toBe(20);
  });

  it('returns correct previous and new stock on adjustment', () => {
    const product = Product.create(
      validProps().name,
      validProps().sku,
      validProps().categoryId,
      validProps().price,
      validProps().minStock,
      validProps().supplier,
    );

    product.adjustStock(50);
    const result = product.adjustStock(30);

    expect(result.previousStock.value).toBe(50);
    expect(result.newStock.value).toBe(80);
  });
});
