import { useId, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { ErrorText } from './UI';
export const Input = styled.input`
  width: 100%;
  min-height: 46px;
  border: 1px solid #ccd4df;
  border-radius: 7px;
  padding: 11px 13px;
  background: #fff;
  color: #142844;
  &[aria-invalid='true'] {
    border-color: #af263e;
  }
  &::placeholder {
    color: #8893a2;
  }
`;
const Field = styled.div`
  display: grid;
  gap: 7px;
  label {
    font-size: 14px;
    font-weight: 600;
  }
  min-width: 0;
`;
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
export function FormField({ label, error, id, ...props }: Props) {
  const uniqueId = useId();
  const fieldId = id ?? uniqueId;
  return (
    <Field>
      <label htmlFor={fieldId}>{label}</label>
      <Input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? fieldId + '-error' : undefined}
        {...props}
      />
      {error && (
        <ErrorText id={fieldId + '-error'} role="alert">
          {error}
        </ErrorText>
      )}
    </Field>
  );
}
