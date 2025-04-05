import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * タグ拡張機能
 * エディタ内の #タグ形式のテキストを検出して装飾するTiptap拡張
 */
export const Tag = Extension.create({
  name: 'tag',

  addProseMirrorPlugins() {
    const tagRegExp = /#[\p{L}\p{N}_-]+/gu;
    
    return [
      new Plugin({
        key: new PluginKey('tag'),
        props: {
          decorations(state) {
            const { doc } = state;
            const decorations: Decoration[] = [];

            // ドキュメント内のすべてのテキストノードを処理
            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || '';
              let match;

              // テキスト内のすべてのタグを検索
              while ((match = tagRegExp.exec(text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                
                // タグ装飾を追加
                decorations.push(
                  Decoration.inline(start, end, {
                    class: 'tag-highlight',
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
