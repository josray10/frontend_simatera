'use client';

import React, { useState, useEffect } from 'react';
import PageHeading from '@/components/PageHeading';
import { getDataMahasiswa } from '@/utils/localStorage';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';
import dayjs from 'dayjs';

const DataPembayaran = () => {
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Ambil data mahasiswa dan pembayaran dari localStorage
    const mahasiswaData = getDataMahasiswa();
    const existingPembayaran = mahasiswaData.map((mahasiswa) => {
      const pembayaranData = JSON.parse(localStorage.getItem(`pembayaran_${mahasiswa.nim}`)) || {};
      return {
        ...mahasiswa,
        statusPembayaran: pembayaranData.statusPembayaran || 'Belum Lunas',
        periode: pembayaranData.periode || 'Semester 1',
        nominal: pembayaranData.nominal || 1000000,
        metodePembayaran: pembayaranData.metodePembayaran || '-',
        tanggalPembayaran: pembayaranData.tanggalPembayaran || '-',
        catatan: pembayaranData.catatan || '-',
      };
    });

    setDataPembayaran(existingPembayaran);
  }, []);

  const getFilteredData = () => {
    let filteredData = dataPembayaran;
    
    // Filter berdasarkan status pembayaran jika tidak "all"
    if (filterStatus !== 'all') {
      filteredData = filteredData.filter(item => item.statusPembayaran === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        (item.nim || '').toLowerCase().includes(query) ||
        (item.nama || '').toLowerCase().includes(query) ||
        (item.gedung || '').toLowerCase().includes(query) ||
        (item.noKamar || '').toLowerCase().includes(query) ||
        (item.statusPembayaran || '').toLowerCase().includes(query) ||
        (item.periode || '').toLowerCase().includes(query) ||
        (item.metodePembayaran || '').toLowerCase().includes(query) ||
        (item.catatan && item.catatan.toLowerCase().includes(query))
      );
    }
    
    return filteredData;
  };

  // Format tanggal untuk tampilan
  const formatTanggal = (tanggal) => {
    if (!tanggal || tanggal === '-') return '-';
    return dayjs(tanggal).format('DD/MM/YYYY');
  };

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getFilteredData().slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 flex flex-col">
      <PageHeading title="Data Pembayaran" />

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Pembayaran</h1>
          <p className="text-gray-600">Lihat status pembayaran mahasiswa asrama</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <Search
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset ke halaman pertama saat mencari
              }}
              placeholder="Cari pembayaran..."
            />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
              }}
              className="p-2 border rounded w-full sm:w-auto"
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gedung</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.nim || index} className="odd:bg-[#FDE9CC] even:bg-white">
                    <td className="px-4 py-3 text-sm">{item.nim}</td>
                    <td className="px-4 py-3 text-sm">{item.nama}</td>
                    <td className="px-4 py-3 text-sm">{item.gedung || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.noKamar || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.statusPembayaran === 'Lunas' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.statusPembayaran}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.periode}</td>
                    <td className="px-4 py-3 text-sm">Rp. {item.nominal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{item.metodePembayaran}</td>
                    <td className="px-4 py-3 text-sm">{formatTanggal(item.tanggalPembayaran)}</td>
                    <td className="px-4 py-3 text-sm">{item.catatan}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-3 text-sm text-center text-gray-500">
                    Tidak ada data pembayaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Shown only on smaller screens */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <div key={item.nim || index} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{item.nama}</h3>
                    <p className="text-sm text-gray-500">NIM: {item.nim}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.statusPembayaran === 'Lunas' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.statusPembayaran}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Gedung</p>
                    <p className="font-medium">{item.gedung || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kamar</p>
                    <p className="font-medium">{item.noKamar || '-'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Periode</p>
                    <p className="font-medium">{item.periode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nominal</p>
                    <p className="font-medium">Rp. {item.nominal.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    <p className="font-medium">{item.metodePembayaran}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Pembayaran</p>
                    <p className="font-medium">{formatTanggal(item.tanggalPembayaran)}</p>
                  </div>
                </div>
                
                {item.catatan && item.catatan !== '-' && (
                  <div className="text-sm">
                    <p className="text-gray-500">Catatan</p>
                    <p className="font-medium">{item.catatan}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-4 rounded-lg shadow-md text-center text-gray-500">
              Tidak ada data pembayaran
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPembayaran;