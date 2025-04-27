import LoginComponent from '@/features/auth/components/Login';
import { useLoginContainer } from './useLoginContainer';
import { useGoogleLogin } from './useGoogleLogin';

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
