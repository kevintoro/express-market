import { ValueObject } from '../../shared/value-object.base';

const SKU_REGEX = /^[A-Za-z0-9-]{6,20}$/;

export class SKU extends ValueObject<{ value: string }> {
  constructor(value: string) {
    if (!SKU_REGEX.test(value)) {
      throw new Error(
        `SKU must be alphanumeric or hyphen and 6-20 characters long, got: ${value}`,
      );
    }
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
