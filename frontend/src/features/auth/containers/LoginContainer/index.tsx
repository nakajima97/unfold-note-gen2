import LoginComponent from '@/features/auth/components/Login';
import { useGoogleLogin } from './useGoogleLogin';
import { useLoginContainer } from './useLoginContainer';

const isMailPasswordLoginEnabled =
  process.env.NEXT_PUBLIC_MAIL_ADDRESS_PASSWORD_LOGIN === 'true';

const LoginContainer = () => {
  const loginProps = useLoginContainer();
  const { handleGoogleLogin, googleLoading, googleError } = useGoogleLogin();

  return (
    <LoginComponent
      email={loginProps.email}
      setEmail={loginProps.setEmail}
      password={loginProps.password}
      setPassword={loginProps.setPassword}
      loading={loginProps.loading}
      error={loginProps.error}
      message={loginProps.message}
      handleLogin={loginProps.handleLogin}
      handleGoogleLogin={handleGoogleLogin}
      googleLoading={googleLoading}
      googleError={googleError}
      mailPasswordLoginEnabled={isMailPasswordLoginEnabled}
    />
  );
};

export default LoginContainer;
