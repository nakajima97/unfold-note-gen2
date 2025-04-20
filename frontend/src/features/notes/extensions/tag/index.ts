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
    setMatchingNoteInfos: (infos: { title: string, urlId: string }[]) => ReturnType;
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
      matchingNoteInfos: [], // [{ title, urlId }]の配列
      onTagClick: undefined, // タグクリック時のコールバック
    };
  },
  addCommands() {
    return {
      setMatchingNoteInfos:
        (infos: { title: string, urlId: string }[]) =>
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
    const tagRegExp = /#[\p{L}\p{N}_-]+/gu;
    return [
      new Plugin({
        key: new PluginKey('tag'),
        props: {
          decorations: (state: EditorState) => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            const matchingNoteInfos: { title: string, urlId: string }[] =
              this.options.matchingNoteInfos || [];
            doc.descendants((node: ProseMirrorNode, pos: number) => {
              if (!node.isText) return;
              const text: string = node.text || '';
              const matches = Array.from(text.matchAll(tagRegExp));
              for (const match of matches) {
                if (match.index === undefined) continue;
                const start = pos + match.index;
                const end = start + match[0].length;
                const tagName = match[0].slice(1);
                const matchInfo = matchingNoteInfos.find(info => info.title === tagName);
                decorations.push(
                  Decoration.inline(start, end, {
                    class: matchInfo
                      ? 'tag-highlight has-matching-note'
                      : 'tag-highlight',
                    'data-type': 'tag',
                    'data-url-id': matchInfo ? matchInfo.urlId : undefined,
                  }),
                );
              }
            });
            return DecorationSet.create(doc, decorations);
          },
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target;
              if (!target) return false;
              const tagElement = target.closest('.tag-highlight, [data-type="tag"]');
              if (tagElement) {
                const urlId = tagElement.dataset.urlId;
                const onTagClick = this.options && this.options.onTagClick;
                if (urlId && typeof onTagClick === 'function') {
                  onTagClick(urlId);
                  event.preventDefault();
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
