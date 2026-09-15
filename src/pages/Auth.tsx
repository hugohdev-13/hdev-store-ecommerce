import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight, Code2 } from 'lucide-react';
import { Page, Panel, Button, Notice, Muted, Stack } from '../components/common/UI';
import { FormField } from '../components/common/FormField';
import { useAppDispatch } from '../store/hooks';
import { login, register } from '../store/authSlice';
import { registerUser, signIn } from '../services/api';
import axios from 'axios';
const AuthLayout = styled(Page)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1020px;
  @media (max-width: 750px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;
const Intro = styled.div`
  h1 {
    font-size: clamp(32px, 4vw, 47px);
    line-height: 1.15;
  }
  svg {
    color: #366af3;
    margin-bottom: 22px;
  }
  @media (max-width: 750px) {
    h1 {
      font-size: 29px;
    }
    svg {
      display: none;
    }
  }
`;
const Form = styled.form`
  display: grid;
  gap: 17px;
  h2 {
    margin-bottom: 0;
  }
  p {
    margin-bottom: 0;
  }
  a {
    color: #366af3;
    font-weight: 600;
  }
`;
export function Auth({ registration = false }: { registration?: boolean }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (registration && !values.name.trim()) next.name = 'Escribe tu nombre.';
    if (registration && !values.lastName.trim()) next.lastName = 'Escribe tus apellidos.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = 'Escribe un correo electrónico válido.';
    if (values.password.length < 8)
      next.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (registration && values.confirm !== values.password)
      next.confirm = 'Las contraseñas no coinciden.';
    if (registration && !values.confirm) next.confirm = 'Confirma tu contraseña.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const email = values.email.trim().toLowerCase();
    setSubmitting(true);
    try {
      if (registration) {
        await registerUser(values);
        dispatch(register({ name: values.name.trim() + ' ' + values.lastName.trim(), email }));
        navigate('/login', { state: { registered: true } });
      } else {
        dispatch(login(await signIn(email, values.password)));
        navigate('/');
      }
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data : null;
      setErrors({ server: detail?.email?.[0] || detail?.password?.[0] || detail?.detail ||
        'No se pudo completar la solicitud. Revisa tus datos y la conexión con Django.' });
    } finally { setSubmitting(false); }
  }
  const field = (key: keyof typeof values, label: string, type = 'text', autoComplete?: string) => (
    <FormField
      label={label}
      type={type}
      autoComplete={autoComplete}
      required
      value={values[key]}
      error={errors[key]}
      onChange={(e) => setValues({ ...values, [key]: e.target.value })}
    />
  );
  return (
    <AuthLayout>
      <Intro>
        <Code2 size={50} />
        <h1>
          {registration
            ? 'Las grandes ideas empiezan contigo.'
            : 'Tu próximo proyecto empieza aquí.'}
        </h1>
        <Muted>
          Bienvenido a HDev Store. Encuentra las herramientas para crear un espacio tan único como
          tus ideas.
        </Muted>
        <Notice>
          Acceso de demostración: usa un correo válido y una contraseña ficticia de al menos 8
          caracteres. No se verifica una cuenta real.
        </Notice>
      </Intro>
      <Panel>
        <Form noValidate onSubmit={submit}>
          <h2>{registration ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
          <Muted>
            {registration ? 'Únete y prepara tu siguiente setup.' : 'Qué bueno tenerte de vuelta.'}
          </Muted>
          {!registration && location.state?.registered && (
            <Notice role="status">Cuenta de demostración creada. Ya puedes iniciar sesión.</Notice>
          )}
          <Stack>
            {registration && (
              <>
                {field('name', 'Nombre', 'text', 'given-name')}
                {field('lastName', 'Apellidos', 'text', 'family-name')}
              </>
            )}
            {field('email', 'Correo electrónico', 'email', 'email')}
            {field(
              'password',
              'Contraseña',
              'password',
              registration ? 'new-password' : 'current-password',
            )}
            {registration &&
              field('confirm', 'Confirmación de contraseña', 'password', 'new-password')}
          </Stack>
          {errors.server && <Notice role="alert">{errors.server}</Notice>}
          <Button type="submit" disabled={submitting}>
            {registration ? 'Crear cuenta' : 'Iniciar sesión'}
            <ArrowRight size={17} />
          </Button>
          <Muted>
            {registration ? '¿Ya tienes una cuenta?' : '¿Primera vez por aquí?'}{' '}
            <Link to={registration ? '/login' : '/register'}>
              {registration ? 'Inicia sesión' : 'Crea una cuenta'}
            </Link>
          </Muted>
        </Form>
      </Panel>
    </AuthLayout>
  );
}
