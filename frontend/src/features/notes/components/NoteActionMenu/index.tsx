'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type NoteActionMenuProps = {
  onDelete: () => void;
  isSubmitting: boolean;
};

const NoteActionMenu = ({ onDelete, isSubmitting }: NoteActionMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- 追加: マークダウンでコピー機能 ---
  // 親コンポーネントからeditor/copyMarkdownToClipboardをpropsで受け取る想定
  // もしpropsで受け取れない場合はwindow経由やcontext等で取得する設計も可
  const editorApi = (window as any).__noteEditorApi;
  const handleCopyMarkdown = () => {
    if (editorApi && typeof editorApi.copyMarkdownToClipboard === 'function') {
      editorApi.copyMarkdownToClipboard({ selectionOnly: false });
      // UX向上のためコピー完了通知
      alert('ノート全体をマークダウン形式でコピーしました');
    } else {
      alert('エディタの初期化が完了していません');
    }
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
          {/* --- 追加: マークダウンでコピー --- */}
          <DropdownMenuItem
            onClick={handleCopyMarkdown}
          >
            <span className="mr-2">📋</span>
            マークダウンでコピー
          </DropdownMenuItem>
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
