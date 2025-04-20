import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMatchingNoteTitles: (titles: string[]) => ReturnType;
  }
}
