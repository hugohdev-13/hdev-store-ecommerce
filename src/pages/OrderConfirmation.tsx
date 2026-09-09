import styled from 'styled-components';
import { Check, PackageCheck } from 'lucide-react';
import { Page, Panel, Muted, LinkButton, TwoColumns, EmptyState } from '../components/common/UI';
import { OrderSummary } from '../components/OrderSummary';
import { useAppSelector } from '../store/hooks';
import { money } from '../utils/format';
const Success = styled.div`
  text-align: center;
  margin-bottom: 35px;
  > svg {
    background: #e2f4ec;
    color: #258260;
    border-radius: 50%;
    padding: 12px;
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(27px, 4vw, 38px);
  }
`;
const Item = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e5e9ef;
  img {
    width: 65px;
    height: 65px;
    object-fit: contain;
    background: #f5f7fa;
    border-radius: 6px;
  }
  p {
    margin: 5px 0;
    font-size: 13px;
    color: #657285;
  }
`;
const AddressBlock = styled.address`
  font-style: normal;
  line-height: 1.8;
  color: #657285;
  overflow-wrap: anywhere;
`;
export function OrderConfirmation() {
  const order = useAppSelector((s) => s.checkout.order);
  if (!order)
    return (
      <Page>
        <EmptyState>
          <PackageCheck size={44} />
          <h1>Aún no hay una compra confirmada</h1>
          <Muted>Tu resumen aparecerá aquí cuando completes el checkout.</Muted>
          <LinkButton to="/">Volver a la tienda</LinkButton>
        </EmptyState>
      </Page>
    );
  const a = order.address;
  return (
    <Page>
      <Success>
        <Check />
        <h1>¡Compra realizada correctamente!</h1>
        <Muted>Tu pedido de demostración está confirmado. Gracias por elegir HDev Store.</Muted>
        <strong>Orden {order.id}</strong>
        <Muted>
          {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(
            new Date(order.date),
          )}
        </Muted>
      </Success>
      <TwoColumns>
        <Panel>
          <h2>Productos comprados</h2>
          {order.items.map((i) => (
            <Item key={i.product.id}>
              <img src={i.product.image} alt={i.product.name} />
              <div>
                <strong>{i.product.name}</strong>
                <p>
                  Cantidad: {i.quantity} · Precio: {money(i.product.price)}
                </p>
                <p>Subtotal: {money(i.product.price * i.quantity)}</p>
              </div>
            </Item>
          ))}
          <br />
          <h2>Dirección de envío</h2>
          <AddressBlock>
            {a.name}
            <br />
            {a.street} {a.number}, {a.neighborhood}
            <br />
            {a.city}, {a.state}, C.P. {a.postalCode}
            <br />
            Tel. {a.phone}
          </AddressBlock>
        </Panel>
        <OrderSummary items={order.items}>
          <LinkButton to="/">Volver a la tienda</LinkButton>
        </OrderSummary>
      </TwoColumns>
    </Page>
  );
}
