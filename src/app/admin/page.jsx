'use client';

import { useEffect, useState, useContext } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import PageHeading from '../../components/PageHeading';
import KelolaData from './datapenghuni/page';
import DataPelanggaran from './datapelanggaran/page';
import CreatePengumuman from './pengumuman/page';
import DataPengaduanPage from './datapengaduan/page';
import DataPembayaran from './datapembayaran/page';
import DataKamar from './datakamar/page';
import { getDataPengumuman } from '@/utils/localStorage';
import { getDataMahasiswa, getDataKasra } from '@/utils/localStorage';
import { UserGroupIcon, UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pengumuman, setPengumuman] = useState([]);
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    mahasiswaLakiLaki: 0,
    mahasiswaPerempuan: 0,
    totalKasra: 0,
    kasraLakiLaki: 0,
    kasraPerempuan: 0
  });

  const adminName = 'Admin';
  const profileImage = '/images/adminprofile.png';

  // Proteksi route dan cek role
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (user.role !== 'admin') {
      router.push(`/${user.role}`);
    }
  }, [user, router]);

  // Load data
  useEffect(() => {
    // Load pengumuman
    const pengumumanData = getDataPengumuman();
    setPengumuman(pengumumanData || []);

    // Load statistik
    const mahasiswaData = getDataMahasiswa() || [];
    const kasraData = getDataKasra() || [];

    console.log("Mahasiswa data:", mahasiswaData);
    console.log("Kasra data:", kasraData);

    // Cek properti yang digunakan untuk gender
    const mahasiswaLakiLaki = mahasiswaData.filter(m => 
      m.jenisKelamin === 'Laki-laki' || 
      m.gender === 'Laki-laki' || 
      m.jenisKelamin === 'L' || 
      m.gender === 'L'
    ).length;
    
    const mahasiswaPerempuan = mahasiswaData.filter(m => 
      m.jenisKelamin === 'Perempuan' || 
      m.gender === 'Perempuan' || 
      m.jenisKelamin === 'P' || 
      m.gender === 'P'
    ).length;
    
    const kasraLakiLaki = kasraData.filter(k => 
      k.jenisKelamin === 'Laki-laki' || 
      k.gender === 'Laki-laki' || 
      k.jenisKelamin === 'L' || 
      k.gender === 'L'
    ).length;
    
    const kasraPerempuan = kasraData.filter(k => 
      k.jenisKelamin === 'Perempuan' || 
      k.gender === 'Perempuan' || 
      k.jenisKelamin === 'P' || 
      k.gender === 'P'
    ).length;

    setStats({
      totalMahasiswa: mahasiswaData.length,
      mahasiswaLakiLaki,
      mahasiswaPerempuan,
      totalKasra: kasraData.length,
      kasraLakiLaki,
      kasraPerempuan
    });
  }, []);

  // Render konten berdasarkan activeMenu
  const renderContent = () => {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Statistik Cards dengan breakpoint yang lebih detail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          {/* Total Mahasiswa */}
          <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Mahasiswa</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1">{stats.totalMahasiswa}</p>
                <div className="flex gap-2 sm:gap-3 md:gap-4 mt-2 text-xs sm:text-sm">
                  <span className="text-blue-600">L: {stats.mahasiswaLakiLaki}</span>
                  <span className="text-pink-600">P: {stats.mahasiswaPerempuan}</span>
                </div>
              </div>
              <UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-500" />
            </div>
          </div>

          {/* Total Kasra */}
          <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Kasra</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1">{stats.totalKasra}</p>
                <div className="flex gap-2 sm:gap-3 md:gap-4 mt-2 text-xs sm:text-sm">
                  <span className="text-blue-600">L: {stats.kasraLakiLaki}</span>
                  <span className="text-pink-600">P: {stats.kasraPerempuan}</span>
                </div>
              </div>
              <BuildingOffice2Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-500" />
            </div>
          </div>

          {/* Total Penghuni */}
          <div className="bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Penghuni</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1">
                  {stats.totalMahasiswa + stats.totalKasra}
                </p>
                <div className="flex gap-2 sm:gap-3 md:gap-4 mt-2 text-xs sm:text-sm">
                  <span className="text-blue-600">L: {stats.mahasiswaLakiLaki + stats.kasraLakiLaki}</span>
                  <span className="text-pink-600">P: {stats.mahasiswaPerempuan + stats.kasraPerempuan}</span>
                </div>
              </div>
              <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Daftar Pengumuman dengan breakpoint yang lebih detail */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6">Daftar Pengumuman</h1>
        <div className="space-y-3 sm:space-y-4">
          {pengumuman && pengumuman.length > 0 ? (
            pengumuman.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">{item.judul}</h2>
                <p className="text-xs sm:text-sm text-blue-500">{item.tanggal}</p>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 mt-2">{item.deskripsi}</p>
                {item.file && (
                  <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.file.data;
                        link.download = item.file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs sm:text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download {item.file.name}
                    </button>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {item.file.type.includes('pdf') ? 'PDF' : 'Word'} Document
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4 text-xs sm:text-sm md:text-base">
              Tidak ada pengumuman.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1">
      <PageHeading title="Beranda" />
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
