import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Panel, Muted } from './common/UI';
import type { CartLine } from '../types';
import { money } from '../utils/format';
const Summary = styled(Panel)`
  background: #f8faff;
  h2 {
    font-size: 21px;
  }
  button,
  a {
    width: 100%;
  }
`;
const Line = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
  padding: 9px 0;
  line-height: 1.5;
  span:last-child {
    white-space: nowrap;
  }
  &.total {
    border-top: 1px solid #dce2ea;
    margin: 13px 0 18px;
    padding-top: 20px;
    font-size: 20px;
    font-weight: 700;
  }
`;
export function OrderSummary({
  items,
  children,
  showProducts = false,
}: {
  items: CartLine[];
  children?: ReactNode;
  showProducts?: boolean;
}) {
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
  return (
    <Summary>
      <h2>Resumen del pedido</h2>
      {showProducts &&
        items.map((i) => (
          <Line key={i.product.id}>
            <span>
              {i.product.name} × {i.quantity}
            </span>
            <span>{money(i.product.price * i.quantity)}</span>
          </Line>
        ))}
      <Line>
        <span>Total de productos</span>
        <span>{count}</span>
      </Line>
      <Line>
        <span>Subtotal</span>
        <span>{money(total)}</span>
      </Line>
      <Line>
        <span>Envío</span>
        <span>Gratis · {money(0)}</span>
      </Line>
      <Line className="total">
        <span>Total</span>
        <span>{money(total)} MXN</span>
      </Line>
      {children}
      <Muted>Precios en pesos mexicanos. Compra de demostración, sin cargos reales.</Muted>
    </Summary>
  );
}
