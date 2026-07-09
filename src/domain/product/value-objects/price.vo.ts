import { ValueObject } from '../../shared/value-object.base';

export class Price extends ValueObject<{ value: number }> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error(`Price must be greater than 0, got: ${value}`);
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
