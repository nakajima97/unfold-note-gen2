import LoginComponent from '@/features/auth/components/Login';
import { useGoogleLogin } from './useGoogleLogin';
import { useLoginContainer } from './useLoginContainer';

const isMailPasswordLoginEnabled = process.env.NEXT_PUBLIC_MAIL_ADDRESS_PASSWORD_LOGIN === 'true';

const LoginContainer = () => {
  const loginProps = useLoginContainer();
  const { handleGoogleLogin, googleLoading, googleError } = useGoogleLogin();

  return (
    <LoginComponent
      {...loginProps}
      handleGoogleLogin={handleGoogleLogin}
      googleLoading={googleLoading}
      googleError={googleError}
      mailPasswordLoginEnabled={isMailPasswordLoginEnabled}
    />
  );
};

export default LoginContainer;
