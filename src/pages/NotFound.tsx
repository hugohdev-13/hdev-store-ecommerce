import { Page, EmptyState, LinkButton, Muted } from '../components/common/UI';
export function NotFound() {
  return (
    <Page>
      <EmptyState>
        <h1>404 · Esta página no está en el catálogo</h1>
        <Muted>El enlace no existe. Encuentra tu camino de vuelta a la tienda.</Muted>
        <LinkButton to="/">Volver a la tienda</LinkButton>
      </EmptyState>
    </Page>
  );
}
