import styled from 'styled-components';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLine } from '../types';
import { money } from '../utils/format';
import { useAppDispatch } from '../store/hooks';
import { decreaseQuantity, increaseQuantity, removeFromCart } from '../store/cartSlice';
const Row = styled.article`
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid #e5e9ef;
  img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    background: #f5f7fa;
    border-radius: 8px;
  }
  h2 {
    font-size: 16px;
    margin: 0 0 8px;
  }
  p {
    font-size: 13px;
    color: #657285;
    margin-bottom: 12px;
  }
  @media (max-width: 550px) {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 12px;
    img {
      width: 72px;
      height: 80px;
    }
    > div:last-child {
      grid-column: 2;
    }
  }
`;
const Quantity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid #dce2ea;
    background: white;
    border-radius: 5px;
    color: #142844;
  }
  span {
    min-width: 16px;
    text-align: center;
  }
  .remove {
    margin-left: 8px;
    color: #9e4050;
    border: 0;
  }
`;
export function CartItem({ item }: { item: CartLine }) {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;
  return (
    <Row>
      <img src={product.image} alt={product.name} />
      <div>
        <h2>{product.name}</h2>
        <p>{money(product.price)} MXN / unidad</p>
        <Quantity>
          <button
            disabled={quantity <= 1}
            aria-label={'Disminuir cantidad de ' + product.name}
            onClick={() => dispatch(decreaseQuantity(product.id))}
          >
            <Minus size={15} />
          </button>
          <span aria-label={'Cantidad de ' + product.name}>{quantity}</span>
          <button
            disabled={quantity >= product.stock}
            aria-label={'Aumentar cantidad de ' + product.name}
            onClick={() => dispatch(increaseQuantity(product.id))}
          >
            <Plus size={15} />
          </button>
          <button
            className="remove"
            aria-label={'Eliminar ' + product.name}
            onClick={() => dispatch(removeFromCart(product.id))}
          >
            <Trash2 size={17} />
          </button>
        </Quantity>
      </div>
      <div>
        <strong>{money(product.price * quantity)}</strong>
      </div>
    </Row>
  );
}
