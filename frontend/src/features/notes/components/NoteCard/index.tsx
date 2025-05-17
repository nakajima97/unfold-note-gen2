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
import { Clock, Image } from 'lucide-react';
import type React from 'react';
import { stripHtml } from 'string-strip-html';
import { useState } from 'react';

export type NoteCardProps = {
  note: Note;
  onClick: (noteUrlId: string) => void;
};

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  // クリックハンドラー
  const handleClick = () => {
    // 常にurlIdを使用する
    onClick(note.urlId);
  };

  // 画像読み込みエラー状態
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* サムネイル画像表示エリア */}
      {note.thumbnail_url && !imageError ? (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={note.thumbnail_url} 
            alt={note.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-muted flex items-center justify-center">
          <Image className="w-12 h-12 text-muted-foreground opacity-20" />
        </div>
      )}
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
          {stripHtml(note.content).result.replace(
            /#[a-zA-Z0-9_\-/\p{L}\p{N}]+/gu,
            '',
          )}
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

// コンテンツからタグを抽出するヘルパー関数
const extractTags = (content: string): string[] => {
  const tagRegex = /#([a-zA-Z0-9_\-/\p{L}\p{N}]+)/gu;
  const matches = content.matchAll(tagRegex);
  const tags = Array.from(matches, (m) => m[1]);
  return tags;
};

export default NoteCard;
