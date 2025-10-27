'use client';

import { useState, useEffect } from 'react';
import PageHeading from  '@/components/PageHeading';
import { getDataJadwalKegiatan } from '@/utils/localStorage';
import CreateJadwalKegiatan from '@/app/kasra/jadwalkegiatan/page';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/AuthContext';

export default function JadwalKegiatanMahasiswa() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [jadwalKegiatan, setJadwalKegiatan] = useState([]);
  const [mahasiswaName, setMahasiswaName] = useState('');

  useEffect(() => {
    const data = getDataJadwalKegiatan();
    if (data) {
      setJadwalKegiatan(data);
    }
  }, []);



  return (
    <div className="flex bg-[#F5F6FA]">
        <div className="flex-1 flex flex-col">
            <PageHeading title="Jadwal Kegiatan" />
            <div className="flex-1 p-6">
              {jadwalKegiatan.length > 0 ? (
                jadwalKegiatan.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold">{item.judul}</h2>
                    <p className="text-sm text-blue-500">{item.tanggal}</p>
                    <p className="text-gray-700 mt-2">{item.deskripsi}</p>
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
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition colors"
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
                <p className="text-gray-500  py-4">
                  Tidak ada jadwal kegiatan.
                </p>
              )}
            </div>
            </div>
          </div>
  );
}
