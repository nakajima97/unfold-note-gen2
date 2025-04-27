import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import Image from 'next/image';

type LoginComponentProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string | null;
  message: string | null;
  isSignUp: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleSignUp: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  toggleSignUp: () => void;
  googleLoading?: boolean;
  googleError?: string | null;
  mailPasswordLoginEnabled?: boolean;
};

const LoginComponent = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  message,
  isSignUp,
  handleLogin,
  handleSignUp,
  handleGoogleLogin,
  toggleSignUp,
  googleLoading,
  googleError,
  mailPasswordLoginEnabled,
}: LoginComponentProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Unfold Note Logo"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Unfold Note
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'アカウントを作成する'
              : 'ログインしてノートを管理しましょう'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          {/* メールアドレス＋パスワードログインが有効な場合のみ表示 */}
          {mailPasswordLoginEnabled && (
            <form
              onSubmit={isSignUp ? handleSignUp : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  メールアドレス
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  パスワード
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 mt-2">{error}</div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? isSignUp
                    ? 'アカウント作成中...'
                    : 'ログイン中...'
                  : isSignUp
                  ? 'アカウント作成'
                  : 'ログイン'}
              </Button>
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  className="text-sm text-blue-500 hover:underline"
                  onClick={toggleSignUp}
                >
                  {isSignUp ? 'ログイン画面へ' : 'アカウントを作成'}
                </button>
              </div>
            </form>
          )}

          {/* Googleログインは常に表示 */}
          <div className="mt-6">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2"
              disabled={googleLoading}
              variant="outline"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              {googleLoading ? 'Googleログイン中...' : 'Googleでログイン'}
            </Button>
            {googleError && (
              <div className="text-sm text-red-500 mt-2">{googleError}</div>
            )}
          </div>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default LoginComponent;
