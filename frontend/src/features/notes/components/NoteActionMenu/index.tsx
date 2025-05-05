'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import type { Editor } from '@tiptap/react';
import { Copy, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type NoteActionMenuProps = {
  onDelete: () => void;
  isSubmitting: boolean;
  editor: Editor | null; // Tiptapエディタのインスタンス
};

const NoteActionMenu = ({
  onDelete,
  isSubmitting,
  editor,
}: NoteActionMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 全文をマークダウンでコピーする関数
  const handleCopyAllAsMarkdown = () => {
    if (!editor) return; // editorがnullの場合は何もしない

    // エディタの全文をクリップボードにコピー
    // tiptap-markdownの拡張機能がコピー時にマークダウン形式に変換
    const selection = editor.state.selection;
    const { from, to } = selection;

    // 現在の選択範囲を保存
    const currentSelection = { from, to };

    // 全文を選択
    editor.commands.selectAll();

    // コピー実行（tiptap-markdownの拡張機能によりマークダウン形式でコピーされる）
    document.execCommand('copy');

    // 選択範囲を元に戻す
    editor.commands.setTextSelection(currentSelection);

    // ユーザーにフィードバック
    alert('ノート全体をマークダウン形式でコピーしました');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isSubmitting}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* 全文マークダウンコピーボタン */}
          <DropdownMenuItem onClick={handleCopyAllAsMarkdown}>
            <Copy className="mr-2 h-4 w-4" />
            マークダウンで全文コピー
          </DropdownMenuItem>

          {/* 削除ボタン */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
          {/* 将来的に追加する他のメニュー項目 */}
          {/* <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            ヘルプ
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Info className="mr-2 h-4 w-4" />
            ノート情報
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="ノートの削除"
        message="このノートを削除してもよろしいですか？この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          onDelete();
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isDanger
      />
    </>
  );
};

export default NoteActionMenu;
