import { Code2 } from 'lucide-react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.8px;
  white-space: nowrap;
  span {
    font-weight: 400;
  }
  svg {
    color: #366af3;
  }
`;
export function Logo() {
  return (
    <Brand to="/" aria-label="HDev Store, inicio">
      <Code2 size={31} />
      <div>
        HDev<span> Store</span>
      </div>
    </Brand>
  );
}
