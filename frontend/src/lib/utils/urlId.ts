import { customAlphabet } from 'nanoid';

// 紛らわしい文字（0, O, 1, I, l など）を除外したアルファベット
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// 15文字のIDを生成する関数
export const generateUrlId = customAlphabet(alphabet, 15);

/**
 * URL識別子の生成と衝突チェックを行う関数
 * @param checkExistence 生成したIDが既に存在するかチェックする関数
 * @returns 一意のURL識別子
 */
export const generateUniqueUrlId = async (
  checkExistence: (urlId: string) => Promise<boolean>,
): Promise<string> => {
  // 最大試行回数
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const urlId = generateUrlId();
    // IDが既に存在するかチェック
    const exists = await checkExistence(urlId);

    if (!exists) {
      return urlId;
    }

    attempts++;
  }

  throw new Error(
    '一意のURL識別子を生成できませんでした。後でもう一度お試しください。',
  );
};
