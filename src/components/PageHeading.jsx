'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/utils/AuthContext';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';

export default function PageHeading({ title }) {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLogoutPromptVisible, setIsLogoutPromptVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  // Menandai bahwa komponen sudah di-mount di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    if (!mounted) return;

    function handleClickOutside(event) {
      if (
        isMenuVisible && 
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsMenuVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuVisible, mounted]);

  // Protect from unauthorized access
  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router, mounted]);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleLogout = () => {
    setIsLogoutPromptVisible(true);
    setIsMenuVisible(false);
  };

  const confirmLogout = async () => {
    try {
      setIsLoading(true);
      await authLogout();
      setIsLogoutPromptVisible(false);
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogout = () => setIsLogoutPromptVisible(false);

  // Tampilkan skeleton loader saat loading atau belum di-mount
  if (!mounted || !user) {
    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg bg-white flex justify-between w-full items-center">
        <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#828282] font-bold truncate ml-10 sm:ml-0">
          {title}
        </div>
        <div className="animate-pulse bg-gray-200 h-6 sm:h-8 md:h-10 w-20 sm:w-24 md:w-32 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg bg-white flex justify-between w-full items-center">
        {/* Judul dengan margin-left untuk memberikan ruang pada ikon hamburger di mobile */}
        <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#828282] font-bold truncate ml-10 sm:ml-0">{title}</span>

        <div className="flex gap-2 sm:gap-3 md:gap-5 items-center">
          {/* Email dan role - tampil di semua ukuran layar */}
          <p className="text-gray-600 text-xs sm:text-sm md:text-base truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none">
            {user?.email || 'User'} <span className="text-gray-400">({user?.role || 'guest'})</span>
          </p>
          
          {/* Profile dropdown */}
          <div className="relative">
            <button 
              ref={profileRef}
              onClick={toggleMenu}
              className="cursor-pointer rounded-full hover:opacity-80 transition-opacity focus:outline-none"
              aria-label="Toggle profile menu"
            >
              <Image
                src="/images/adminprofile.png"
                alt="Profile"
                width={40}
                height={40}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu - Rendered outside the header */}
      {isMenuVisible && (
        <div 
          ref={menuRef}
          className="fixed right-4 top-12 sm:right-6 sm:top-14 md:right-8 md:top-16 bg-white shadow-xl rounded-md w-36 sm:w-40 md:w-48 py-1 border border-gray-100 z-[500]"
        >
          <button
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 text-xs sm:text-sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <FaSignOutAlt className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutPromptVisible && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[9999] p-4">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Konfirmasi Logout</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-6">
              Apakah Anda yakin ingin keluar dari sistem?
            </p>
            <div className="flex gap-2 sm:gap-3 md:gap-4 justify-end">
              <button
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={cancelLogout}
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={confirmLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Proses...
                  </>
                ) : (
                  'Ya, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
