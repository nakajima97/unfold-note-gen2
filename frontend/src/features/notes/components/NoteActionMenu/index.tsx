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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isSubmitting}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* 将来的に追加する機能用のプレースホルダー */}
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
