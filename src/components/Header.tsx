import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserRound, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styled from 'styled-components';
import { Container } from './common/UI';
import { Logo } from './Logo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
const Top = styled.div`
  background: #142844;
  color: #e4ebf5;
  text-align: center;
  font-size: 12px;
  padding: 9px 16px;
  letter-spacing: 0.3px;
`;
const Bar = styled.header`
  border-bottom: 1px solid #e5e9ef;
  background: #fff;
`;
const Row = styled(Container)`
  display: flex;
  align-items: center;
  gap: 36px;
  min-height: 86px;
  flex-wrap: wrap;
  padding-top: 15px;
  padding-bottom: 15px;
  @media (max-width: 800px) {
    gap: 16px;
  }
`;
const Nav = styled.nav<{ $open: boolean }>`
  display: flex;
  gap: 25px;
  font-size: 14px;
  a {
    padding: 10px 0;
  }
  a.active {
    color: #366af3;
  }
  @media (max-width: 800px) {
    display: ${(p) => (p.$open ? 'flex' : 'none')};
    order: 4;
    width: 100%;
  }
`;
const SearchBox = styled.form`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f6f8;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  padding: 0 12px;
  input {
    border: 0;
    background: transparent;
    min-height: 40px;
    width: 190px;
    min-width: 0;
    outline-offset: 0;
  }
  button {
    border: 0;
    background: transparent;
    color: #657285;
    padding: 6px;
  }
  @media (max-width: 1080px) {
    display: none;
  }
`;
const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 21px;
  margin-left: auto;
  a {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
  }
  button {
    background: transparent;
    border: 0;
    color: #657285;
    font-size: 12px;
  }
  @media (max-width: 600px) {
    gap: 14px;
    .account-text {
      display: none;
    }
  }
`;
const Badge = styled.span`
  border-radius: 50%;
  background: #366af3;
  color: #fff;
  padding: 3px 6px;
  font-size: 11px;
`;
const Toggle = styled.button`
  display: none;
  border: 0;
  background: transparent;
  color: #142844;
  padding: 6px;
  @media (max-width: 800px) {
    display: block;
  }
`;
export function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const count = useAppSelector((s) => s.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <>
      <Top>Tecnología que inspira. Envío gratis en todos tus pedidos.</Top>
      <Bar>
        <Row>
          <Logo />
          <Nav $open={open} aria-label="Navegación principal">
            <NavLink to="/" end onClick={() => setOpen(false)}>
              Inicio
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              Productos
            </NavLink>
          </Nav>
          <SearchBox
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/products?q=' + encodeURIComponent(search));
            }}
          >
            <input
              aria-label="Buscar productos"
              placeholder="Busca tu próximo upgrade"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button aria-label="Buscar">
              <Search size={18} />
            </button>
          </SearchBox>
          <Actions>
            <NavLink to="/login">
              <UserRound size={20} />
              <span className="account-text">{user ? user.name.split(' ')[0] : 'Mi cuenta'}</span>
            </NavLink>
            {user && <button onClick={() => dispatch(logout())}>Salir</button>}
            <NavLink to="/cart" aria-label={'Carrito, ' + count + ' artículos'}>
              <ShoppingBag size={21} />
              <Badge>{count}</Badge>
            </NavLink>
          </Actions>
          <Toggle
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Toggle>
        </Row>
      </Bar>
    </>
  );
}
