import { Extension, InputRule } from '@tiptap/core';
import { Plugin, Selection } from 'prosemirror-state';

/**
 * URL形式の画像を検出するInputRule
 * @param regexp URL正規表現
 * @returns InputRule
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
              const { tr, schema } = view.state;
              const imageNode = schema.nodes.image.create({ src: text });
              tr.replaceSelectionWith(imageNode, false);
              // キャレットを画像ノードの後ろに移動
              tr.setSelection(
                Selection.near(tr.doc.resolve(tr.selection.from + 1)),
              );
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
