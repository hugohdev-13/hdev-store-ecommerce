import { createGlobalStyle } from 'styled-components';
export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; } body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: ${({ theme }) => theme.colors.ink}; background: #fff; }
  button, input, select { font: inherit; } button, a, input, select { -webkit-tap-highlight-color: transparent; }
  button, a { touch-action: manipulation; } a { color: inherit; text-decoration: none; } button { cursor: pointer; } button:disabled { cursor: not-allowed; opacity: .55; }
  img { max-width: 100%; display: block; } h1,h2,h3,p { margin-top: 0; } :focus-visible { outline: 3px solid #7598ff; outline-offset: 4px; }
  ::selection { background: #d9e4ff; } html { scroll-behavior: smooth; } @media(prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;
