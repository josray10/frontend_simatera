// app/admin/layout.js
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';
import Sidebar from '@/components/sidebar';

export default function AdminLayout({ children, params }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [mounted, setMounted] = useState(false);

  // Menandai bahwa komponen sudah di-mount di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Autentikasi pengguna
  useEffect(() => {
    // Hanya periksa autentikasi setelah loading selesai dan komponen di-mount
    if (mounted && !isLoading) {
      // Jika tidak ada user atau bukan admin, redirect ke login
      if (!user) {
        router.replace('/auth');
      } else if (user.role !== 'admin') {
        router.replace(`/${user.role}`);
      }
    }
  }, [user, isLoading, router, mounted]);

  // Set activeMenu berdasarkan pathname
  useEffect(() => {
    if (!mounted) return;
    
    if (pathname === '/admin') {
      setActiveMenu('Beranda');
    } else if (pathname.includes('/admin/pengumuman')) {
      setActiveMenu('Pengumuman');
    } else if (pathname.includes('/admin/datapenghuni')) {
      setActiveMenu('Data Penghuni');
    } else if (pathname.includes('/admin/datakamar')) {
      setActiveMenu('Data Kamar');
    } else if (pathname.includes('/admin/datapelanggaran')) {
      setActiveMenu('Data Pelanggaran');
    } else if (pathname.includes('/admin/datapembayaran')) {
      setActiveMenu('Data Pembayaran');
    } else if (pathname.includes('/admin/datapengaduan')) {
      setActiveMenu('Data Pengaduan');
    } else if (pathname.includes('/admin/settings')) {
      setActiveMenu('Pengaturan');
    }
  }, [pathname, mounted]);

  // Tampilkan skeleton loader saat loading atau belum di-mount
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-row bg-[#F5F6FA] min-h-screen h-screen overflow-hidden">
        <div className="w-64 bg-gray-800">
          {/* Sidebar skeleton */}
          <div className="p-5">
            <div className="animate-pulse flex flex-col items-center">
              <div className="bg-gray-700 h-16 w-16 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="mt-10 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-16 bg-white shadow-md animate-pulse"></div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika tidak ada user atau bukan admin, jangan render konten
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-row bg-[#F5F6FA] min-h-screen h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar role="admin" activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen">
        <div className="w-full h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
