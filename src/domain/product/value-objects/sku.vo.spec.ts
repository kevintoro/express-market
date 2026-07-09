import { SKU } from './sku.vo';

describe('SKU', () => {
  it('accepts an alphanumeric SKU', () => {
    const sku = new SKU('COCA001');
    expect(sku.value).toBe('COCA001');
  });

  it('accepts a hyphenated SKU', () => {
    const sku = new SKU('BEB-001');
    expect(sku.value).toBe('BEB-001');
  });

  it('accepts an SKU at minimum length', () => {
    const sku = new SKU('ABC123');
    expect(sku.value).toBe('ABC123');
  });

  it('accepts an SKU at maximum length', () => {
    const value = 'A'.repeat(20);
    const sku = new SKU(value);
    expect(sku.value).toBe(value);
  });

  it('throws when SKU is too short', () => {
    expect(() => new SKU('AB123')).toThrow(
      'SKU must be alphanumeric or hyphen and 6-20 characters long, got: AB123',
    );
  });

  it('throws when SKU is too long', () => {
    const value = 'A'.repeat(21);
    expect(() => new SKU(value)).toThrow(
      `SKU must be alphanumeric or hyphen and 6-20 characters long, got: ${value}`,
    );
  });

  it('throws when SKU contains invalid characters', () => {
    expect(() => new SKU('COCA_001')).toThrow(
      'SKU must be alphanumeric or hyphen and 6-20 characters long, got: COCA_001',
    );
  });
});
