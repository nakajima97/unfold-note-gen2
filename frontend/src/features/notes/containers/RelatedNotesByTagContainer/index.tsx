'use client';

import RelatedNotesByTag from '@/features/notes/components/RelatedNotesByTag';
import { useRelatedNotesByTag } from '@/features/notes/hooks/useRelatedNotesByTag';
import { useRouter } from 'next/navigation';

export type RelatedNotesByTagContainerProps = {
  currentNoteId: string;
  projectId: string;
  projectUrlId?: string; // projectUrlIdプロパティを追加
  content: string;
};

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

    // 利用可能な場合はprojectUrlIdを使用し、そうでない場合はprojectIdにフォールバック
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
