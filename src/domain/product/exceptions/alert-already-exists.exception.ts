export class AlertAlreadyExistsException extends Error {
  constructor(productId: string) {
    super(`An active alert already exists for product "${productId}"`);
    this.name = 'AlertAlreadyExistsException';
  }
}
