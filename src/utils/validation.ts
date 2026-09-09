import type { Address } from '../types';
export function validateAddress(address: Address) {
  const errors: Partial<Record<keyof Address, string>> = {};
  for (const key of Object.keys(address) as (keyof Address)[])
    if (!address[key].trim()) errors[key] = 'Este campo es obligatorio.';
  if (!/^\d{5}$/.test(address.postalCode))
    errors.postalCode = 'Escribe un código postal de 5 dígitos.';
  if (!/^\d{10}$/.test(address.phone.replace(/[\s()-]/g, '')))
    errors.phone = 'Escribe un teléfono de 10 dígitos.';
  return errors;
}
export interface Payment {
  holder: string;
  number: string;
  expiration: string;
  cvv: string;
}
export function validatePayment(payment: Payment, today = new Date()) {
  const errors: Partial<Record<keyof Payment, string>> = {};
  if (payment.holder.trim().length < 3) errors.holder = 'Escribe el nombre del titular.';
  if (!/^\d{16}$/.test(payment.number.replace(/\s/g, '')))
    errors.number = 'Usa 16 dígitos ficticios.';
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(payment.expiration);
  if (!match || new Date(2000 + Number(match[2]), Number(match[1]), 1) <= today)
    errors.expiration = 'Usa una fecha futura en formato MM/AA.';
  if (!/^\d{3,4}$/.test(payment.cvv)) errors.cvv = 'Escribe 3 o 4 dígitos ficticios.';
  return errors;
}
