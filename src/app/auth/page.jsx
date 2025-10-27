'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/utils/AuthContext';
import { getDataKasra, getDataMahasiswa } from '@/utils/localStorage';

const LoginPage = () => {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔹 Ambil data mahasiswa dari localStorage
  useEffect(() => {
    const data = getDataMahasiswa();
  }, []);

  // 🔹 Data default (admin & kakak asrama)
  const defaultData = [
    { email: 'admin@itera.ac.id', password: 'admin123', role: 'admin' },
    { email: 'kasra@itera.ac.id', password: 'kasra123', role: 'kasra' },
    { email: 'mahasiswa@itera.ac.id', password: 'mahasiswa123', role: 'mahasiswa' },
    ...getDataKasra(),
    ...getDataMahasiswa(),
  ];

  // 🔹 Gabungkan data dari localStorage dengan data default
  const allUsers = [...defaultData, ...getDataMahasiswa()];

  // 🔹 Cek apakah user sudah login
  useEffect(() => {
    if (user) {
      router.push(`/${user.role}`);
    }
  }, [user, router]);

  const handleLogin = (e) => {
    e.preventDefault();
    const toastId = 'login-toast';

    // 🔹 Cek apakah email & password cocok dengan yang tersimpan
    const foundUser = allUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      // Pastikan role ada dan valid
      const role = foundUser.role || '';
      
      // Tambahkan role ke data user jika belum ada
      const userData = {
        ...foundUser,
        role: role
      };
      
      login(userData);
      toast.success(`Login berhasil sebagai ${role || 'pengguna'}`, { toastId });

      // Tentukan path redirect berdasarkan role
      let redirectPath = '/';
      if (role === 'admin') {
        redirectPath = '/admin';
      } else if (role === 'kasra') {
        redirectPath = '/kasra';
      } else if (role === 'mahasiswa') {
        redirectPath = '/mahasiswa';
      }
      
      console.log('Redirecting to:', redirectPath);
      
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } else {
      toast.error('Email atau password salah', { toastId });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-orange-100">
      <img
        src="images/headerbackgrounditera.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative z-10 bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <div className="flex justify-center">
          <img
            src="images/iteralogo.png"
            alt="ITERA Logo"
            className="h-20 mb-6"
          />
        </div>
        <h2 className="text-2xl font-bold text-center mb-1">
          Selamat Datang di SIMATERA
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sistem Informasi Asrama Mahasiswa ITERA
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Login
          </button>
        </form>
      </div>
      <ToastContainer limit={1} position="top-right" />
    </div>
  );
};

export default LoginPage;
