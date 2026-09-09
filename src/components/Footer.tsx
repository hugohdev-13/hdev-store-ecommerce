import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Code2, ArrowUpRight } from 'lucide-react';
import { Container } from './common/UI';
const Foot = styled.footer`
  background: #f5f7fa;
  border-top: 1px solid #e5e9ef;
  padding: 38px 0 20px;
  font-size: 13px;
  color: #657285;
`;
const Row = styled(Container)`
  display: flex;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
  h3 {
    color: #142844;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 21px;
    margin-bottom: 10px;
  }
  p {
    line-height: 1.7;
  }
  nav {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }
`;
const Bottom = styled(Container)`
  border-top: 1px solid #e0e6ed;
  margin-top: 25px;
  padding-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 12px;
`;
export function Footer() {
  return (
    <Foot>
      <Row>
        <div>
          <h3>
            <Code2 />
            HDev Store
          </h3>
          <p>
            Buenas herramientas. Grandes ideas.
            <br />
            Tecnología para tu siguiente proyecto.
          </p>
        </div>
        <nav aria-label="Enlaces del pie">
          <Link to="/products">
            Explorar productos <ArrowUpRight size={13} />
          </Link>
          <Link to="/cart">Mi carrito</Link>
          <Link to="/login">Mi cuenta</Link>
        </nav>
      </Row>
      <Bottom>
        <span>© {new Date().getFullYear()} HDev Store · Héctor Hugo Hernández</span>
        <span>Proyecto académico · Compras y productos simulados · MXN</span>
      </Bottom>
    </Foot>
  );
}
