'use client';

import RelatedNotesByTag from '@/features/notes/components/RelatedNotesByTag';
import { useRelatedNotesByTag } from '@/features/notes/hooks/useRelatedNotesByTag';
import { useRouter } from 'next/navigation';

export interface RelatedNotesByTagContainerProps {
  currentNoteId: string;
  projectId: string;
  content: string;
}

const RelatedNotesByTagContainer: React.FC<RelatedNotesByTagContainerProps> = ({
  currentNoteId,
  projectId,
  content,
}) => {
  const router = useRouter();

  const { groupedNotes, isLoading, error, tags } = useRelatedNotesByTag({
    currentNoteId,
    projectId,
    content,
  });

  const handleNoteClick = (noteUrlId: string) => {
    console.log('RelatedNotesByTagContainer.handleNoteClick called with:', noteUrlId);
    console.log('noteUrlId type:', typeof noteUrlId);
    console.log('projectId:', projectId);
    
    // noteUrlIdが空文字列やundefinedの場合は、エラーログを出力
    if (!noteUrlId) {
      console.error('Error: noteUrlId is empty or undefined');
      return;
    }
    
    const url = `/projects/${projectId}/notes/${noteUrlId}`;
    console.log('Navigating to URL:', url);
    
    try {
      console.log('About to call router.push with:', url);
      router.push(url);
      console.log('router.push called successfully');
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  };

  return (
    <RelatedNotesByTag
      groupedNotes={groupedNotes}
      isLoading={isLoading}
      error={error}
      tags={tags}
      projectId={projectId}
      onNoteClick={handleNoteClick}
    />
  );
};

export default RelatedNotesByTagContainer;
