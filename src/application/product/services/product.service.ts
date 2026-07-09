import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import type { ProductFilters } from '../../../domain/product/ports/product.repository.port';
import { Product } from '../../../domain/product/entities/product.entity';
import { SKU } from '../../../domain/product/value-objects/sku.vo';
import { Price } from '../../../domain/product/value-objects/price.vo';
import { MinStock } from '../../../domain/product/value-objects/min-stock.vo';
import { ProductNotFoundException } from '../../../domain/product/exceptions/product-not-found.exception';
import { DuplicateSkuException } from '../../../domain/product/exceptions/duplicate-sku.exception';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepositoryPort,
  ) {}

  async register(
    name: string,
    skuValue: string,
    categoryId: string,
    priceValue: number,
    minStockValue: number,
    supplier: string,
  ): Promise<Product> {
    const existing = await this.productRepo.findBySku(skuValue);
    if (existing) {
      throw new DuplicateSkuException(skuValue);
    }

    const sku = new SKU(skuValue);
    const price = new Price(priceValue);
    const minStock = new MinStock(minStockValue);

    const product = Product.create(
      name,
      sku,
      categoryId,
      price,
      minStock,
      supplier,
    );
    return this.productRepo.save(product);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepo.findAll(filters);
  }
}
