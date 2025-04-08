'use client';

import RelatedNotesByTag from '@/features/notes/components/RelatedNotesByTag';
import { useRelatedNotesByTag } from '@/features/notes/hooks/useRelatedNotesByTag';
import { useRouter } from 'next/navigation';

export interface RelatedNotesByTagContainerProps {
  currentNoteId: string;
  projectId: string;
  projectUrlId?: string; // Add projectUrlId prop
  content: string;
}

const RelatedNotesByTagContainer: React.FC<RelatedNotesByTagContainerProps> = ({
  currentNoteId,
  projectId,
  projectUrlId,
  content,
}) => {
  const router = useRouter();

  const { groupedNotes, isLoading, error, tags } = useRelatedNotesByTag({
    currentNoteId,
    projectId,
    content,
  });

  const handleNoteClick = (noteUrlId: string) => {
    if (!noteUrlId) {
      return;
    }

    // Use projectUrlId if available, otherwise fall back to projectId
    const projectIdentifier = projectUrlId || projectId;
    const url = `/projects/${projectIdentifier}/notes/${noteUrlId}`;
    router.push(url);
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
