'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import PageHeading from '../../components/PageHeading';
import { getDataPengumuman, getDataJadwalKegiatan, getDataMahasiswa } from '@/utils/localStorage';
import KasraDataPenghuni from '@/app/kasra/datapenghuni/page';
import KasraPengaduanPage from '@/app/kasra/pengaduan/page';
import DataPelanggaran from '@/app/kasra/datapelanggaran/page';
import CreateJadwalKegiatan from '@/app/kasra/jadwalkegiatan/page';
import DataPembayaranKasra from '@/app/kasra/datapembayaran/page';
import { UserGroupIcon, UserIcon, CalendarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function KakakAsrama() {
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const router = useRouter();
  const [pengumuman, setPengumuman] = useState([]);
  const [jadwalKegiatan, setJadwalKegiatan] = useState([]);
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    mahasiswaLakiLaki: 0,
    mahasiswaPerempuan: 0,
    totalPengumuman: 0,
    totalJadwal: 0
  });

  const [kasraName, setKasraName] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.role !== 'kasra') {
      router.replace(`/${user.role}`);
    } else {
      setKasraName(user.nama || 'Kasra');
    }
  }, [user, router]);

  // Ambil data pengumuman, jadwal kegiatan, dan statistik
  useEffect(() => {
    // Ambil data pengumuman
    const pengumumanData = getDataPengumuman();
    if (pengumumanData) {
      setPengumuman(pengumumanData);
    }

    // Ambil data jadwal kegiatan
    const jadwalData = getDataJadwalKegiatan();
    if (jadwalData) {
      setJadwalKegiatan(jadwalData);
    }

    // Ambil data mahasiswa untuk statistik
    const mahasiswaData = getDataMahasiswa() || [];
    
    // Hitung statistik
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

    setStats({
      totalMahasiswa: mahasiswaData.length,
      mahasiswaLakiLaki,
      mahasiswaPerempuan,
      totalPengumuman: pengumumanData ? pengumumanData.length : 0,
      totalJadwal: jadwalData ? jadwalData.length : 0
    });
  }, []);

  // Handle menu change
  const handleMenuChange = (menuItem) => {
    setActiveMenu(menuItem);
  };

  const profileImage = '/images/mahasiswaprofile.png'; // Ganti dengan path gambar profil

  const renderContent = () => {
    switch (activeMenu) {
      case 'Beranda':
        return (
          <div className="p-3 sm:p-3 md:p-5 lg:p-8">
            {/* Statistik Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Card 1: Total Mahasiswa */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Mahasiswa</h3>
                  <p className="text-2xl font-bold">{stats.totalMahasiswa}</p>
                  <div className="flex text-xs mt-1">
                    <span className="text-blue-600 mr-2">L: {stats.mahasiswaLakiLaki}</span>
                    <span className="text-pink-600">P: {stats.mahasiswaPerempuan}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Pengumuman */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total Pengumuman</h3>
                  <p className="text-2xl font-bold">{stats.totalPengumuman}</p>
                  <p className="text-xs text-gray-500 mt-1">Pengumuman aktif</p>
                </div>
              </div>

              {/* Card 3: Jadwal Kegiatan */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Jadwal Kegiatan</h3>
                  <p className="text-2xl font-bold">{stats.totalJadwal}</p>
                  <p className="text-xs text-gray-500 mt-1">Kegiatan terjadwal</p>
                </div>
              </div>
            </div>

            {/* Pengumuman Section */}
            <div className="bg-white rounded-lg shadow-md p-3 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-orange-500 mr-2" />
                Daftar Pengumuman
              </h2>
              <div className="space-y-4">
                {pengumuman.length > 0 ? (
                  pengumuman.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <h3 className="text-lg font-semibold">{item.judul}</h3>
                      <p className="text-sm text-blue-500 mb-2">{item.tanggal}</p>
                      <p className="text-gray-700">{item.deskripsi}</p>
                      {item.file && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.file.data;
                              link.download = item.file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
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
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Download {item.file.name}
                          </button>
                          <span className="text-sm text-gray-500">
                            {item.file.type.includes('pdf') ? 'PDF' : 'Word'}{' '}
                            Document
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Tidak ada pengumuman.
                  </p>
                )}
              </div>
            </div>

            {/* Jadwal Kegiatan Section */}
            <div className="bg-white rounded-lg shadow-md p-3">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-500 mr-2" />
                Daftar Jadwal Kegiatan
              </h2>
              <div className="space-y-4">
                {jadwalKegiatan.length > 0 ? (
                  jadwalKegiatan.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <h3 className="text-lg font-semibold">{item.judul}</h3>
                      <p className="text-sm text-green-500 mb-2">{item.tanggal}</p>
                      <p className="text-gray-700">{item.deskripsi}</p>
                      {item.file && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.file.data;
                              link.download = item.file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
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
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Download {item.file.name}
                          </button>
                          <span className="text-sm text-gray-500">
                            {item.file.type.includes('pdf') ? 'PDF' : 'Word'}{' '}
                            Document
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Tidak ada jadwal kegiatan.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'Data Penghuni':
        return <KasraDataPenghuni />;
      case 'Data Pelanggaran':
        return <DataPelanggaran />;
      case 'Data Pembayaran':
        return <DataPembayaranKasra />;
      case 'Pengaduan':
        return <KasraPengaduanPage />;
      case 'Jadwal Kegiatan':
        return <CreateJadwalKegiatan />;

      default:
        return null;
    }
  };

  // Loading state atau belum ada user
  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        {/* PageHeading bagian atas */}
        <PageHeading
          title={activeMenu}
          name={kasraName}
          profileImage={profileImage}
        />

        {/* Konten utama */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
}
