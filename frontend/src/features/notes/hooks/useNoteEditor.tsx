'use client';

import AutoImage from '@/features/notes/extensions/auto-image';
import Tag from '@/features/notes/extensions/tag';
import type { Note } from '@/features/notes/types';
import { refreshImageUrls, uploadImage } from '@/lib/api/file';
import { extractTagsFromText } from '@/lib/api/tag';
import { supabase } from '@/utils/supabase/client';
import FileHandler from '@tiptap-pro/extension-file-handler';
import Image from '@tiptap/extension-image';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  initialTitle: string;
  initialContent: string;
  projectId: string;
  projectUrlId: string;
  noteId?: string;
  onSubmit: (note: Partial<Note>) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export const useNoteEditor = ({
  initialTitle,
  initialContent,
  projectId,
  projectUrlId,
  onSubmit,
}: Props) => {
  const [title, setTitle] = useState('');
  // tiptap表示用content
  const [content, setContent] = useState('');
  // 即座にcontentの内容に対して処理を行うと負荷がかかるため、500ms後にcontentと同期させてdebouncedContentの値でタグ抽出等の処理を行っていく
  const [debouncedContent, setDebouncedContent] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);

  // --- 追加: タグと一致するノート情報（title, urlId）配列 ---
  const [matchingNoteInfos, setMatchingNoteInfos] = useState<
    { title: string; urlId: string }[]
  >([]);

  // --- Tiptap拡張のTagに一致リストとonTagClickを渡す ---
  const tagExtension = Tag.configure({
    matchingNoteInfos,
    onTagClick: (urlId: string) => {
      // Next.jsのrouter.pushなどで遷移。必要に応じてprojectIdを参照
      window.location.href = `/projects/${projectUrlId}/notes/${urlId}`;
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true, // 一時的な画像表示のために残す
        inline: false,
      }),
      tagExtension, // ここでTag拡張を差し替え
      AutoImage, // 画像URL自動検出拡張を追加
      FileHandler.configure({
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ],
        onDrop: async (currentEditor, files, pos) => {
          if (!files.length) return;

          setIsUploading(true);

          try {
            for (const file of files) {
              if (file.size > 10 * 1024 * 1024) {
                // 10MB制限
                alert('画像サイズは10MB以下にしてください');
                continue;
              }

              // Supabase Storageに画像をアップロード
              const imageUrl = await uploadImage(projectId, file);

              // エディタに画像を挿入
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: imageUrl,
                    alt: file.name,
                  },
                })
                .focus()
                .run();
            }
          } catch (error) {
            console.error('画像アップロードエラー:', error);
            alert('画像のアップロードに失敗しました');
          } finally {
            setIsUploading(false);
          }
        },
        onPaste: async (currentEditor, files, _htmlContent) => {
          if (!files.length) return;

          setIsUploading(true);

          try {
            for (const file of files) {
              if (file.size > 10 * 1024 * 1024) {
                // 10MB制限
                alert('画像サイズは10MB以下にしてください');
                continue;
              }

              // Supabase Storageに画像をアップロード
              const imageUrl = await uploadImage(projectId, file);

              // エディタに画像を挿入
              currentEditor
                .chain()
                .insertContent({
                  type: 'image',
                  attrs: {
                    src: imageUrl,
                    alt: file.name,
                  },
                })
                .focus()
                .run();
            }
          } catch (error) {
            console.error('画像アップロードエラー:', error);
            alert('画像のアップロードに失敗しました');
          } finally {
            setIsUploading(false);
          }
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);

      // コンテンツの変更を遅延させて関連ノートの検索を最適化
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedContent(html);
      }, 500); // 500ms後に更新
    },
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none max-w-none',
      },
    },
    // SSR対応のため、即時レンダリングをオフに
    immediatelyRender: false,
  });

  // --- Markdown変換用関数（選択範囲 or 全体） ---
  const getMarkdown = (options?: { selectionOnly?: boolean }) => {
    if (!editor || !editor.view) return '';
    const { state } = editor.view;
    let doc = state.doc;
    // selectionOnly: true の場合は選択範囲のみ抽出
    if (options?.selectionOnly && !state.selection.empty) {
      const { from, to } = state.selection;
      doc = state.doc.cut(from, to);
    }
    try {
      // Tiptapのエディタ内容をHTMLとして取得
      let html = '';
      if (options?.selectionOnly && !state.selection.empty) {
        // 選択範囲のHTMLを取得（シンプルな方法）
        const tempDiv = document.createElement('div');
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          tempDiv.appendChild(range.cloneContents());
          html = tempDiv.innerHTML;
        } else {
          // 選択範囲が取得できない場合は全体を使用
          html = editor.getHTML();
        }
      } else {
        // 全体のHTMLを取得
        html = editor.getHTML();
      }

      // HTML→テキスト変換（簡易的なMarkdown化）
      return convertHtmlToMarkdown(html);
    } catch (error) {
      console.error('Markdown変換エラー:', error);
      // エラー時はプレーンテキストを返す
      return doc.textContent;
    }
  };

  // --- HTML→Markdown変換（簡易実装） ---
  const convertHtmlToMarkdown = (html: string): string => {
    // 一時的なDOMを作成してHTMLを解析
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 再帰的にノードをMarkdownに変換
    return convertNodeToMarkdown(tempDiv);
  };

  // --- DOM Node→Markdown変換（再帰処理） ---
  const convertNodeToMarkdown = (node: Node, indent = ''): string => {
    let markdown = '';
    
    // テキストノードの場合はそのまま返す
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    // 要素ノードの場合
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // タグに応じた処理
      switch (tagName) {
        case 'h1':
          markdown += '# ' + getTextContent(element) + '\n\n';
          break;
        case 'h2':
          markdown += '## ' + getTextContent(element) + '\n\n';
          break;
        case 'h3':
          markdown += '### ' + getTextContent(element) + '\n\n';
          break;
        case 'p':
          markdown += getTextContent(element) + '\n\n';
          break;
        case 'strong':
        case 'b':
          markdown += '**' + getTextContent(element) + '**';
          break;
        case 'em':
        case 'i':
          markdown += '*' + getTextContent(element) + '*';
          break;
        case 'code':
          markdown += '`' + getTextContent(element) + '`';
          break;
        case 'pre':
          markdown += '```\n' + getTextContent(element) + '\n```\n\n';
          break;
        case 'a':
          const href = element.getAttribute('href') || '';
          markdown += '[' + getTextContent(element) + '](' + href + ')';
          break;
        case 'img':
          const src = element.getAttribute('src') || '';
          const alt = element.getAttribute('alt') || '';
          markdown += '![' + alt + '](' + src + ')';
          break;
        case 'ul':
          // 子要素を処理（リスト項目）
          for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === 'li') {
              markdown += indent + '- ' + getTextContent(child as HTMLElement) + '\n';
            }
          }
          markdown += '\n';
          break;
        case 'ol':
          // 子要素を処理（番号付きリスト項目）
          for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === 'li') {
              markdown += indent + (i + 1) + '. ' + getTextContent(child as HTMLElement) + '\n';
            }
          }
          markdown += '\n';
          break;
        case 'blockquote':
          markdown += '> ' + getTextContent(element) + '\n\n';
          break;
        case 'hr':
          markdown += '---\n\n';
          break;
        case 'br':
          markdown += '\n';
          break;
        default:
          // その他の要素は子要素を再帰的に処理
          for (let i = 0; i < element.childNodes.length; i++) {
            markdown += convertNodeToMarkdown(element.childNodes[i], indent);
          }
      }
      
      return markdown;
    }
    
    // その他のノードタイプは無視
    return '';
  };

  // --- テキスト内容を取得（子要素も含む） ---
  const getTextContent = (element: HTMLElement): string => {
    // シンプルなテキスト取得（子要素のタグは無視）
    return element.textContent || '';
  };

  // --- クリップボードにMarkdownを書き込む関数 ---
  const copyMarkdownToClipboard = (options?: { selectionOnly?: boolean }) => {
    const markdown = getMarkdown(options);
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).catch((err) => {
      // エラー時はalert
      alert('クリップボードへのコピーに失敗しました: ' + err);
    });
  };

  // --- Tiptapのcopyイベントを上書き（選択範囲のみ） ---
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      // 通常のコピーハンドラをキャンセル
      e.preventDefault();
      copyMarkdownToClipboard({ selectionOnly: true });
    };
    if (editor && editor.view && editor.view.dom) {
      const dom = editor.view.dom;
      dom.addEventListener('copy', handler);
      return () => {
        dom.removeEventListener('copy', handler);
      };
    }
  }, [editor]);

  // --- Markdownストレージを追加（NoteCreateからアクセスできるように） ---
  useEffect(() => {
    if (editor) {
      // エディタのストレージにMarkdown変換関数を保存
      editor.storage.markdown = {
        getMarkdown,
        copyMarkdownToClipboard,
      };
    }
  }, [editor]);

  // debouncedContentまたはprojectIdが変わるたびにタグ名を抽出し、APIで一致判定
  useEffect(() => {
    if (!debouncedContent || !projectId || !editor) return;
    const tags = extractTagsFromText(debouncedContent);
    const limitedTags = tags.slice(0, 5); // タグを最大5件までに制限
    if (limitedTags.length === 0) {
      setMatchingNoteInfos([]);
      // @ts-ignore
      editor.commands.setMatchingNoteInfos([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('title, url_id')
        .eq('project_id', projectId)
        .in('title', limitedTags)
        .limit(15); // ノートを最大15件までに制限
      if (error) {
        setMatchingNoteInfos([]);
        // @ts-ignore
        editor.commands.setMatchingNoteInfos([]);
        return;
      }
      const infos = data.map((n: { title: string; url_id: string }) => ({
        title: n.title,
        urlId: n.url_id,
      }));
      setMatchingNoteInfos(infos);
      // @ts-ignore
      editor.commands.setMatchingNoteInfos(infos);
    })();
  }, [debouncedContent, projectId, editor]);

  // 初期コンテンツの画像URLを更新
  useEffect(() => {
    const updateInitialContent = async () => {
      if (initialContent) {
        setIsRefreshingImages(true);
        try {
          // 初期コンテンツ内の画像URLを更新
          const updatedContent = await refreshImageUrls(initialContent);
          setContent(updatedContent);
          setDebouncedContent(updatedContent);
        } catch (error) {
          console.error('画像URL更新エラー:', error);
          setContent(initialContent);
          setDebouncedContent(initialContent);
        } finally {
          setIsRefreshingImages(false);
        }
      } else {
        setContent('');
      }
    };

    updateInitialContent();
  }, [initialContent]);

  // 初期タイトル
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  // エディタが初期化されたときに初期コンテンツを設定
  useEffect(() => {
    if (editor && content && !editorInitialized) {
      editor.commands.setContent(content);
      setEditorInitialized(true);
    }
  }, [editor, content, editorInitialized]);

  // コンポーネントがアンマウントされるときにタイマーをクリア
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
    });
  };

  return {
    editor,
    title,
    setTitle,
    content,
    setContent,
    debouncedContent,
    isUploading,
    handleSubmit,
    isRefreshingImages,
    // --- 追加: マークダウン変換・コピー用API ---
    getMarkdown,
    copyMarkdownToClipboard,
  };
};
