import { updateExistingNotesThumbnails } from '@/lib/api/migration';
import { NextResponse } from 'next/server';

/**
 * 既存のノートのサムネイルURLを更新するAPIエンドポイント
 * GET /api/migration/thumbnails
 */
export async function GET() {
  try {
    const updatedCount = await updateExistingNotesThumbnails();
    
    return NextResponse.json({
      success: true,
      message: `${updatedCount}件のノートのサムネイルURLを更新しました`,
      updatedCount,
    });
  } catch (error) {
    console.error('サムネイル更新APIエラー:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'サムネイルの更新に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
