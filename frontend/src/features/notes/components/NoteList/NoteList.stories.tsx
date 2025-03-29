import type { Note } from '@/lib/api/note';
import type { Meta, StoryObj } from '@storybook/react';
import NoteList from './index';

const meta: Meta<typeof NoteList> = {
  title: 'Features/Notes/NoteList',
  component: NoteList,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NoteList>;

// Sample notes data
const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Getting Started with Unfold Note',
    content:
      'Welcome to Unfold Note! This is a simple note-taking app that uses #markdown and #tags to organize your notes.',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'How to use tags',
    content:
      'Tags are a powerful way to organize your notes. Simply add a #hashtag to your note and it will be automatically tagged. You can use #multiple #tags in a single note.',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Project Planning',
    content:
      'Here are some ideas for the #project:\n- Implement #search functionality\n- Add #darkmode support\n- Create mobile app',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Meeting Notes',
    content:
      'Meeting with the #team on 2025-03-25:\n- Discussed #project timeline\n- Assigned tasks\n- Next meeting scheduled for next week',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Research on Markdown Editors',
    content:
      'Looking into different #markdown editors for the #project:\n- Tiptap\n- ProseMirror\n- Slate\n- CodeMirror',
    project_id: 'project-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export const Default: Story = {
  args: {
    notes: sampleNotes,
    isLoading: false,
    error: null,
    onNoteClick: (id) => console.log(`ノートがクリックされました: ${id}`),
    onSearchChange: (term) => console.log(`検索ワード: ${term}`),
    searchTerm: '',
    onNewNoteClick: () => console.log('新規ノート作成ボタンがクリックされました'),
  },
};

export const Loading: Story = {
  args: {
    notes: [],
    isLoading: true,
    error: null,
    onNoteClick: () => {},
    onSearchChange: () => {},
    searchTerm: '',
    onNewNoteClick: () => {},
  },
};

export const ErrorState: Story = {
  args: {
    notes: [],
    isLoading: false,
    error: new Error('ノートの読み込みに失敗しました'),
    onNoteClick: () => {},
    onSearchChange: () => {},
    searchTerm: '',
    onNewNoteClick: () => {},
  },
};

export const Empty: Story = {
  args: {
    notes: [],
    isLoading: false,
    error: null,
    onNoteClick: () => {},
    onSearchChange: () => {},
    searchTerm: '',
    onNewNoteClick: () => console.log('新規ノート作成ボタンがクリックされました'),
  },
};

export const WithSearchTerm: Story = {
  args: {
    notes: sampleNotes.filter(
      (note) => note.title.includes('tag') || note.content.includes('tag'),
    ),
    isLoading: false,
    error: null,
    onNoteClick: (id) => console.log(`ノートがクリックされました: ${id}`),
    onSearchChange: (term) => console.log(`検索ワード: ${term}`),
    searchTerm: 'tag',
    onNewNoteClick: () => console.log('新規ノート作成ボタンがクリックされました'),
  },
};
