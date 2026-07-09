export class InvalidOrderQuantityException extends Error {
  constructor(quantity: number, minimumRequired: number) {
    super(
      `Order quantity ${quantity} is below minimum required ${minimumRequired}`,
    );
    this.name = 'InvalidOrderQuantityException';
  }
}
