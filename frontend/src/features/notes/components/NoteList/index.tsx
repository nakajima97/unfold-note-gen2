'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import NoteCard from '@/features/notes/components/NoteCard';
import type { NoteListProps } from '@/features/notes/types';
import { Plus, Search } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading,
  error,
  onNoteClick,
  onSearchChange,
  searchTerm,
  onNewNoteClick,
  onLoadMore,
  hasMore,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    
    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading]);

  if (isLoading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
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
        <Button className="flex items-center gap-2" onClick={onNewNoteClick}>
          <Plus size={16} />
          <span>New Note</span>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
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
          <p className="text-muted-foreground">
            No notes found. Create your first note!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={onNoteClick} />
          ))}
        </div>
      )}
      
      {hasMore && <div ref={bottomRef} className="h-8 mt-4" />}
      
      {isLoading && notes.length > 0 && (
        <div className="flex justify-center items-center py-4 mt-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
};

export default NoteList;
