import { ValueObject } from '../../shared/value-object.base';

export class Stock extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value < 0 || !Number.isInteger(value)) {
      throw new Error(`Stock must be a non-negative integer, got: ${value}`);
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  add(quantity: number): Stock {
    return new Stock(this.value + quantity);
  }

  subtract(quantity: number): Stock {
    const result = this.value - quantity;
    if (result < 0) {
      throw new Error(
        `Insufficient stock: ${this.value} - ${quantity} would be negative`,
      );
    }
    return new Stock(result);
  }
}
