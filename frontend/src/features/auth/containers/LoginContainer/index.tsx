import LoginComponent from '@/features/auth/components/Login';
import { useLoginContainer } from './useLoginContainer';

export default function LoginContainer() {
  const loginProps = useLoginContainer();

  return <LoginComponent {...loginProps} />;
}
