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

  const handleNoteClick = (noteId: string) => {
    router.push(`/projects/${projectId}/notes/${noteId}`);
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
