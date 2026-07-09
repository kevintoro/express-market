import { InventoryMovement } from './inventory-movement.entity';

describe('InventoryMovement', () => {
  const productId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates an IN movement with all required fields', () => {
    const movement = InventoryMovement.create(productId, 'IN', 50, 'Initial stock');

    expect(movement.productId).toBe(productId);
    expect(movement.type).toBe('IN');
    expect(movement.quantity).toBe(50);
    expect(movement.reason).toBe('Initial stock');
    expect(movement.createdAt).toBeDefined();
    expect(movement.id).toBeDefined();
  });

  it('creates an OUT movement', () => {
    const movement = InventoryMovement.create(productId, 'OUT', 30, 'Sale');

    expect(movement.type).toBe('OUT');
    expect(movement.quantity).toBe(30);
    expect(movement.reason).toBe('Sale');
  });

  it('is immutable - no setters for type, quantity, or reason', () => {
    const movement = InventoryMovement.create(productId, 'IN', 10, 'Restock');
    const proto = Object.getPrototypeOf(movement);

    expect(
      Object.getOwnPropertyDescriptor(proto, 'type')?.set,
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(proto, 'quantity')?.set,
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(proto, 'reason')?.set,
    ).toBeUndefined();
  });

  it('generates a unique id for each movement', () => {
    const m1 = InventoryMovement.create(productId, 'IN', 10, 'First');
    const m2 = InventoryMovement.create(productId, 'IN', 20, 'Second');

    expect(m1.id).not.toBe(m2.id);
  });
});
