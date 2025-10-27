'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import PageHeading from '@/components/PageHeading';
import { ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { getDataMahasiswa, getDataPelanggaranMahasiswa, saveDataPelanggaranMahasiswa, addPendingPelanggaran } from '@/utils/localStorage';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import dayjs from 'dayjs';

const TABLE_HEAD = [
  'NIM',
  'Nama',
  'Prodi',
  'Gedung',
  'No Kamar',
  'Email',
  'Tanggal Lahir',
  'Tempat Lahir',
  'Asal',
  'Status',
  'Golongan UKT',
  'Jenis Kelamin',
  'Action',
];

const DataMahasiswaKasra = () => {
  const { user } = useAuth(); // Mendapatkan user yang sedang login
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [dataPelanggaran, setDataPelanggaran] = useState([]);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    gedung: '',
    noKamar: '',
    tanggalPelanggaran: '',
    keteranganPelanggaran: '',
  });
  const [showPelanggaranForm, setShowPelanggaranForm] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

  // Mengambil data mahasiswa dan pelanggaran dari localStorage
  useEffect(() => {
    const savedData = getDataMahasiswa();
    setDataMahasiswa(savedData);

    const savedPelanggaran = getDataPelanggaranMahasiswa();
    setDataPelanggaran(savedPelanggaran);
  }, [user]);

  // Kasra hanya bisa menambahkan pelanggaran
  const handleTambahPelanggaranKasra = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setFormData({
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      gedung: mahasiswa.gedung,
      noKamar: mahasiswa.noKamar,
      tanggalPelanggaran: '',
      keteranganPelanggaran: '',
    });
    setShowPelanggaranForm(true);
  };

  const handleSubmitPelanggaran = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.tanggalPelanggaran || !formData.keteranganPelanggaran) {
      toast.error('Tanggal dan keterangan pelanggaran harus diisi');
      return;
    }
    
    // Simpan ke data pelanggaran mahasiswa
    const existingPelanggaran = getDataPelanggaranMahasiswa(selectedMahasiswa.nim);
    
    // Buat ID unik dengan timestamp dan random string
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Buat objek pelanggaran baru
    const newPelanggaran = { 
      ...formData, 
      id: uniqueId,
      createdBy: 'kasra',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Tambahkan ke daftar pelanggaran mahasiswa
    const updatedPelanggaran = [
      ...existingPelanggaran,
      newPelanggaran
    ];

    // Simpan ke localStorage pelanggaran mahasiswa
    saveDataPelanggaranMahasiswa(selectedMahasiswa.nim, updatedPelanggaran);
    
    // Tambahkan juga ke daftar pelanggaran yang menunggu validasi
    addPendingPelanggaran(newPelanggaran);

    // Update state pelanggaran
    setDataPelanggaran(updatedPelanggaran);

    setShowPelanggaranForm(false);
    setFormData({
      nim: '',
      nama: '',
      gedung: '',
      noKamar: '',
      tanggalPelanggaran: '',
      keteranganPelanggaran: '',
    });

    toast.success('Pelanggaran berhasil ditambahkan dan menunggu validasi admin');
  };

  // Filter data berdasarkan pencarian
  const filteredData = dataMahasiswa.filter((mahasiswa) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (mahasiswa.nim || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.nama || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.prodi || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.gedung || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.noKamar || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.email || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.tempatLahir || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.asal || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.status || '').toLowerCase().includes(searchLower) ||
      (mahasiswa.jenisKelamin || '').toLowerCase().includes(searchLower)
    );
  });

  // Update pagination untuk menggunakan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Format tanggal untuk tampilan
  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    return dayjs(tanggal).format('DD/MM/YYYY');
  };

  return (
    <div className="flex-1 flex flex-col">
      <PageHeading title="Data Mahasiswa" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Mahasiswa</h1>
          <p className="text-gray-600">Kelola data mahasiswa asrama</p>
        </div>

        {/* Search dan Filter */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <Search
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset ke halaman pertama saat mencari
              }}
              placeholder="Cari mahasiswa..."
            />
          </div>
        </div>

        {/* Form Tambah Pelanggaran */}
        {showPelanggaranForm && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
              Tambah Pelanggaran
            </h2>
            <form onSubmit={handleSubmitPelanggaran} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input
                    type="text"
                    value={formData.nim}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.nama}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gedung</label>
                  <input
                    type="text"
                    value={formData.gedung}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No Kamar</label>
                  <input
                    type="text"
                    value={formData.noKamar}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelanggaran</label>
                  <input
                    type="date"
                    value={formData.tanggalPelanggaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalPelanggaran: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Pelanggaran</label>
                  <textarea
                    value={formData.keteranganPelanggaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        keteranganPelanggaran: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPelanggaranForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Simpan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table Section - Hidden on Mobile */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((mahasiswa) => (
                <tr key={mahasiswa.nim} className="odd:bg-[#FDE9CC] even:bg-white">
                  <td className="px-4 py-2 text-sm">{mahasiswa.nim}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.nama}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.prodi || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.gedung || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.noKamar || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.email || '-'}</td>
                  <td className="px-4 py-2 text-sm">{formatTanggal(mahasiswa.tanggalLahir)}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.tempatLahir || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.asal || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.status || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.golonganUKT || '-'}</td>
                  <td className="px-4 py-2 text-sm">{mahasiswa.jenisKelamin || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleTambahPelanggaranKasra(mahasiswa)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Tambah Pelanggaran
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View - Shown only on smaller screens */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentItems.map((mahasiswa) => (
            <div 
              key={mahasiswa.nim}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{mahasiswa.nama}</h3>
                  <p className="text-sm text-gray-500">NIM: {mahasiswa.nim}</p>
                </div>
                <button
                  onClick={() => handleTambahPelanggaranKasra(mahasiswa)}
                  className="p-2 text-orange-600 hover:text-orange-900 rounded-full hover:bg-orange-50"
                  aria-label="Tambah Pelanggaran"
                >
                  <ExclamationTriangleIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Gedung</p>
                  <p className="font-medium">{mahasiswa.gedung || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kamar</p>
                  <p className="font-medium">{mahasiswa.noKamar || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Prodi</p>
                  <p className="font-medium">{mahasiswa.prodi || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{mahasiswa.status || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Jenis Kelamin</p>
                  <p className="font-medium">{mahasiswa.jenisKelamin || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium truncate">{mahasiswa.email || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination with responsive margins */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default DataMahasiswaKasra;
