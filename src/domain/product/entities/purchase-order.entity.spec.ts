import { PurchaseOrder } from './purchase-order.entity';
import { InvalidOrderQuantityException } from '../exceptions/invalid-order-quantity.exception';
import { InvalidOrderStateException } from '../exceptions/invalid-order-state.exception';

describe('PurchaseOrder', () => {
  const productId = '550e8400-e29b-41d4-a716-446655440000';
  const supplier = 'Supplier Corp';
  const minQty = 20;

  it('creates an order with PENDING status', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);

    expect(order.status).toBe('PENDING');
    expect(order.productId).toBe(productId);
    expect(order.supplier).toBe(supplier);
    expect(order.quantity).toBe(50);
  });

  it('throws InvalidOrderQuantityException when quantity below min', () => {
    expect(() => PurchaseOrder.create(productId, supplier, 10, minQty)).toThrow(
      InvalidOrderQuantityException,
    );
  });

  it('requires quantity at minQty threshold', () => {
    const order = PurchaseOrder.create(productId, supplier, 20, minQty);
    expect(order.quantity).toBe(20);
  });

  it('transitions PENDING -> APPROVED', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    order.approve();
    expect(order.status).toBe('APPROVED');
  });

  it('transitions PENDING -> REJECTED with reason', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    order.reject('Product discontinued by manufacturer');
    expect(order.status).toBe('REJECTED');
    expect(order.rejectionReason).toBe('Product discontinued by manufacturer');
  });

  it('throws when rejecting without valid reason', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    expect(() => order.reject('Short')).toThrow('at least 10 characters');
  });

  it('transitions APPROVED -> RECEIVED', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    order.approve();
    order.receive();
    expect(order.status).toBe('RECEIVED');
  });

  it('throws when approving an already approved order', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    order.approve();
    expect(() => order.approve()).toThrow(InvalidOrderStateException);
  });

  it('throws when receiving a PENDING order', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    expect(() => order.receive()).toThrow(InvalidOrderStateException);
  });

  it('throws when receiving a REJECTED order', () => {
    const order = PurchaseOrder.create(productId, supplier, 50, minQty);
    order.reject('Product discontinued by manufacturer');
    expect(() => order.receive()).toThrow(InvalidOrderStateException);
  });
});
