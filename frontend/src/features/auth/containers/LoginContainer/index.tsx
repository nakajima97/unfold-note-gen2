import LoginComponent from '@/features/auth/components/Login';
import { useLoginContainer } from './useLoginContainer';

const LoginContainer = () => {
  const loginProps = useLoginContainer();

  return <LoginComponent {...loginProps} />;
};

export default LoginContainer;
