'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import type { Note } from '@/lib/api/note';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import type React from 'react';

export interface NoteCardProps {
  note: Note;
  onClick: (noteUrlId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  // クリックハンドラー
  const handleClick = () => {
    // 常にurlIdを使用する
    onClick(note.urlId);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{note.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Clock size={12} />
          <span>
            {formatDistanceToNow(new Date(note.updated_at), {
              addSuffix: true,
            })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3">
          {note.content.replace(/#[a-zA-Z0-9_\-/\p{L}\p{N}]+/gu, '')}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex flex-wrap gap-2">
        {extractTags(note.content).map((tag) => (
          <span
            key={`tag-${note.urlId}-${tag}`}
            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
      </CardFooter>
    </Card>
  );
};

// Helper function to extract tags from content
const extractTags = (content: string): string[] => {
  const tagRegex = /#([a-zA-Z0-9_\-/\p{L}\p{N}]+)/gu;
  const matches = content.matchAll(tagRegex);
  const tags = Array.from(matches, (m) => m[1]);
  return tags;
};

export default NoteCard;
