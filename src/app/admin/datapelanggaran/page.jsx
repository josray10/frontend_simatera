'use client';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAllPelanggaran,
  getDataPelanggaranMahasiswa,
  saveDataPelanggaranMahasiswa,
} from '@/utils/localStorage';
import PageHeading from '@/components/PageHeading';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
dayjs.extend(customParseFormat);

const TABLE_HEAD = [
  'NIM',
  'Nama',
  'Gedung',
  'No Kamar',
  'Tanggal Pelanggaran',
  'Keterangan Pelanggaran',
  'Aksi',
];

const DataPelanggaranAdmin = () => {
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

  // Saat komponen dimuat, ambil data pelanggaran global (agregat dari semua mahasiswa)
  useEffect(() => {
    const data = getAllPelanggaran();
    setPelanggaranList(data);
  }, []);

  // Filter data berdasarkan pencarian
  const getFilteredData = () => {
    let filteredData = pelanggaranList || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        (item?.nim?.toLowerCase() || '').includes(query) ||
        (item?.nama?.toLowerCase() || '').includes(query) ||
        (item?.gedung?.toLowerCase() || '').includes(query) ||
        (item?.noKamar?.toLowerCase() || '').includes(query) ||
        (item?.keterangan?.toLowerCase() || '').includes(query)
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

  // Fungsi untuk memulai proses edit (modal akan muncul dengan data violation yang akan diedit)
  const handleEdit = (pelanggaran) => {
    setShowModal(pelanggaran);
  };

  // Saat menyimpan edit, update violation pada data personal mahasiswa yang bersangkutan
  const handleSaveEdit = () => {
    if (!showModal.tanggalPelanggaran || !showModal.keterangan) {
      setErrorMessage('Tanggal dan Keterangan harus diisi!');
      return;
    }

    // Dapatkan NIM dari violation yang diedit
    const violationNim = showModal.nim;
    // Ambil data pelanggaran mahasiswa tersebut dari localStorage
    const studentViolations = getDataPelanggaranMahasiswa(violationNim);
    // Perbarui array pelanggaran untuk mahasiswa tersebut dengan menggantikan violation yang diedit
    const updatedStudentViolations = studentViolations.map((v) =>
      v.id === showModal.id ? { ...showModal } : v
    );
    // Simpan kembali data pelanggaran untuk mahasiswa tersebut
    saveDataPelanggaranMahasiswa(violationNim, updatedStudentViolations);

    // Untuk tampilan admin, kita perlu mengagregasi ulang data dari seluruh mahasiswa
    const updatedGlobalViolations = getAllPelanggaran();
    setPelanggaranList(updatedGlobalViolations);

    setShowModal(null);
    setErrorMessage('');
    toast.success('Data berhasil diubah');
  };

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Pelanggaran" />
        <div className="flex-1 p-6">
          {/* Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-64">
              <Search
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset ke halaman pertama saat mencari
                }}
                placeholder="Cari pelanggaran..."
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((pelanggaran) => (
                  <tr
                    key={`${pelanggaran.nim}_${pelanggaran.tanggalPelanggaran}`}
                    className="odd:bg-[#FDE9CC] even:bg-white text-center"
                  >
                    <td className="px-4 py-2 text-sm">{pelanggaran.nim}</td>
                    <td className="px-4 py-2 text-sm">{pelanggaran.nama}</td>
                    <td className="px-4 py-2 text-sm">{pelanggaran.gedung}</td>
                    <td className="px-4 py-2 text-sm">{pelanggaran.noKamar}</td>
                    <td className="px-4 py-2 text-sm">
                      {dayjs(pelanggaran.tanggalPelanggaran, [
                        'DD/MM/YYYY',
                        'YYYY-MM-DD',
                      ]).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {pelanggaran.keterangan}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => handleEdit(pelanggaran)}
                        className="p-1 hover:text-blue-600"
                        aria-label="Edit Pelanggaran"
                      >
                        <FiEdit size={20} />
                      </button>
                    </td>
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

          {showModal && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              onClick={() => setShowModal(null)}
            >
              <div
                className="bg-white p-5 rounded shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">
                  Edit Data Pelanggaran
                </h2>
                <input
                  type="date"
                  value={showModal.tanggalPelanggaran}
                  onChange={(e) =>
                    setShowModal((prev) => ({
                      ...prev,
                      tanggalPelanggaran: e.target.value,
                    }))
                  }
                  className="block w-full border p-2 mb-2"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <input
                  type="text"
                  value={showModal.keterangan}
                  onChange={(e) =>
                    setShowModal((prev) => ({
                      ...prev,
                      keterangan: e.target.value,
                    }))
                  }
                  className="block w-full border p-2 mb-2"
                  required
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default DataPelanggaranAdmin;
