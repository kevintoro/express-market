export class InsufficientStockException extends Error {
  constructor(
    public readonly currentStock: number,
    public readonly requested: number,
  ) {
    super(
      `Insufficient stock: have ${currentStock}, need ${requested} (missing ${requested - currentStock})`,
    );
    this.name = 'InsufficientStockException';
  }
}
