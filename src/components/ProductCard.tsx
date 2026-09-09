import { useState } from 'react';
import styled from 'styled-components';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import { money } from '../utils/format';
import { Button } from './common/UI';
const Card = styled.article`
  border: 1px solid #e5e9ef;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 8px 28px #14284410;
  }
  display: flex;
  flex-direction: column;
`;
const Visual = styled.div`
  position: relative;
  background: #f5f6f8;
  padding: 22px;
  height: 205px;
  display: grid;
  place-items: center;
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
  span {
    position: absolute;
    top: 13px;
    left: 13px;
    font-size: 10px;
    padding: 5px 8px;
    background: #fff;
    color: #3b577b;
    border-radius: 4px;
  }
`;
const Content = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  h3 {
    font-size: 17px;
    margin: 7px 0 9px;
  }
  p {
    color: #657285;
    font-size: 12px;
    line-height: 1.65;
    min-height: 40px;
  }
  small {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 1.3px;
    color: #657285;
  }
  strong {
    font-size: 22px;
    letter-spacing: -0.5px;
  }
  em {
    font-size: 11px;
    font-style: normal;
    color: #657285;
    margin-left: 5px;
  }
  button {
    margin-top: 18px;
    width: 100%;
    background: #edf2ff;
    color: #3262dc;
    font-size: 12px;
    &:hover:not(:disabled) {
      background: #dce7ff;
    }
  }
  .stock {
    color: #318369;
    font-size: 11px;
    margin-top: 9px;
  }
  .status {
    min-height: 16px;
    margin-top: 6px;
    font-size: 11px;
    color: #318369;
  }
`;
export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const quantity = useAppSelector(
    (s) => s.cart.items.find((i) => i.product.id === product.id)?.quantity ?? 0,
  );
  const full = quantity >= product.stock;
  return (
    <Card>
      <Visual>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span>{product.tag}</span>}
      </Visual>
      <Content>
        <small>{product.category}</small>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div>
          <strong>{money(product.price)}</strong>
          <em>MXN</em>
        </div>
        <div className="stock">● {product.stock > 0 ? 'Disponible' : 'Agotado'}</div>
        <Button
          disabled={full}
          onClick={() => {
            dispatch(addToCart(product));
            setAdded(true);
          }}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}{' '}
          {full ? 'Stock máximo alcanzado' : 'Agregar al carrito'}
        </Button>
        <div className="status" role="status">
          {added ? 'Agregado a tu carrito' : ''}
        </div>
      </Content>
    </Card>
  );
}
