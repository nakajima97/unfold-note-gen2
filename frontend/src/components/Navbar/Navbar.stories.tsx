import type { Meta, StoryObj } from '@storybook/react';
import Navbar from './index';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    onLogout: () => console.log('Logout clicked'),
    isLoggingOut: false,
  },
};

export const LoggingOut: Story = {
  args: {
    onLogout: () => console.log('Logout clicked'),
    isLoggingOut: true,
  },
};

// モバイル表示用のストーリー
export const Mobile: Story = {
  args: {
    onLogout: () => console.log('Logout clicked'),
    isLoggingOut: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
