import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// エラー型の定義
interface ErrorWithMessage {
  message: string;
}

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
}

export const useAdminContainer = () => {
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Get user role from Supabase
      const { data, error } = await supabase.rpc('is_admin');

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        router.push('/');
        return;
      }

      if (!data) {
        setIsAdmin(false);
        router.push('/');
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
      setError(null);

      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllowedEmails(data || []);
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      console.error('Error fetching allowed emails:', error);
      setError(errorWithMessage.message);
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
        throw new Error('有効なメールアドレスを入力してください');
      }

      const { data, error } = await supabase
        .from('allowed_emails')
        .insert([{ email: newEmail.trim() }])
        .select();

      if (error) throw error;

      setNewEmail('');
      fetchAllowedEmails();
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      console.error('Error adding allowed email:', error);
      setError(errorWithMessage.message);
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
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      console.error('Error removing allowed email:', error);
      setError(errorWithMessage.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToHome = () => {
    router.push('/');
  };

  return {
    allowedEmails,
    newEmail,
    setNewEmail,
    loading,
    error,
    isAdmin,
    addAllowedEmail,
    removeAllowedEmail,
    navigateToHome,
  };
};
