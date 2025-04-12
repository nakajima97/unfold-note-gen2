'use client';

import { Button } from '@/components/shadcn/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

type NavbarProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
}

const Navbar = ({ onLogout, isLoggingOut }: NavbarProps) => {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/projects" className="text-xl font-bold">
          Unfold Note
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            {isLoggingOut ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <LogOut size={16} />
            )}
            <span>ログアウト</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
