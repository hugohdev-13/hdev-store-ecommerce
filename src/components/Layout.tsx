import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import styled from 'styled-components';
import { Header } from './Header';
import { Footer } from './Footer';
const Skip = styled.a`
  position: absolute;
  top: -60px;
  left: 15px;
  z-index: 10;
  padding: 12px;
  background: white;
  &:focus {
    top: 8px;
  }
`;
export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <Skip href="#main">Saltar al contenido</Skip>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
