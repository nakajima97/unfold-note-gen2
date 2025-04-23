import { Extension, InputRule } from '@tiptap/core';
import { Plugin, Selection } from 'prosemirror-state';

/**
 * URL形式の画像を検出するInputRule
 */
const imageUrlInputRule = (regexp: RegExp) => {
  return new InputRule({
    find: regexp,
    handler: ({ state, range, match, commands }) => {
      const url = match[0];
      commands.deleteRange(range);
      commands.insertContent({
        type: 'image',
        attrs: { src: url },
      });
    },
  });
};

// URL形式の画像を検出する正規表現
const imageUrlRegExp =
  /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|jpeg|png|gif|webp)(?:\?[^\\s]*)?/gi;

/**
 * URL形式の画像を検出して自動的に画像ノードを挿入する拡張
 */
const AutoImage = Extension.create({
  name: 'autoImage',
  addInputRules() {
    return [imageUrlInputRule(imageUrlRegExp)];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event, slice) {
            const text = event.clipboardData?.getData('text/plain');
            if (text && imageUrlRegExp.test(text)) {
              const { tr, schema, selection } = view.state;
              const imageNode = schema.nodes.image.create({ src: text });

              // 現在の段落ノード全体を取得
              const $from = tr.selection.$from;
              const paraPos = $from.before($from.depth);
              const paraNode = tr.doc.nodeAt(paraPos);

              if (
                paraNode &&
                paraNode.type.name === 'paragraph' &&
                paraNode.textContent.trim() === text.trim()
              ) {
                // 段落全体がURLの場合、その段落全体を画像ノードに置換
                tr.replaceWith(paraPos, paraPos + paraNode.nodeSize, imageNode);
                // カーソルを画像ノードの後ろに
                tr.setSelection(Selection.near(tr.doc.resolve(paraPos + 1)));
              } else {
                // 通常通り選択範囲を画像ノードで置換
                tr.replaceSelectionWith(imageNode, false);
                tr.setSelection(
                  Selection.near(tr.doc.resolve(tr.selection.from + 1)),
                );
              }
              view.dispatch(tr);
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default AutoImage;
