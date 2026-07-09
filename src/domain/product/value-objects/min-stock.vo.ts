import { ValueObject } from '../../shared/value-object.base';

export class MinStock extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value <= 0 || !Number.isInteger(value)) {
      throw new Error(`Min stock must be a positive integer, got: ${value}`);
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  get minimumOrderQuantity(): number {
    return this.value * 2;
  }
}
