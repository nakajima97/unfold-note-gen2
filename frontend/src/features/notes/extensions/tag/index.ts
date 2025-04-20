import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * タグ拡張機能
 * エディタ内の #タグ形式のテキストを検出して装飾するTiptap拡張
 */
export const Tag = Extension.create({
  name: 'tag',
  addOptions() {
    return {
      matchingNoteTitles: [], // デフォルトは空配列
    };
  },
  addCommands() {
    return {
      setMatchingNoteTitles:
        (titles: string[]) => ({ commands }) => {
          this.options.matchingNoteTitles = titles;
          // 強制的に再描画（装飾を更新）
          commands.command(({ tr }) => {
            tr.setMeta('tag', { updated: true });
            return true;
          });
          return true;
        },
    };
  },
  addProseMirrorPlugins() {
    const tagRegExp = /#[\p{L}\p{N}_-]+/gu;
    return [
      new Plugin({
        key: new PluginKey('tag'),
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations = [];
            const matchingNoteTitles = this.options.matchingNoteTitles || [];
            doc.descendants((node, pos) => {
              if (!node.isText) return;
              const text = node.text || '';
              const matches = Array.from(text.matchAll(tagRegExp));
              for (const match of matches) {
                if (match.index === undefined) continue;
                const start = pos + match.index;
                const end = start + match[0].length;
                const tagName = match[0].slice(1);
                const hasMatching = matchingNoteTitles.includes(tagName);
                decorations.push(
                  Decoration.inline(start, end, {
                    class: hasMatching
                      ? 'tag-highlight has-matching-note'
                      : 'tag-highlight',
                    'data-type': 'tag',
                  })
                );
              }
            });
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

export default Tag;
