import styled from 'styled-components';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Grid>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
}
