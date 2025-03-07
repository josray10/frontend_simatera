'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/utils/AuthContext';

export default function PageHeading({ title }) {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLogoutPromptVisible, setIsLogoutPromptVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuVisible(false);
      }
    };

    if (isMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuVisible]);

  // Protect from unauthorized access
  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router]);

  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

  const handleLogout = () => {
    setIsLogoutPromptVisible(true);
    setIsMenuVisible(false);
  };

  const confirmLogout = async () => {
    try {
      setIsLoading(true);

      // Gunakan logout dari AuthContext
      await authLogout();

      // Clear local states
      setIsLogoutPromptVisible(false);
      setIsMenuVisible(false);

      // Redirect dengan replace untuk mencegah navigasi back
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogout = () => setIsLogoutPromptVisible(false);

  // Loading state saat initial render
  if (!user) {
    return (
      <div className="p-6 shadow-lg bg-white flex justify-between w-full items-center">
        <span className="text-3xl text-[#828282] font-bold">{title}</span>
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 shadow-lg bg-white flex justify-between w-full items-center relative z-10">
      <span className="text-3xl text-[#828282] font-bold">{title}</span>

      <div className="flex gap-5 items-center">
        <p className="text-gray-600">
          {user.email} <span className="text-gray-400">({user.role})</span>
        </p>
        <div className="relative">
          <Image
            src="/images/adminprofile.png"
            alt="Profile"
            width={50}
            height={50}
            className="cursor-pointer rounded-full hover:opacity-80 transition-opacity"
            role="button"
            onClick={toggleMenu}
          />

          {/* Dropdown Menu */}
          {isMenuVisible && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 py-1 border border-gray-100"
            >
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutPromptVisible && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Logout</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari sistem?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                onClick={cancelLogout}
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={confirmLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
    </div>
  );
}
