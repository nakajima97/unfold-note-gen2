import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import type { Decorator } from '@storybook/react';
import LoginComponent from './index';

// ストーリーを適切なスタイリングで包むデコレータを作成
const withContainer: Decorator = (Story) => (
  <div>
    <Story />
  </div>
);

const meta: Meta<typeof LoginComponent> = {
  title: 'Features/Auth/Login',
  component: LoginComponent,
  parameters: {
    layout: 'fullscreen', // コンポーネントのデザインに合わせてフルスクリーンレイアウトを使用
  },
  tags: ['autodocs'],
  argTypes: {
    email: { control: 'text' },
    password: { control: 'text' },
    loading: { control: 'boolean' },
    error: { control: 'text' },
    message: { control: 'text' },
    isSignUp: { control: 'boolean' },
  },
  decorators: [withContainer],
};

export default meta;
type Story = StoryObj<typeof LoginComponent>;

// すべてのストーリーの共通props
const commonProps = {
  email: '',
  setEmail: action('setEmail'),
  password: '',
  setPassword: action('setPassword'),
  handleLogin: action('handleLogin') as unknown as (
    e: React.FormEvent,
  ) => Promise<void>,
  handleSignUp: action('handleSignUp') as unknown as (
    e: React.FormEvent,
  ) => Promise<void>,
  handleGoogleLogin: action(
    'handleGoogleLogin',
  ) as unknown as () => Promise<void>,
  toggleSignUp: action('toggleSignUp'),
};

// ログインビュー
export const Login: Story = {
  args: {
    ...commonProps,
    loading: false,
    error: null,
    message: null,
    isSignUp: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'デフォルトのログイン画面表示',
      },
    },
  },
};

// サインアップビュー
export const SignUp: Story = {
  args: {
    ...commonProps,
    loading: false,
    error: null,
    message: null,
    isSignUp: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'サインアップ画面表示',
      },
    },
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    ...commonProps,
    loading: true,
    error: null,
    message: null,
    isSignUp: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'ローディング状態の表示',
      },
    },
  },
};

// エラー状態
export const ErrorState: Story = {
  args: {
    ...commonProps,
    loading: false,
    error: 'メールアドレスまたはパスワードが間違っています。',
    message: null,
    isSignUp: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'エラーメッセージ表示',
      },
    },
  },
};

// 成功メッセージ
export const Success: Story = {
  args: {
    ...commonProps,
    loading: false,
    error: null,
    message: 'アカウントが作成されました。ログインしてください。',
    isSignUp: false,
  },
  parameters: {
    docs: {
      description: {
        story: '成功メッセージ表示',
      },
    },
  },
};
