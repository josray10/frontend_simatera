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
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-gray-800 text-white
          flex flex-col p-5 bg-gradient-sidebar
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:h-screen
          w-64 overflow-y-auto
        `}
      >
        {/* Toggle Button untuk Mobile - Dipindahkan ke dalam sidebar */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-1 hover:bg-gray-700 rounded-md"
          >
            <FaTimes size={10} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <img
            src="/images/logoasrama.png"
            alt="Logo Asrama ITERA"
            className="w-16 h-16 mb-2"
          />
          <h2 className="text-xl font-bold text-center">
            Dashboard <br /> SIMATERA
          </h2>
        </div>

        <ul className="py-6 flex-grow">
          {getMenuItems().map((item) => (
            <li key={item.key} className="mb-1">
              <Link
                href={`/${role}/${item.key}`}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                  if (setActiveMenu) setActiveMenu(item.name);
                }}
                className={`w-full flex items-center gap-2 text-left p-3 rounded-md 
                  ${activeMenu === item.name
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

      {/* Toggle Button untuk Mobile - Di luar sidebar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-2 left-2 z-50 p-1.5 bg-gray-800 text-white rounded-md md:hidden"
        >
          <FaBars size={16} />
        </button>
      )}

      {/* Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
