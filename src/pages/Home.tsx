import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Laptop,
  Monitor,
  Keyboard,
  Cpu,
  Cable,
  Search,
} from 'lucide-react';
import { Container, LinkButton, Muted } from '../components/common/UI';
import { ProductGrid } from '../components/ProductGrid';
import type { Product } from '../types';
import { fetchProducts } from '../services/api';
const Hero = styled.section`
  background: #edf2f8;
  overflow: hidden;
`;
const HeroInner = styled(Container)`
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  min-height: 440px;
  align-items: center;
  gap: 16px;
  padding-top: 45px;
  padding-bottom: 45px;
  h1 {
    font-size: clamp(36px, 4.4vw, 61px);
    letter-spacing: -2.5px;
    line-height: 1.08;
    margin: 19px 0;
    max-width: 520px;
  }
  h1 span {
    color: #366af3;
  }
  p {
    max-width: 405px;
    font-size: 15px;
    margin-bottom: 26px;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    padding-top: 36px;
    padding-bottom: 20px;
    h1 {
      letter-spacing: -1.5px;
    }
  }
`;
const Eyebrow = styled.div`
  font-size: 11px;
  color: #366af3;
  font-weight: 700;
  letter-spacing: 1.7px;
  display: flex;
  gap: 9px;
  align-items: center;
  &::before {
    content: '';
    width: 17px;
    height: 2px;
    background: #366af3;
  }
`;
const HeroArt = styled.div`
  position: relative;
  img {
    width: 100%;
  }
  small {
    position: absolute;
    bottom: 4%;
    right: 6%;
    font-size: 10px;
    color: #667b98;
    letter-spacing: 1px;
  }
  @media (max-width: 700px) {
    max-width: 480px;
    margin: 0 auto;
  }
`;
const Benefits = styled(Container)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-top: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #e5e9ef;
  gap: 20px;
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }
  svg {
    color: #466b9b;
    flex-shrink: 0;
  }
  strong {
    font-size: 13px;
    display: block;
    margin-bottom: 4px;
  }
  small {
    color: #657285;
    font-size: 11px;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    > div {
      justify-content: flex-start;
    }
  }
`;
const Catalog = styled(Container)`
  padding-top: 40px;
  padding-bottom: 52px;
`;
const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 25px;
  h2 {
    font-size: 27px;
    letter-spacing: -0.8px;
    margin: 0 0 8px;
  }
  p {
    font-size: 13px;
    margin-bottom: 0;
  }
  small {
    color: #657285;
    font-size: 12px;
  }
`;
const CategoryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 39px;
  @media (max-width: 850px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Category = styled.button<{ $active: boolean }>`
  border: 1px solid ${(p) => (p.$active ? '#92aff8' : '#e5e9ef')};
  background: ${(p) => (p.$active ? '#edf2ff' : 'white')};
  border-radius: 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  padding: 18px 6px;
  font-size: 11px;
  color: ${(p) => (p.$active ? '#366af3' : '#53647a')};
  svg {
    flex-shrink: 0;
  }
  &:hover {
    border-color: #92aff8;
  }
`;
const Filters = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 22px;
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  input,
  select {
    min-height: 40px;
    border: 1px solid #dce2ea;
    border-radius: 6px;
    padding: 8px 10px;
    color: #52647a;
    background: #fff;
    max-width: 100%;
  }
  input {
    width: 215px;
  }
  @media (max-width: 480px) {
    label {
      width: 100%;
    }
    input {
      width: 100%;
    }
  }
`;
const Promo = styled.div`
  background: #142844;
  border-radius: 12px;
  margin-top: 38px;
  padding: 31px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: #fff;
  h2 {
    font-size: 25px;
    margin: 0 0 9px;
    letter-spacing: -0.5px;
  }
  p {
    font-size: 13px;
    color: #b8c8df;
    margin: 0;
  }
  a {
    white-space: nowrap;
    background: white;
    color: #142844;
  }
  @media (max-width: 650px) {
    flex-direction: column;
    align-items: start;
    padding: 25px;
  }
`;
const categoryIcons = [Cpu, Laptop, Monitor, Keyboard, Headphones, Cpu, Cable];
export function Home({ catalogOnly = false }: { catalogOnly?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const categories = ['Todos', ...new Set(products.map((p) => p.category))];
  useEffect(() => {
    let active = true;
    fetchProducts().then((data) => { if (active) setProducts(data); })
      .catch(() => { if (active) setLoadError('No se pudo cargar el catálogo. Verifica la conexión con Django.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? 'Todos';
  const query = params.get('q') ?? '';
  const [sort, setSort] = useState('featured');
  const visible = products
    .filter(
      (p) =>
        (category === 'Todos' || p.category === category) &&
        (p.name + ' ' + p.description + ' ' + p.category)
          .toLocaleLowerCase('es')
          .includes(query.toLocaleLowerCase('es')),
    )
    .sort((a, b) =>
      sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : a.id - b.id,
    );
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <>
      {!catalogOnly && (
        <>
          <Hero>
            <HeroInner>
              <div>
                <Eyebrow>EL SIGUIENTE NIVEL EMPIEZA AQUÍ</Eyebrow>
                <h1>
                  Tu espacio.
                  <br />
                  Tus ideas.
                  <br />
                  <span>Tu mejor setup.</span>
                </h1>
                <Muted>
                  Bienvenido a HDev Store. Tecnología y accesorios para programar, crear y hacer que
                  las cosas pasen.
                </Muted>
                <LinkButton to="/products">
                  Explorar productos <ArrowRight size={17} />
                </LinkButton>
              </div>
              <HeroArt>
                <img
                  src="/images/setup.svg"
                  alt="Setup HDev con laptop, monitor, teclado y mouse sobre un escritorio"
                />
                <small>DISEÑADO PARA LO QUE SIGUE</small>
              </HeroArt>
            </HeroInner>
          </Hero>
          <Benefits>
            <div>
              <Truck size={25} />
              <div>
                <strong>Envío gratis</strong>
                <small>En todos tus pedidos</small>
              </div>
            </div>
            <div>
              <ShieldCheck size={25} />
              <div>
                <strong>Explora con confianza</strong>
                <small>Una experiencia de compra simulada</small>
              </div>
            </div>
            <div>
              <Headphones size={25} />
              <div>
                <strong>Pensado para creadores</strong>
                <small>Herramientas que siguen tu ritmo</small>
              </div>
            </div>
          </Benefits>
        </>
      )}
      <Catalog>
        {catalogOnly && <h1>Encuentra tu próximo upgrade</h1>}
        <Heading>
          <div>
            <h2>Un setup para cada idea</h2>
            <Muted>Explora nuestras categorías y encuentra lo que necesitas.</Muted>
          </div>
        </Heading>
        <CategoryRow aria-label="Categorías">
          {categories.map((item, index) => {
            const Icon = categoryIcons[index];
            return (
              <Category
                key={item}
                $active={item === category}
                aria-pressed={item === category}
                onClick={() => update('category', item)}
              >
                <Icon size={19} />
                {item}
              </Category>
            );
          })}
        </CategoryRow>
        <Heading>
          <div>
            <h2>{category === 'Todos' ? 'Favoritos para tu próximo proyecto' : category}</h2>
            <Muted>Pequeños upgrades. Grandes posibilidades.</Muted>
          </div>
          <small>{visible.length} productos</small>
        </Heading>
        <Filters>
          <label>
            <Search size={16} />
            <input
              aria-label="Filtrar productos"
              placeholder="Buscar en el catálogo"
              value={query}
              onChange={(e) => update('q', e.target.value)}
            />
          </label>
          <label>
            Ordenar por
            <select
              aria-label="Ordenar productos"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Destacados</option>
              <option value="low">Menor precio</option>
              <option value="high">Mayor precio</option>
            </select>
          </label>
        </Filters>
        {loading ? <Muted role="status">Cargando productos...</Muted> : loadError ? (
          <Muted role="alert">{loadError}</Muted>
        ) : visible.length ? (
          <ProductGrid products={visible} />
        ) : (
          <Muted role="status">No encontramos productos. Prueba otra búsqueda o categoría.</Muted>
        )}
        <Promo>
          <div>
            <h2>Tu próxima gran idea merece un gran equipo.</h2>
            <p>Empieza por las herramientas. El resto lo creas tú.</p>
          </div>
          <LinkButton to="/products?category=Accesorios">
            Completa tu setup <ArrowRight size={17} />
          </LinkButton>
        </Promo>
      </Catalog>
    </>
  );
}
