import { StockAlert } from './stock-alert.entity';

describe('StockAlert', () => {
  const productId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates an alert with ACTIVE status', () => {
    const alert = StockAlert.create(productId);

    expect(alert.productId).toBe(productId);
    expect(alert.type).toBe('STOCK_LOW');
    expect(alert.status).toBe('ACTIVE');
    expect(alert.resolvedAt).toBeUndefined();
  });

  it('resolves an alert', () => {
    const alert = StockAlert.create(productId);
    alert.resolve();

    expect(alert.status).toBe('RESOLVED');
    expect(alert.resolvedAt).toBeDefined();
  });

  it('throws when resolving an already resolved alert', () => {
    const alert = StockAlert.create(productId);
    alert.resolve();

    expect(() => alert.resolve()).toThrow('already resolved');
  });

  it('sets triggeredAt on creation', () => {
    const before = new Date(Date.now() - 1000);
    const alert = StockAlert.create(productId);
    const after = new Date(Date.now() + 1000);

    expect(alert.triggeredAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(alert.triggeredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
