'use client';

import { useState, useEffect } from 'react';
import { getAllDataPengaduanMahasiswa, updatePengaduanStatus } from '@/utils/localStorage';
import PageHeading from '@/components/PageHeading';
import Pagination from '@/components/Pagination';

const TABLE_HEAD = [
  'ID',
  'Tipe',
  'NIM',
  'Nama',
  'Gedung',
  'No Kamar',
  'Keterangan',
  'Tanggal',
  'Status',
  'Gambar',
  'Aksi'
];

const STATUS_OPTIONS = [
  'Belum Dikerjakan',
  'Sedang Dikerjakan',
  'Selesai'
];

const DataPengaduanPage = () => {
  const [pengaduanList, setPengaduanList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStatus, setEditingStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah item per halaman

  // Fetch all complaints data
  const refreshData = () => {
    const allData = getAllDataPengaduanMahasiswa();
    // Sort by date, newest first
    allData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setPengaduanList(allData);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter complaints based on status, type and search query
  const filteredPengaduan = pengaduanList.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredPengaduan.length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPengaduan.slice(indexOfFirstItem, indexOfLastItem);

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, searchQuery]);

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedList = pengaduanList.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });

    // Update in localStorage
    try {
      updatePengaduanStatus(id, newStatus); // Modified to pass id and newStatus directly
      refreshData(); // Refresh data from localStorage after update
      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
      // Optionally add error handling UI here
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeading title="Manajemen Pengaduan" />

      <div className="p-6">
        {/* Filter and Search Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter Status</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Filter Tipe</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="kasra">Kasra</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Pencarian</label>
            <input
              type="text"
              placeholder="Cari berdasarkan NIM, nama, atau keterangan..."
              className="w-full p-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {TABLE_HEAD.map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className=" odd:bg-[#FDE9CC] even:bg-white ">
                  <td className="px-4 py-3 text-sm">{item.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'mahasiswa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {item.type === 'mahasiswa' ? 'Mahasiswa' : 'Kasra'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.nim}</td>
                  <td className="px-4 py-3 text-sm">{item.nama}</td>
                  <td className="px-4 py-3 text-sm">{item.gedung}</td>
                  <td className="px-4 py-3 text-sm">{item.kamar}</td>
                  <td className="px-4 py-3 text-sm">{item.keterangan}</td>
                  <td className="px-4 py-3 text-sm">{item.tanggal}</td>
                  <td className="px-4 py-3">
                    {editingStatus === item.id ? (
                      <select
                        className="p-1 border rounded"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                        autoFocus
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Belum Dikerjakan'
                          ? 'bg-red-100 text-red-800'
                          : item.status === 'Sedang Dikerjakan'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}
                        onClick={() => setEditingStatus(item.id)}
                      >
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.gambar && (
                      <img
                        src={item.gambar}
                        alt="Pengaduan"
                        className="w-10 h-10 object-cover rounded cursor-pointer"
                        onClick={() => openModal(item.gambar)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => setEditingStatus(item.id)}
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Image Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={closeModal}
          >
            <div
              className="max-w-4xl p-4 bg-white rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Detail Pengaduan"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  onClick={closeModal}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPengaduanPage;