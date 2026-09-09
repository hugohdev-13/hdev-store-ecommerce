import styled from 'styled-components';
import { Link } from 'react-router-dom';
export const Container = styled.div`
  width: min(1240px, calc(100% - 64px));
  margin: 0 auto;
  @media (max-width: 600px) {
    width: calc(100% - 32px);
  }
`;
export const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  background: #366af3;
  color: white;
  font-weight: 600;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: #2455d5;
  }
`;
export const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  padding: 13px 22px;
  background: #366af3;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  &:hover {
    background: #2455d5;
  }
`;
export const SecondaryButton = styled(Button)`
  background: #edf2fb;
  color: #233c65;
  &:hover:not(:disabled) {
    background: #dfe8fa;
  }
`;
export const Panel = styled.section`
  padding: 28px;
  border: 1px solid #e5e9ef;
  border-radius: 14px;
  background: white;
  min-width: 0;
  @media (max-width: 600px) {
    padding: 20px;
  }
`;
export const Page = styled(Container)`
  padding-top: 44px;
  padding-bottom: 64px;
  min-height: 65vh;
  h1 {
    font-size: clamp(28px, 4vw, 38px);
    letter-spacing: -1px;
  }
`;
export const Muted = styled.p`
  color: #657285;
  line-height: 1.7;
`;
export const ErrorText = styled.p`
  color: #af263e;
  font-size: 14px;
  margin: 8px 0 0;
`;
export const Notice = styled.p`
  padding: 14px 16px;
  border-radius: 8px;
  background: #edf4ff;
  color: #294979;
  font-size: 14px;
  line-height: 1.6;
`;
export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(290px, 1fr);
  align-items: start;
  gap: 28px;
  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;
export const EmptyState = styled(Panel)`
  text-align: center;
  padding: 64px 24px;
  svg {
    margin: 0 auto 20px;
    color: #366af3;
  }
  p {
    color: #657285;
  }
`;
export const Stack = styled.div`
  display: grid;
  gap: 22px;
`;
