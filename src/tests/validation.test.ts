import { describe, it, expect } from 'vitest';
import { validatePayment, validateAddress } from '../utils/validation';
describe('Validación de checkout', () => {
  it('rechaza tarjetas incompletas, CVV y fechas vencidas', () => {
    expect(
      validatePayment(
        { holder: '', number: '123', expiration: '01/20', cvv: 'a' },
        new Date('2026-09-09'),
      ),
    ).toHaveProperty('expiration');
    expect(
      Object.keys(validatePayment({ holder: '', number: '123', expiration: '13/35', cvv: 'a' })),
    ).toHaveLength(4);
  });
  it('acepta una fecha durante todo su mes de vigencia', () => {
    expect(
      validatePayment(
        { holder: 'Hugo', number: '4242 4242 4242 4242', expiration: '09/26', cvv: '123' },
        new Date('2026-09-30T12:00:00'),
      ),
    ).toEqual({});
  });
  it('rechaza dirección vacía, CP y teléfono inválidos', () => {
    const errors = validateAddress({
      name: ' ',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '123',
      phone: 'abc',
    });
    expect(Object.keys(errors)).toHaveLength(8);
  });
});
