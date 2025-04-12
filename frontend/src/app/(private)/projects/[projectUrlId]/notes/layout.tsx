import type { ReactNode } from 'react';

interface NotesLayoutProps {
  children: ReactNode;
}

const NotesLayout = ({ children }: NotesLayoutProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Notes</h1>
        {children}
      </div>
    </div>
  );
};

export default NotesLayout;
