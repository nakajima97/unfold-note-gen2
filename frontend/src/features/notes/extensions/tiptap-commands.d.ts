import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMatchingNoteTitles: (titles: string[]) => ReturnType;
  }
  interface SingleCommands<ReturnType> {
    setMatchingNoteTitles: (titles: string[]) => ReturnType;
  }
  interface ChainedCommands<ReturnType> {
    setMatchingNoteTitles: (titles: string[]) => ReturnType;
  }
}
