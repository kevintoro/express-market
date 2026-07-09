import { Product } from '../../../../domain/product/entities/product.entity';
import { SKU } from '../../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../../domain/product/value-objects/price.vo';
import { Stock } from '../../../../domain/product/value-objects/stock.vo';
import { MinStock } from '../../../../domain/product/value-objects/min-stock.vo';
import { ProductOrmEntity } from '../entities/product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product(
      {
        name: orm.name,
        sku: new SKU(orm.sku),
        categoryId: orm.categoryId,
        price: new Price(Number(orm.price)),
        stock: new Stock(orm.stock),
        minStock: new MinStock(orm.minStock),
        supplier: orm.supplier,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.sku = domain.skuValue;
    orm.categoryId = domain.categoryId;
    orm.price = domain.priceValue;
    orm.stock = domain.stockValue;
    orm.minStock = domain.minStockValue;
    orm.supplier = domain.supplier;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
