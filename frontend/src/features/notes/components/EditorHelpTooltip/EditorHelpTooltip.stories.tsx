import type { Meta, StoryObj } from '@storybook/react';
import EditorHelpTooltip from './index';

const meta = {
  title: 'Features/Notes/EditorHelpTooltip',
  component: EditorHelpTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditorHelpTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのエディターヘルプツールチップの表示
 */
export const Default: Story = {
  args: {},
  render: () => (
    <div className="p-10">
      <div className="flex items-center gap-2">
        <span>エディターのヘルプ：</span>
        <EditorHelpTooltip />
      </div>
    </div>
  ),
};

/**
 * ラベルと一緒に表示する例
 */
export const WithLabel: Story = {
  args: {},
  render: () => (
    <div className="p-10">
      <div className="flex items-center gap-2">
        <label className="text-lg font-medium">内容</label>
        <EditorHelpTooltip />
      </div>
    </div>
  ),
};
