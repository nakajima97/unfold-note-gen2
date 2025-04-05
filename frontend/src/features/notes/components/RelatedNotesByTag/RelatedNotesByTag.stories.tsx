import type { Note } from '@/lib/api/note';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import RelatedNotesByTag from './index';
import { UseRelatedNotesByTagProps } from './useRelatedNotesByTag';

// Sample notes data
const sampleNotes: Note[] = [
  {
    id: '2',
    title: 'How to use tags',
    content: 'Tags are a powerful way to organize your notes. Simply add a #tag1 to your note and it will be automatically tagged.',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Project Planning',
    content: 'Here are some ideas for the project:\n- Implement search functionality\n- Add #tag1 and #tag2 support\n- Create mobile app',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Meeting Notes',
    content: 'Meeting with the team on 2025-03-25:\n- Discussed project timeline\n- Assigned #tag2 tasks\n- Next meeting scheduled for next week',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Create a mock version of the component for Storybook
const MockRelatedNotesByTag = ({
  mockState,
  ...props
}: {
  currentNoteId: string;
  projectId: string;
  content: string;
  mockState: {
    relatedNotes: Note[];
    isLoading: boolean;
    error: { message: string } | null;
    tags: string[];
  };
}) => {
  // Render different states based on mockState
  const { relatedNotes, isLoading, error, tags } = mockState;
  
  // タグがない場合は何も表示しない
  if (tags.length === 0) {
    return null;
  }

  // ロード中の表示
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // エラーがある場合の表示
  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <div className="text-red-500 p-4 border border-red-200 rounded-md">
          エラー: {error.message}
        </div>
      </div>
    );
  }

  // 関連ノートがない場合
  if (relatedNotes.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <p className="text-muted-foreground text-center py-4">
          同じタグがついているノートはありません
        </p>
      </div>
    );
  }

  // 関連ノートの表示
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedNotes.map((note) => (
          <div
            key={note.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h4 className="font-medium text-lg mb-1 line-clamp-1">{note.title}</h4>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(note.updated_at).toLocaleDateString()}
            </p>
            <p className="text-sm line-clamp-3">{note.content.replace(/#[a-zA-Z0-9_\-]+/g, '')}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={`${note.id}-${tag}`}
                  className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof MockRelatedNotesByTag> = {
  title: 'Features/Notes/RelatedNotesByTag',
  component: MockRelatedNotesByTag,
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
  argTypes: {
    mockState: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof MockRelatedNotesByTag>;

// 基本的なストーリー
export const Default: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This is a note with #tag1 and #tag2 tags.',
    mockState: {
      relatedNotes: sampleNotes,
      isLoading: false,
      error: null,
      tags: ['tag1', 'tag2'],
    },
  },
};

// タグがない場合
export const NoTags: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This note does not have any tags.',
    mockState: {
      relatedNotes: [],
      isLoading: false,
      error: null,
      tags: [],
    },
  },
};

// 関連ノートがない場合
export const NoRelatedNotes: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This note has a #unknowntag that has no related notes.',
    mockState: {
      relatedNotes: [],
      isLoading: false,
      error: null,
      tags: ['unknowntag'],
    },
  },
};

// ロード中の状態
export const Loading: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This is a note with #tag1 and #tag2 tags.',
    mockState: {
      relatedNotes: [],
      isLoading: true,
      error: null,
      tags: ['tag1', 'tag2'],
    },
  },
};

// エラー状態
export const ErrorState: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This is a note with #tag1 and #tag2 tags.',
    mockState: {
      relatedNotes: [],
      isLoading: false,
      error: { message: '関連ノートの取得に失敗しました' },
      tags: ['tag1', 'tag2'],
    },
  },
};

// 多くのタグと関連ノートがある場合
export const ManyTags: Story = {
  args: {
    currentNoteId: '1',
    projectId: 'project-1',
    content: 'This note has many tags: #tag1 #tag2 #tag3 #tag4 #tag5 #tag6',
    mockState: {
      relatedNotes: sampleNotes,
      isLoading: false,
      error: null,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
    },
  },
};
