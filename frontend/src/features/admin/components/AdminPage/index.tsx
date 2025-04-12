import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';

type AllowedEmail = {
  id: string;
  email: string;
  created_at: string;
};

type AdminPageComponentProps = {
  allowedEmails: AllowedEmail[];
  newEmail: string;
  setNewEmail: (email: string) => void;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  addAllowedEmail: (e: React.FormEvent) => Promise<void>;
  removeAllowedEmail: (id: string) => Promise<void>;
  navigateToHome: () => void;
};

const AdminPageComponent = ({
  allowedEmails,
  newEmail,
  setNewEmail,
  loading,
  error,
  isAdmin,
  addAllowedEmail,
  removeAllowedEmail,
  navigateToHome,
}: AdminPageComponentProps) => {
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>管理者ページ</CardTitle>
          <CardDescription>承認済みメールアドレスの管理</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addAllowedEmail} className="flex gap-2 mb-6">
            <Input
              type="email"
              placeholder="承認するメールアドレスを入力"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              追加
            </Button>
          </form>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">メールアドレス</th>
                  <th className="border px-4 py-2 text-left">追加日時</th>
                  <th className="border px-4 py-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} className="border px-4 py-2 text-center">
                      読み込み中...
                    </td>
                  </tr>
                )}
                {!loading && allowedEmails.length === 0 && (
                  <tr>
                    <td colSpan={3} className="border px-4 py-2 text-center">
                      承認済みメールアドレスはありません
                    </td>
                  </tr>
                )}
                {allowedEmails.map((email) => (
                  <tr key={email.id}>
                    <td className="border px-4 py-2">{email.email}</td>
                    <td className="border px-4 py-2">
                      {new Date(email.created_at).toLocaleString('ja-JP')}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAllowedEmail(email.id)}
                        disabled={loading}
                      >
                        削除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={navigateToHome}
            className="ml-auto"
          >
            ホームに戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminPageComponent;
