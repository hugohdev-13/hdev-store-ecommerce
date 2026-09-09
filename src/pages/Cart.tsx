import { ShoppingBag, ArrowRight } from 'lucide-react';
import {
  Page,
  Muted,
  TwoColumns,
  Panel,
  SecondaryButton,
  LinkButton,
  EmptyState,
} from '../components/common/UI';
import { CartItem } from '../components/CartItem';
import { OrderSummary } from '../components/OrderSummary';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/cartSlice';
export function Cart() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  return (
    <Page>
      <h1>Tu carrito</h1>
      <Muted>Un paso más cerca de tu nuevo setup.</Muted>
      {items.length ? (
        <TwoColumns>
          <Panel>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
            <SecondaryButton onClick={() => dispatch(clearCart())}>Vaciar carrito</SecondaryButton>
          </Panel>
          <OrderSummary items={items}>
            <LinkButton to="/checkout">
              Continuar compra <ArrowRight size={17} />
            </LinkButton>
          </OrderSummary>
        </TwoColumns>
      ) : (
        <EmptyState>
          <ShoppingBag size={44} />
          <h2>Tu carrito está esperando ideas</h2>
          <p>Explora el catálogo y agrega tus productos favoritos.</p>
          <LinkButton to="/products">Explorar productos</LinkButton>
        </EmptyState>
      )}
    </Page>
  );
}
