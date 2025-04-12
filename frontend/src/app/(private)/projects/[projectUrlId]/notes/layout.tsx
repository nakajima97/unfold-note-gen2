import type { ReactNode } from 'react';

type NotesLayoutProps = {
  children: ReactNode;
};

const NotesLayout = ({ children }: NotesLayoutProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};

export default NotesLayout;
