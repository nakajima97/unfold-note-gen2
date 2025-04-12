import type { Note } from '@/lib/api/note';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import RelatedNotesByTag from './index';

// Sample notes data
const sampleNotes: Note[] = [
  {
    id: '2',
    urlId: 'how-to-use-tags',
    title: 'How to use tags',
    content:
      'Tags are a powerful way to organize your notes. Simply add a #tag1 to your note and it will be automatically tagged.',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    urlId: 'project-planning',
    title: 'Project Planning',
    content:
      'Here are some ideas for the project:\n- Implement search functionality\n- Add #tag1 and #tag2 support\n- Create mobile app',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    urlId: 'meeting-notes',
    title: 'Meeting Notes',
    content:
      'Meeting with the team on 2025-03-25:\n- Discussed project timeline\n- Assigned #tag2 tasks\n- Next meeting scheduled for next week',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const meta: Meta<typeof RelatedNotesByTag> = {
  title: 'Features/Notes/RelatedNotesByTag',
  component: RelatedNotesByTag,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RelatedNotesByTag>;

// 基本的なストーリー
export const Default: Story = {
  args: {
    groupedNotes: {
      tag1: sampleNotes.slice(0, 2),
      tag2: sampleNotes.slice(1, 3),
    },
    isLoading: false,
    error: null,
    tags: ['tag1', 'tag2'],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};

// タグがない場合
export const NoTags: Story = {
  args: {
    groupedNotes: {},
    isLoading: false,
    error: null,
    tags: [],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};

// 関連ノートがない場合
export const NoRelatedNotes: Story = {
  args: {
    groupedNotes: {
      unknowntag: [],
    },
    isLoading: false,
    error: null,
    tags: ['unknowntag'],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};

// ロード中の状態
export const Loading: Story = {
  args: {
    groupedNotes: {},
    isLoading: true,
    error: null,
    tags: ['tag1', 'tag2'],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};

// エラー状態
export const ErrorState: Story = {
  args: {
    groupedNotes: {},
    isLoading: false,
    error: new Error('関連ノートの取得に失敗しました'),
    tags: ['tag1', 'tag2'],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};

// 多くのタグと関連ノートがある場合
export const ManyTags: Story = {
  args: {
    groupedNotes: {
      tag1: sampleNotes.slice(0, 1),
      tag2: sampleNotes.slice(1, 2),
      tag3: sampleNotes.slice(2, 3),
      tag4: sampleNotes.slice(0, 2),
      tag5: sampleNotes.slice(1, 3),
      tag6: sampleNotes,
    },
    isLoading: false,
    error: null,
    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
    projectId: 'project-1',
    onNoteClick: (noteId) => console.log(`Clicked note: ${noteId}`),
  },
};
