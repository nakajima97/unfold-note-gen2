'use client';

import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push('/login')}
      >
        ログイン
      </button>
    </div>
  );
};

export default Home;
