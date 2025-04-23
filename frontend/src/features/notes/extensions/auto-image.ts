import { Extension, InputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

function imageUrlInputRule(regexp: RegExp) {
  return new InputRule({
    find: regexp,
    handler: ({ state, range, match, commands }) => {
      const url = match[0];
      commands.deleteRange(range);
      commands.insertContent({
        type: 'image',
        attrs: { src: url }
      });
    }
  });
}

const imageUrlRegExp = /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|jpeg|png|gif|webp)(?:\?[^\\s]*)?/gi;

const AutoImage = Extension.create({
  name: 'autoImage',
  addInputRules() {
    return [
      imageUrlInputRule(imageUrlRegExp)
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event, slice) {
            const text = event.clipboardData?.getData('text/plain');
            if (text && imageUrlRegExp.test(text)) {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: text })
                )
              );
              return true;
            }
            return false;
          }
        }
      })
    ];
  }
});

export default AutoImage;