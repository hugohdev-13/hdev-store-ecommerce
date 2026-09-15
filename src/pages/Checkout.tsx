import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, CreditCard, Check, ShoppingBag } from 'lucide-react';
import {
  Page,
  TwoColumns,
  Panel,
  Stack,
  Button,
  SecondaryButton,
  Notice,
  ErrorText,
  LinkButton,
  EmptyState,
  Muted,
} from '../components/common/UI';
import { FormField } from '../components/common/FormField';
import { OrderSummary } from '../components/OrderSummary';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/cartSlice';
import { placeOrder } from '../store/checkoutSlice';
import type { Address } from '../types';
import { validateAddress, validatePayment, type Payment } from '../utils/validation';
import { createOrder } from '../services/api';
const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;
const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  svg {
    color: #366af3;
  }
`;
const addressFields: { key: keyof Address; label: string; autoComplete: string }[] = [
  { key: 'name', label: 'Nombre completo', autoComplete: 'name' },
  { key: 'street', label: 'Calle', autoComplete: 'address-line1' },
  { key: 'number', label: 'Número', autoComplete: 'off' },
  { key: 'neighborhood', label: 'Colonia', autoComplete: 'address-line2' },
  { key: 'city', label: 'Ciudad', autoComplete: 'address-level2' },
  { key: 'state', label: 'Estado', autoComplete: 'address-level1' },
  { key: 'postalCode', label: 'Código postal', autoComplete: 'postal-code' },
  { key: 'phone', label: 'Teléfono', autoComplete: 'tel' },
];
export function Checkout() {
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>({
    name: user?.name ?? '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });
  const [payment, setPayment] = useState<Payment>({
    holder: '',
    number: '',
    expiration: '',
    cvv: '',
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof Payment, string>>>({});
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [error, setError] = useState('');
  function savePayment() {
    const errors = validatePayment(payment);
    setPaymentErrors(errors);
    setPaymentSaved(!Object.keys(errors).length);
    setError('');
  }
  function changePayment(key: keyof Payment, value: string) {
    setPayment({ ...payment, [key]: value });
    setPaymentSaved(false);
  }
  async function confirm() {
    const errors = validateAddress(address);
    setAddressErrors(errors);
    if (Object.keys(errors).length) {
      setError('Revisa los campos de la dirección de envío.');
      return;
    }
    if (!paymentSaved) {
      setError('Guarda un método de pago simulado válido antes de continuar.');
      return;
    }
    if (!items.length) return;
    try {
      const saved = await createOrder(items, address);
      dispatch(placeOrder({ id: `HD-${saved.id}`, date: saved.created_at,
        items: items.map((i) => ({ ...i, product: { ...i.product } })),
        total: Number(saved.total), address: { ...address } }));
      dispatch(clearCart());
      navigate('/order-confirmation');
    } catch { setError('No se pudo guardar la orden. Inicia sesión y revisa el stock disponible.'); }
  }
  if (!items.length)
    return (
      <Page>
        <EmptyState>
          <ShoppingBag size={44} />
          <h1>Primero elige tu próximo upgrade</h1>
          <Muted>Necesitas al menos un producto para continuar la compra.</Muted>
          <LinkButton to="/products">Explorar productos</LinkButton>
        </EmptyState>
      </Page>
    );
  return (
    <Page>
      <h1>Finaliza tu compra</h1>
      <Muted>Tu nuevo setup está a unos pasos. Todos los datos son de demostración.</Muted>
      <TwoColumns>
        <Stack>
          <Panel>
            <SectionTitle>
              <MapPin size={22} />
              Dirección de envío
            </SectionTitle>
            <Fields>
              {addressFields.map(({ key, label, autoComplete }) => (
                <FormField
                  key={key}
                  label={label}
                  required
                  autoComplete={autoComplete}
                  type={key === 'phone' ? 'tel' : 'text'}
                  inputMode={key === 'phone' || key === 'postalCode' ? 'numeric' : undefined}
                  value={address[key]}
                  error={addressErrors[key]}
                  onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                />
              ))}
            </Fields>
          </Panel>
          <Panel>
            <SectionTitle>
              <CreditCard size={22} />
              Método de pago
            </SectionTitle>
            <Notice>
              Pago simulado: utiliza datos ficticios. Ejemplo: 4242 4242 4242 4242, 12/35 y CVV 123.
              No se realizará ningún cargo.
            </Notice>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                savePayment();
              }}
            >
              <Fields>
                <FormField
                  label="Nombre del titular"
                  required
                  autoComplete="off"
                  value={payment.holder}
                  error={paymentErrors.holder}
                  onChange={(e) => changePayment('holder', e.target.value)}
                />
                <FormField
                  label="Número de tarjeta"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={19}
                  value={payment.number}
                  error={paymentErrors.number}
                  onChange={(e) => changePayment('number', e.target.value)}
                />
                <FormField
                  label="Fecha de expiración"
                  required
                  placeholder="MM/AA"
                  autoComplete="off"
                  maxLength={5}
                  value={payment.expiration}
                  error={paymentErrors.expiration}
                  onChange={(e) => changePayment('expiration', e.target.value)}
                />
                <FormField
                  label="CVV"
                  required
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={payment.cvv}
                  error={paymentErrors.cvv}
                  onChange={(e) => changePayment('cvv', e.target.value)}
                />
              </Fields>
              <br />
              <SecondaryButton type="submit">
                {paymentSaved && <Check size={17} />}Guardar método de pago
              </SecondaryButton>
              {paymentSaved && (
                <Notice role="status">Método de pago simulado guardado correctamente.</Notice>
              )}
            </form>
          </Panel>
        </Stack>
        <OrderSummary items={items} showProducts>
          <Button onClick={confirm}>Confirmar compra</Button>
          {error && <ErrorText role="alert">{error}</ErrorText>}
        </OrderSummary>
      </TwoColumns>
    </Page>
  );
}
