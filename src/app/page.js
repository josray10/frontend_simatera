// src/app/page.jsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman login saat aplikasi pertama kali dijalankan
    router.push('/auth');
  }, [router]);

  return null;
};

export default HomePage;
