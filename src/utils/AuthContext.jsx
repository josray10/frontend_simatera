// @/utils/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Cek localStorage saat aplikasi dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Hapus user dari state
    setUser(null);

    // Hapus dari localStorage
    localStorage.removeItem('user');

    // Redirect ke halaman login dengan replace
    // Gunakan replace untuk mencegah navigasi back ke dashboard
    router.replace('/');
  };

  const updatePasswordInMahasiswaData = (nim, newPassword) => {
    const storedData = localStorage.getItem('mahasiswaData');
    if (storedData) {
      const mahasiswaArray = JSON.parse(storedData);
      const updatedArray = mahasiswaArray.map((mhs) =>
        mhs.nim === nim ? { ...mhs, password: newPassword } : mhs
      );
      console.log('Updated mahasiswa data:', updatedArray); // Pastikan data sudah berubah
      localStorage.setItem('mahasiswaData', JSON.stringify(updatedArray));
    }
  };


  const updatePassword = (newPassword) => {
    const updatedUser = { ...user, password: newPassword };
    login(updatedUser); // Memperbarui state dan localStorage untuk 'user'

    if (updatedUser.role === 'mahasiswa') {
      updatePasswordInMahasiswaData(updatedUser.nim, newPassword);
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword }}>
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
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.replace('/');
      }
    }, [user, router]);

    return user ? <Component {...props} /> : null;
  };
}
