"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminPage() {
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // Get user role from Supabase
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.push("/");
        return;
      }

      if (!data) {
        setIsAdmin(false);
        router.push("/");
        return;
      }

      setIsAdmin(true);
      fetchAllowedEmails();
    };

    checkAdmin();
  }, [router]);

  const fetchAllowedEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllowedEmails(data || []);
    } catch (error: any) {
      console.error("Error fetching allowed emails:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAllowedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error("有効なメールアドレスを入力してください");
      }

      const { data, error } = await supabase
        .from('allowed_emails')
        .insert([{ email: newEmail.trim() }])
        .select();

      if (error) throw error;
      
      setNewEmail("");
      fetchAllowedEmails();
    } catch (error: any) {
      console.error("Error adding allowed email:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeAllowedEmail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('allowed_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchAllowedEmails();
    } catch (error: any) {
      console.error("Error removing allowed email:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => router.push("/")}
            className="ml-auto"
          >
            ホームに戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
