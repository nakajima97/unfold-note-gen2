import { Extension, type RawCommands } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import {
  type EditorState,
  Plugin,
  PluginKey,
  type Transaction,
} from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// --- Tiptapコマンド型拡張 ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMatchingNoteInfos: (
      infos: { title: string; urlId: string }[],
    ) => ReturnType;
  }
}

/**
 * タグ拡張機能
 * エディタ内の #タグ形式のテキストを検出して装飾するTiptap拡張
 */
export const Tag = Extension.create({
  name: 'tag',
  addOptions() {
    return {
      matchingNoteInfos: [], // [{ title, urlId }]の配列。commands.setMatchingNoteInfosで設定するので初期値は空配列
      onTagClick: undefined, // タグクリック時のコールバックを受け取るので初期値はundefined
    };
  },
  addCommands() {
    return {
      setMatchingNoteInfos:
        (infos: { title: string; urlId: string }[]) =>
        ({ commands }: { commands: RawCommands }) => {
          this.options.matchingNoteInfos = infos;
          // 強制的に再描画（装飾を更新）
          commands.command(({ tr }: { tr: Transaction }) => {
            tr.setMeta('tag', { updated: true });
            return true;
          });
          return true;
        },
    } as Partial<RawCommands>; // 型キャストで型エラー回避
  },
  addProseMirrorPlugins() {
    // --- ProseMirror用プラグインを返す ---
    const tagRegExp = /#[\p{L}\p{N}_-]+/gu;
    return [
      // タグ検出・装飾・クリックイベントハンドラをまとめたプラグイン
      new Plugin({
        key: new PluginKey('tag'),
        props: {
          // --- タグ部分の装飾（ハイライトや属性付与）を行う ---
          decorations: (state: EditorState) => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            const matchingNoteInfos: { title: string; urlId: string }[] =
              this.options.matchingNoteInfos || [];
            // ドキュメント全体を走査し、テキストノードごとにタグ（#xxx）を検出して装飾対象を決定
            doc.descendants((node: ProseMirrorNode, pos: number) => {
              if (!node.isText) return;
              const text: string = node.text || '';
              const matches = Array.from(text.matchAll(tagRegExp));
              for (const match of matches) {
                if (match.index === undefined) continue;
                // タグの開始位置と終了位置を計算
                const start = pos + match.index;
                const end = start + match[0].length;
                // 頭の#を除いてタグ名を取得
                const tagName = match[0].slice(1);
                // タグと一致するノート情報（title, urlId）配列から探す
                const matchInfo = matchingNoteInfos.find(
                  (info) => info.title === tagName,
                );
                // 装飾を適用
                decorations.push(
                  Decoration.inline(start, end, {
                    class: matchInfo
                      ? 'tag-highlight has-matching-note' // タグと一致するノートがある場合
                      : 'tag-highlight', // タグと一致するノートがない場合
                    'data-type': 'tag',
                    'data-url-id': matchInfo ? matchInfo.urlId : undefined,
                  }),
                );
              }
            });
            return DecorationSet.create(doc, decorations);
          },
          // --- タグクリック時のイベントハンドリング（コールバック呼び出し） ---
          // ※クリックされたタグに紐づくノート詳細ページ（/projects/[projectUrlId]/notes/[urlId]）へ遷移する
          handleDOMEvents: {
            click: (_view, event) => {
              // view.domからeventを取得し、event.targetを参照する
              const mouseEvent =
                event instanceof MouseEvent
                  ? event
                  : (event as unknown as MouseEvent);
              const target = mouseEvent.target as HTMLElement;
              if (!target) return false;
              const tagElement = target.closest(
                '.tag-highlight, [data-type="tag"]',
              ) as HTMLElement | null;
              if (tagElement) {
                // タグのdata属性でurlIdを持っているので取得する
                const urlId = tagElement.dataset.urlId;
                const onTagClick = this.options?.onTagClick;
                // 万が一必要なものが無かったら何もしない
                // エラー処理はユーザに伝えてもユーザの行動で改善するものではないので行わない
                if (urlId && typeof onTagClick === 'function') {
                  onTagClick(urlId);
                  mouseEvent.preventDefault();
                  return true;
                }
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default Tag;
