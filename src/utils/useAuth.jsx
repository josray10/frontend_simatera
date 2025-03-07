import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const useAuth = (requiredRole) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Menunggu hingga komponen dipasang di sisi klien
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Cegah penggunaan router di sisi server

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== requiredRole) {
      router.push('/auth'); // Arahkan ke halaman login jika role tidak sesuai
    }
  }, [isMounted, requiredRole, router]);
};

export default useAuth;
