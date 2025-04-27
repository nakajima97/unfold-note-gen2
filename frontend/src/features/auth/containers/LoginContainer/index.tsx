import LoginComponent from '@/features/auth/components/Login';
import { useGoogleLogin } from './useGoogleLogin';
import { useLoginContainer } from './useLoginContainer';

const LoginContainer = () => {
  const loginProps = useLoginContainer();
  const { handleGoogleLogin, googleLoading, googleError } = useGoogleLogin();

  return (
    <LoginComponent
      {...loginProps}
      handleGoogleLogin={handleGoogleLogin}
      googleLoading={googleLoading}
      googleError={googleError}
    />
  );
};

export default LoginContainer;
