import type { Note } from '@/lib/api/note';
import type { Meta, StoryObj } from '@storybook/react';
import NoteCard from './index';

const meta: Meta<typeof NoteCard> = {
  title: 'Features/Notes/NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NoteCard>;

// Sample note data
const sampleNote: Note = {
  id: '1',
  urlId: 'getting-started-with-unfold-note',
  title: 'Getting Started with Unfold Note',
  content:
    'Welcome to Unfold Note! This is a simple note-taking app that uses #markdown and #tags to organize your notes.',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

const longTitleNote: Note = {
  id: '2',
  urlId: 'long-title-note',
  title:
    'This is a very long title that should be truncated because it exceeds the available space in the card header',
  content:
    'This note has a very long title to test the truncation functionality.',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

const longContentNote: Note = {
  id: '3',
  urlId: 'note-with-long-content',
  title: 'Note with Long Content',
  content:
    'This note has a very long content that should be truncated. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
};

const manyTagsNote: Note = {
  id: '4',
  urlId: 'note-with-many-tags',
  title: 'Note with Many Tags',
  content:
    'This note has many tags: #react #nextjs #typescript #tailwindcss #storybook #testing #frontend #development #javascript #webdev #coding #programming',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

const noTagsNote: Note = {
  id: '5',
  urlId: 'note-without-tags',
  title: 'Note without Tags',
  content: 'This note does not have any tags.',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
};

// サムネイル画像付きのノート
const withThumbnailNote: Note = {
  id: '6',
  urlId: 'note-with-thumbnail',
  title: 'サムネイル画像付きノート',
  content:
    '<p>このノートにはサムネイル画像が含まれています。<img src="/logo.png" alt="Unfold Note Logo" /></p><p>画像の下に表示されるテキストです。</p><p>タグも含めています: #サムネイル #画像 #テスト</p>',
  project_id: 'project-1',
  created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  thumbnail_url: '/logo.png',
};

export const Default: Story = {
  args: {
    note: sampleNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};

export const LongTitle: Story = {
  args: {
    note: longTitleNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};

export const LongContent: Story = {
  args: {
    note: longContentNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};

export const ManyTags: Story = {
  args: {
    note: manyTagsNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};

export const NoTags: Story = {
  args: {
    note: noTagsNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};

export const WithThumbnail: Story = {
  args: {
    note: withThumbnailNote,
    onClick: (id) => console.log(`Note clicked: ${id}`),
  },
};
