'use client';

import React, { useState, useEffect } from 'react';
import PageHeading from '@/components/PageHeading';
import { getDataMahasiswa } from '@/utils/localStorage';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';

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
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        item.nim.toLowerCase().includes(query) ||
        item.nama.toLowerCase().includes(query) ||
        item.gedung.toLowerCase().includes(query) ||
        item.noKamar.toLowerCase().includes(query) ||
        item.statusPembayaran.toLowerCase().includes(query) ||
        item.periode.toLowerCase().includes(query) ||
        item.metodePembayaran.toLowerCase().includes(query) ||
        (item.catatan && item.catatan.toLowerCase().includes(query))
      );
    }
    
    return filteredData;
  };

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getFilteredData().slice(indexOfFirstItem, indexOfLastItem);


  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Pembayaran" />

        <div className="p-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-64">
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
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
            </div>
            
          </div>

          {/* Payment Data Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-center">
                  <th className="px-4 py-3 text-sm">NIM</th>
                  <th className="px-4 py-3 text-sm">Nama</th>
                  <th className="px-4 py-3 text-sm">Gedung</th>
                  <th className="px-4 py-3 text-sm">Kamar</th>
                  <th className="px-4 py-3 text-sm">Status Pembayaran</th>
                  <th className="px-4 py-3 text-sm">Periode</th>
                  <th className="px-4 py-3 text-sm">Nominal</th>
                  <th className="px-4 py-3 text-sm">Metode Pembayaran</th>
                  <th className="px-4 py-3 text-sm">Tanggal Pembayaran</th>
                  <th className="px-4 py-3 text-sm">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="odd:bg-[#FDE9CC] even:bg-white">
                    <td className="px-4 py-3 text-sm">{item.nim}</td>
                    <td className="px-4 py-3 text-sm">{item.nama}</td>
                    <td className="px-4 py-3 text-sm">{item.gedung}</td>
                    <td className="px-4 py-3 text-sm">{item.noKamar}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded ${
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
                    <td className="px-4 py-3 text-sm">{item.tanggalPembayaran}</td>
                    <td className="px-4 py-3 text-sm">{item.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPembayaran;