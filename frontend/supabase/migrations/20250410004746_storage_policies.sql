-- バケットへのアクセスポリシー
CREATE POLICY "Allow authenticated users to access buckets"
ON storage.buckets
FOR ALL
TO authenticated
USING (true);

-- ファイルアップロードポリシー
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ファイル読み取りポリシー
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (true);

-- ファイル更新ポリシー
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true);

-- ファイル削除ポリシー
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);