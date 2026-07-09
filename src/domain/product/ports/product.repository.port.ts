import { Product } from '../entities/product.entity';

export interface ProductFilters {
  categoryId?: string;
  supplier?: string;
  hasActiveAlert?: boolean;
  stockMin?: number;
  stockMax?: number;
}

export abstract class ProductRepositoryPort {
  abstract save(product: Product): Promise<Product>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findBySku(sku: string): Promise<Product | null>;
  abstract findAll(filters?: ProductFilters): Promise<Product[]>;
  abstract delete(id: string): Promise<void>;
}
