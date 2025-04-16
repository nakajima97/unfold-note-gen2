import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { HelpCircle } from 'lucide-react';

/**
 * エディターのヘルプ情報を表示するツールチップコンポーネント
 */
const EditorHelpTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-xs bg-secondary text-secondary-foreground p-3 pl-5 space-y-1"
        >
          <p>
            画像はドラッグ＆ドロップまたは貼り付けで追加できます（最大10MB）
          </p>
          <p>
            <span className="tag-highlight">#タグ</span>{' '}
            のように入力するとタグとして認識されます
          </p>
          <p className="text-xs">
            タグの色:{' '}
            <span style={{ color: '#ff69b4', fontWeight: 600 }}>ピンク</span> =
            同名のノートが存在しない、
            <span style={{ color: '#1e90ff', fontWeight: 600 }}>青</span> =
            同名のノートが存在する
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EditorHelpTooltip;
