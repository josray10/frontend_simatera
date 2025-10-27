// src/utils/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan path ini benar
import { initializeLocalStorageDataFromJson } from './initializeData';
// Hapus import service backend jika tidak dipakai
// import { getCurrentUser, logout as authLogout, changePassword as authChangePassword } from '../services/AuthService';
// Import fungsi localStorage jika diperlukan (misal untuk getCurrentUser versi localStorage)
import { getDataMahasiswa, getDataKasra } from './localStorage'; // Contoh import

const AuthContext = createContext();

// Simulasi getCurrentUser dari localStorage (gantikan versi AuthService)
const getCurrentUserFromLocal = () => {
    try {
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('token'); // Tetap cek token? Atau hapus jika tidak relevan lagi
        return userJson && token ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Error reading user from localStorage:", error);
        localStorage.removeItem('user'); // Hapus jika korup
        localStorage.removeItem('token');
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Mulai dengan loading true
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Efek ini hanya untuk menandai mount dan memanggil inisialisasi
    useEffect(() => {
        console.log("[AuthContext] Component mounted on client.");
        setMounted(true);
        // Panggil inisialisasi data dari JSON
        initializeLocalStorageDataFromJson();
    }, []); // Dependency array kosong agar hanya jalan sekali

    // Efek ini untuk memeriksa status login setelah mount
    useEffect(() => {
        // Jangan jalankan sebelum mount atau jika inisialisasi belum selesai (jika ada flag loading inisialisasi)
        if (!mounted) {
            console.log("[AuthContext] Waiting for mount...");
            return;
        }

        console.log("[AuthContext] Checking auth status...");
        setIsLoading(true); // Set loading true saat mulai cek
        try {
            // Coba ambil user dari localStorage
            const currentUser = getCurrentUserFromLocal();
            if (currentUser) {
                setUser(currentUser);
                console.log("[AuthContext] User found in localStorage:", currentUser);
            } else {
                setUser(null);
                console.log("[AuthContext] No user found in localStorage.");
                // Jika tidak ada user dan path bukan /auth, arahkan ke login
                // Perlu hati-hati agar tidak terjadi infinite loop jika sudah di /auth
                // Ini mungkin lebih baik ditangani oleh withAuth HOC
                // if (window.location.pathname !== '/auth') {
                //    router.replace('/auth');
                // }
            }
        } catch (error) {
            console.error('[AuthContext] Error checking authentication:', error);
            setUser(null); // Pastikan user null jika ada error
        } finally {
             // Selesaikan loading setelah pengecekan selesai
            console.log("[AuthContext] Auth check finished.");
            setIsLoading(false);
        }
    }, [mounted]); // Hanya bergantung pada mounted

    // --- Fungsi Login (Menggunakan data dari localStorage) ---
    const login = (userData) => {
        if (typeof window !== 'undefined') {
            console.log("[AuthContext] Logging in user:", userData);
            localStorage.setItem('user', JSON.stringify(userData));
            // Simulasi token jika masih diperlukan oleh logika lain
            localStorage.setItem('token', `fake-token-${userData.email || userData.nim}`);
            setUser(userData); // Update state
        }
    };

    // --- Fungsi Logout ---
    const logout = async () => {
        console.log("[AuthContext] Logging out...");
        setIsLoading(true); // Opsi: tampilkan loading saat logout
        try {
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            // Beri jeda sedikit agar state terupdate sebelum redirect
            await new Promise(resolve => setTimeout(resolve, 50));
            router.replace('/auth'); // Gunakan replace agar tidak bisa kembali
            console.log("[AuthContext] Logout successful.");
        } catch (error) {
            console.error('[AuthContext] Error during logout:', error);
        } finally {
            setIsLoading(false);
        }
    };

     // --- Fungsi Update Password (di localStorage) ---
    const updatePassword = (newPassword) => {
        if (typeof window === 'undefined' || !user) return false;

        console.log(`[AuthContext] Attempting to update password for ${user.role} ${user.nim || user.email}`);
        try {
            // 1. Update data user yang sedang login di localStorage
            const updatedUser = { ...user, password: newPassword };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser); // Update state juga

            // 2. Update data spesifik di list-nya (mahasiswa/kasra/admin)
            if (user.role === 'mahasiswa' && user.nim) {
                const mahasiswaData = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
                const updatedMahasiswaData = mahasiswaData.map(mhs =>
                    mhs.nim === user.nim ? { ...mhs, password: newPassword } : mhs
                );
                localStorage.setItem('mahasiswaData', JSON.stringify(updatedMahasiswaData));
                console.log("[AuthContext] Updated password in mahasiswaData.");

            } else if (user.role === 'kasra' && user.nim) {
                 const kasraData = JSON.parse(localStorage.getItem('kasraData') || '[]');
                 const updatedKasraData = kasraData.map(ksr =>
                    ksr.nim === user.nim ? { ...ksr, password: newPassword } : ksr
                );
                localStorage.setItem('kasraData', JSON.stringify(updatedKasraData));
                 console.log("[AuthContext] Updated password in kasraData.");

            } else if (user.role === 'admin' && user.email) {
                 // Cari admin di data admin (jika disimpan terpisah)
                 const adminData = JSON.parse(localStorage.getItem('adminData') || '[]');
                 const updatedAdminData = adminData.map(adm =>
                     adm.email === user.email ? { ...adm, password: newPassword } : adm
                 );
                 localStorage.setItem('adminData', JSON.stringify(updatedAdminData));
                 console.log("[AuthContext] Updated password in adminData.");
            }

            console.log("[AuthContext] Password update successful.");
            return true;
        } catch (error) {
            console.error("[AuthContext] Error updating password in localStorage:", error);
            return false;
        }
    };

    // Nilai yang disediakan oleh context
    const contextValue = {
        // Tampilkan user hanya jika sudah mounted dan tidak loading
        user: mounted && !isLoading ? user : null,
        isLoading,
        login,
        logout,
        updatePassword
    };

    // Tampilkan children hanya jika proses loading awal selesai
    // Atau tampilkan loading state global di sini jika diinginkan
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
            {/* {isLoading && mounted ? <p>Loading application...</p> : children} */}
        </AuthContext.Provider>
    );
}

// Hook kustom untuk menggunakan context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// High Order Component (HOC) untuk melindungi route
export function withAuth(Component, requiredRole) {
    return function ProtectedRoute(props) {
        const { user, isLoading } = useAuth();
        const router = useRouter();
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);
        }, []);

        useEffect(() => {
            // Lakukan redirect hanya jika sudah mounted dan loading selesai
            if (mounted && !isLoading) {
                if (!user) {
                    console.log("[withAuth] No user found, redirecting to /auth");
                    router.replace('/auth');
                } else if (requiredRole && user.role !== requiredRole) {
                    console.log(`[withAuth] Role mismatch (required: ${requiredRole}, user: ${user.role}), redirecting`);
                    // Redirect ke halaman sesuai role user, bukan root
                     switch (user.role) {
                        case 'admin': router.replace('/admin'); break;
                        case 'kasra': router.replace('/kasra'); break;
                        case 'mahasiswa': router.replace('/mahasiswa'); break;
                        default: router.replace('/auth'); // Fallback
                    }
                } else {
                     console.log("[withAuth] Auth check passed.");
                }
            } else if (!isLoading) {
                 console.log("[withAuth] Waiting for mount or loading...");
            }
        }, [user, isLoading, router, mounted, requiredRole]);

        // Tampilkan loading indicator atau null selama loading atau sebelum mount
        if (!mounted || isLoading) {
            return (
                 <div className="flex justify-center items-center h-screen bg-gray-100">
                    <p>Memeriksa autentikasi...</p> {/* Atau skeleton loader */}
                 </div>
            );
        }

        // Jangan render komponen jika user tidak ada atau role tidak cocok (karena akan diredirect)
        if (!user || (requiredRole && user.role !== requiredRole)) {
            return null; // Akan diredirect oleh useEffect di atas
        }

        // Render komponen jika autentikasi berhasil
        return <Component {...props} />;
    };
}