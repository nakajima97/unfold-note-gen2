'use client';

import React from 'react';
import { NoteListProps } from '@/features/notes/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Search, Plus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading,
  error,
  onNoteClick,
  onSearchChange,
  searchTerm,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>New Note</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Search notes by title, content, or tags..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNoteClick(note.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Clock size={12} />
                  <span>{formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{note.content.replace(/#[a-zA-Z0-9_\-/\p{L}\p{N}]+/gu, '')}</p>
              </CardContent>
              <CardFooter className="pt-2 flex flex-wrap gap-2">
                {extractTags(note.content).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to extract tags from content
function extractTags(content: string): string[] {
  const tagRegex = /#([a-zA-Z0-9_\-/\p{L}\p{N}]+)/gu;
  const matches = content.matchAll(tagRegex);
  const tags = Array.from(matches, m => m[1]);
  return tags;
}

export default NoteList;
