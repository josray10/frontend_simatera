// @/utils/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeLocalStorageDataFromJson } from './initializeData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Menandai bahwa komponen sudah di-mount di client
  useEffect(() => {
    setMounted(true);
    initializeLocalStorageDataFromJson
  }, []);

  // Cek localStorage saat aplikasi dimuat di client
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        // Mengurangi delay untuk mencegah flash
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  const login = (userData) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Hapus user dari state
      setUser(null);

      // Hapus dari localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }

      // Delay sedikit sebelum redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect ke halaman login dengan replace
      router.replace('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePasswordInMahasiswaData = (nim, newPassword) => {
    if (typeof window === 'undefined') return;
    
    const storedData = localStorage.getItem('mahasiswaData');
    if (storedData) {
      const mahasiswaArray = JSON.parse(storedData);
      const updatedArray = mahasiswaArray.map((mhs) =>
        mhs.nim === nim ? { ...mhs, password: newPassword } : mhs
      );
      localStorage.setItem('mahasiswaData', JSON.stringify(updatedArray));
    }
  };

  const updatePassword = (newPassword) => {
    if (!user) return;
    
    const updatedUser = { ...user, password: newPassword };
    login(updatedUser);

    if (updatedUser.role === 'mahasiswa') {
      updatePasswordInMahasiswaData(updatedUser.nim, newPassword);
    }
  };

  // Nilai yang akan diberikan ke context
  const contextValue = {
    user: mounted ? user : null,
    isLoading,
    login,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Middleware untuk protected routes
export function withAuth(Component, requiredRole) {
  return function ProtectedRoute(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      // Hanya redirect jika sudah di-mount, loading selesai, dan tidak ada user
      if (mounted && !isLoading) {
        if (!user) {
          router.replace('/auth');
        } else if (requiredRole && user.role !== requiredRole) {
          // Redirect ke halaman sesuai role jika role tidak sesuai
          switch (user.role) {
            case 'admin':
              router.replace('/admin');
              break;
            case 'kasra':
              router.replace('/kasra');
              break;
            case 'mahasiswa':
              router.replace('/mahasiswa');
              break;
            default:
              router.replace('/auth');
          }
        }
      }
    }, [user, isLoading, router, mounted, requiredRole]);

    // Tampilkan skeleton loader saat loading atau belum di-mount
    if (!mounted || isLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2.5"></div>
            <div className="h-2 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      );
    }

    // Jika requiredRole ditentukan, periksa apakah user memiliki role yang sesuai
    if (requiredRole && user?.role !== requiredRole) {
      return null; // Jangan render komponen jika role tidak sesuai
    }

    return user ? <Component {...props} /> : null;
  };
}
