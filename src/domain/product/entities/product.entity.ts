import { Entity } from '../../shared/entity.base';
import { SKU } from '../value-objects/sku.vo';
import { Price } from '../value-objects/price.vo';
import { Stock } from '../value-objects/stock.vo';
import { MinStock } from '../value-objects/min-stock.vo';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';

export interface ProductProps {
  name: string;
  sku: SKU;
  categoryId: string;
  price: Price;
  stock: Stock;
  minStock: MinStock;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  static create(
    name: string,
    sku: SKU,
    categoryId: string,
    price: Price,
    minStock: MinStock,
    supplier: string,
  ): Product {
    return new Product({
      name,
      sku,
      categoryId,
      price,
      stock: new Stock(0),
      minStock,
      supplier,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get skuValue(): string {
    return this.props.sku.value;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get price(): Price {
    return this.props.price;
  }

  get priceValue(): number {
    return this.props.price.value;
  }

  get stock(): Stock {
    return this.props.stock;
  }

  get stockValue(): number {
    return this.props.stock.value;
  }

  get minStock(): MinStock {
    return this.props.minStock;
  }

  get minStockValue(): number {
    return this.props.minStock.value;
  }

  get supplier(): string {
    return this.props.supplier;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      name: this.name,
      sku: this.skuValue,
      categoryId: this.categoryId,
      price: this.priceValue,
      stock: this.stockValue,
      minStock: this.minStockValue,
      supplier: this.supplier,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  adjustStock(quantity: number): { previousStock: Stock; newStock: Stock } {
    const previousStock = this.props.stock;
    let newStock: Stock;

    if (quantity >= 0) {
      newStock = previousStock.add(quantity);
    } else {
      try {
        newStock = previousStock.subtract(Math.abs(quantity));
      } catch {
        throw new InsufficientStockException(
          previousStock.value,
          Math.abs(quantity),
        );
      }
    }

    this.props.stock = newStock;
    this.props.updatedAt = new Date();

    return { previousStock, newStock };
  }

  get isLowStock(): boolean {
    return this.props.stock.value <= this.props.minStock.value;
  }

  get minimumOrderQuantity(): number {
    return this.props.minStock.minimumOrderQuantity;
  }
}
