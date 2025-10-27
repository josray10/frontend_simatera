// src/app/auth/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/utils/AuthContext';
// Impor fungsi untuk membaca data user dari localStorage
import { getDataKasra, getDataMahasiswa } from '@/utils/localStorage';

const LoginPage = () => {
    const router = useRouter();
    const { user, login, isLoading: authLoading } = useAuth(); // Ambil isLoading dari context
    const [emailOrNim, setEmailOrNim] = useState(''); // Ganti state email menjadi emailOrNim
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State loading lokal untuk submit

    // Redirect jika user sudah login (setelah loading context selesai)
    useEffect(() => {
        if (!authLoading && user) {
            router.replace(`/${user.role}`);
        }
    }, [user, authLoading, router]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Mencegah double submit
        setIsSubmitting(true);
        const toastId = 'login-toast';

        try {
            // Ambil semua data user dari localStorage
            const mahasiswaUsers = getDataMahasiswa() || [];
            const kasraUsers = getDataKasra() || [];
            // Ambil admin dari localStorage (sesuai key saat inisialisasi)
            const adminDataString = localStorage.getItem('adminData');
            const adminUsers = adminDataString ? JSON.parse(adminDataString) : [];

            // Gabungkan semua user
            const currentUsers = [...adminUsers, ...kasraUsers, ...mahasiswaUsers];

            // Cari user berdasarkan email ATAU nim
            const foundUser = currentUsers.find(
                (u) => (u.email === emailOrNim || u.nim === emailOrNim) && u.password === password
            );

            if (foundUser) {
                // Pastikan role ada, default jika perlu (meskipun harusnya sudah ada dari JSON)
                const role = foundUser.role || (foundUser.nim && foundUser.nim.startsWith('K') ? 'kasra' : 'mahasiswa');
                const userData = { ...foundUser, role };

                login(userData); // Panggil fungsi login dari AuthContext
                toast.success(`Login berhasil sebagai ${role}! Mengalihkan...`, { toastId, autoClose: 1500 });

                // Redirect dilakukan oleh useEffect di atas setelah state 'user' terupdate
                // setTimeout(() => {
                //   router.push(`/${role}`);
                // }, 1500);

            } else {
                toast.error('Email/NIM atau password salah', { toastId });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error('Terjadi kesalahan saat login.', { toastId });
        } finally {
            setIsSubmitting(false); // Selesaikan loading submit
        }
    };

    // Jangan tampilkan form jika auth masih loading atau user sudah ada
    if (authLoading || (!authLoading && user)) {
        return (
             <div className="flex justify-center items-center h-screen bg-gray-100">
                <p>Memeriksa sesi...</p> {/* Atau skeleton loader */}
             </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-orange-100">
            {/* ... (kode JSX background dan logo) ... */}
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
                            type="text" // Ganti type jadi text
                            placeholder="Email" // Ganti placeholder
                            value={emailOrNim}
                            onChange={(e) => setEmailOrNim(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting} // Gunakan state loading lokal
                        className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                    >
                        {isSubmitting ? 'Memproses...' : 'Login'}
                    </button>
                </form>
            </div>
            <ToastContainer limit={1} position="top-right" />
        </div>
    );
};

export default LoginPage;