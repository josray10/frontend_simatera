'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import {
  MENU_ITEMS_ADMIN,
  MENU_ITEMS_KASRA,
  MENU_ITEMS_MAHASISWA,
} from '@/constant/menu';

const Sidebar = ({ role, activeMenu, setActiveMenu }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return MENU_ITEMS_ADMIN;
      case 'kasra':
        return MENU_ITEMS_KASRA;
      case 'mahasiswa':
        return MENU_ITEMS_MAHASISWA;
      default:
        return [];
    }
  };

  return (
    <>
      {/* Toggle Button untuk Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 left-4 z-50 p-2 rounded-md
          md:hidden
          ${isOpen ? 'text-white' : 'text-gray-800'}
        `}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-gray-800 text-white
          flex flex-col p-5 bg-gradient-sidebar
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
          w-64
        `}
      >
        <div className="flex flex-col items-center justify-center mt-8 md:mt-0">
          <img
            src="/images/logoasrama.png"
            alt="Logo Asrama ITERA"
            className="w-16 h-16 mb-2"
          />
          <h2 className="text-xl font-bold text-center">
            Dashboard <br /> SIMATERA
          </h2>
        </div>
        <ul className="py-10">
          {getMenuItems().map((item) => (
            <li key={item.key}>
              <Link
                href={`/${role}/${item.key}`}
                onClick={() => isMobile && setIsOpen(false)}
                className={`w-full flex items-center gap-2 text-left p-3 rounded-md 
                  ${activeMenu === item.key
                    ? 'bg-orange-700'
                    : 'hover:bg-orange-700'
                  }
                  transition-colors duration-200
                `}
              >
                {item.icon} {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
