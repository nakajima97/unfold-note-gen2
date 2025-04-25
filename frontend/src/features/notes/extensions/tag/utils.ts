import { getNotesByTagName } from '@/lib/api/tag';

/**
 * タグ名と同じタイトルのノートが存在するかチェックする
 * @param tagName タグ名（#を除いた部分）
 * @param projectId プロジェクトID
 * @returns 同名のノートが存在する場合はtrue、存在しない場合はfalse
 */
export const checkIfMatchingNoteExists = async (
  tagName: string,
  projectId: string,
): Promise<boolean> => {
  try {
    // タグに関連付けられたノートIDを取得
    const noteIds = await getNotesByTagName(tagName, projectId);

    // ノートが存在しない場合はfalse
    if (noteIds.length === 0) {
      return false;
    }

    // 将来的には、ここでノートのタイトルとタグ名が一致するかをチェックする
    // 現段階では、タグが付けられたノートが存在すれば、同名のノートが存在すると仮定
    return true;
  } catch (error) {
    console.error('タグに一致するノートの確認エラー:', error);
    return false;
  }
};

/**
 * タグ名からCSSクラス名を生成する
 * @param _tagName タグ名（#を除いた部分）
 * @param hasMatchingNote 同名のノートが存在するかどうか
 * @returns CSSクラス名
 */
export const getTagClassName = (
  _tagName: string,
  hasMatchingNote: boolean,
): string => {
  return hasMatchingNote ? 'tag-highlight has-matching-note' : 'tag-highlight';
};
