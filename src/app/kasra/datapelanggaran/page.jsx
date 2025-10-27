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
  getPendingPelanggaran
} from '@/utils/localStorage';
import PageHeading from '@/components/PageHeading';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import { useAuth } from '@/utils/AuthContext';

dayjs.extend(customParseFormat);

const TABLE_HEAD = [
  'NIM',
  'Nama',
  'Gedung',
  'No Kamar',
  'Tanggal Pelanggaran',
  'Keterangan Pelanggaran',
  'Status',
];

const DataPelanggaranKasra = () => {
  const { user } = useAuth();
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [pendingPelanggaranList, setPendingPelanggaranList] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPendingPage, setCurrentPendingPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('validated');

  // Saat komponen dimuat, ambil data pelanggaran global dan pending
  useEffect(() => {
    refreshData();
  }, []);

  // Fungsi untuk memperbarui data
  const refreshData = () => {
    console.log("Refreshing data...");
    const data = getAllPelanggaran();
    setPelanggaranList(data);
    
    const pendingData = getPendingPelanggaran();
    console.log("Pending data:", pendingData);
    setPendingPelanggaranList(pendingData);
  };

  const getFilteredData = () => {
    let filteredData = pelanggaranList || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        (item?.nim?.toLowerCase() || '').includes(query) ||
        (item?.nama?.toLowerCase() || '').includes(query) ||
        (item?.gedung?.toLowerCase() || '').includes(query) ||
        (item?.noKamar?.toLowerCase() || '').includes(query) ||
        (item?.keteranganPelanggaran?.toLowerCase() || '').includes(query)
      );
    }
    
    return filteredData;
  };

  const getFilteredPendingData = () => {
    let filteredData = pendingPelanggaranList || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        (item?.nim?.toLowerCase() || '').includes(query) ||
        (item?.nama?.toLowerCase() || '').includes(query) ||
        (item?.gedung?.toLowerCase() || '').includes(query) ||
        (item?.noKamar?.toLowerCase() || '').includes(query) ||
        (item?.keteranganPelanggaran?.toLowerCase() || '').includes(query)
      );
    }
    
    return filteredData;
  };

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);
  const totalPendingPages = Math.ceil(getFilteredPendingData().length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getFilteredData().slice(indexOfFirstItem, indexOfLastItem);

  // Dapatkan data pending untuk halaman saat ini
  const indexOfLastPendingItem = currentPendingPage * itemsPerPage;
  const indexOfFirstPendingItem = indexOfLastPendingItem - itemsPerPage;
  const currentPendingItems = getFilteredPendingData().slice(indexOfFirstPendingItem, indexOfLastPendingItem);

  // Format tanggal untuk tampilan
  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    return dayjs(tanggal).format('DD/MM/YYYY');
  };

  // Fungsi untuk memulai proses edit (modal akan muncul dengan data violation yang akan diedit)
  const handleEdit = (pelanggaran) => {
    setShowModal(pelanggaran);
  };

  // Saat menyimpan edit, update violation pada data personal mahasiswa yang bersangkutan
  const handleSaveEdit = () => {
    if (!showModal.tanggalPelanggaran || !showModal.keteranganPelanggaran) {
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
    refreshData();

    setShowModal(null);
    setErrorMessage('');
    toast.success('Data berhasil diubah');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeading title="Data Pelanggaran" />
      
      <div className="p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Pelanggaran</h1>
            <p className="text-gray-600">Lihat data pelanggaran mahasiswa asrama</p>
          </div>
          
          <div className="w-full sm:w-64">
            <Search
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                setCurrentPendingPage(1);
              }}
              placeholder="Cari pelanggaran..."
            />
          </div>
        </div>

        {/* Tab untuk memilih antara Pelanggaran Tervalidasi dan Pending */}
        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  currentTab === 'validated' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setCurrentTab('validated')}
              >
                Pelanggaran Tervalidasi
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  currentTab === 'pending' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setCurrentTab('pending')}
              >
                Menunggu Validasi
                {pendingPelanggaranList.length > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pendingPelanggaranList.length}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Tabel untuk data yang sudah tervalidasi */}
        {currentTab === 'validated' && (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {TABLE_HEAD.map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((pelanggaran) => (
                      <tr key={pelanggaran.id || `validated-${pelanggaran.nim}-${pelanggaran.tanggalPelanggaran}`} className="odd:bg-[#FDE9CC] even:bg-white">
                        <td className="px-4 py-3 text-sm">{pelanggaran.nim}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.nama}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.gedung || '-'}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.noKamar || '-'}</td>
                        <td className="px-4 py-3 text-sm">{formatTanggal(pelanggaran.tanggalPelanggaran)}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.keteranganPelanggaran || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Tervalidasi
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={TABLE_HEAD.length} className="px-4 py-3 text-sm text-center text-gray-500">
                        Tidak ada data pelanggaran tervalidasi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination untuk data tervalidasi */}
            {currentItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Tabel untuk data yang menunggu validasi */}
        {currentTab === 'pending' && (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {TABLE_HEAD.map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPendingItems.length > 0 ? (
                    currentPendingItems.map((pelanggaran) => (
                      <tr key={pelanggaran.id || `pending-${pelanggaran.nim}-${pelanggaran.tanggalPelanggaran}`} className="odd:bg-[#FDE9CC] even:bg-white">
                        <td className="px-4 py-3 text-sm">{pelanggaran.nim}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.nama}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.gedung || '-'}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.noKamar || '-'}</td>
                        <td className="px-4 py-3 text-sm">{formatTanggal(pelanggaran.tanggalPelanggaran)}</td>
                        <td className="px-4 py-3 text-sm">{pelanggaran.keteranganPelanggaran || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Menunggu Validasi
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={TABLE_HEAD.length + 1} className="px-4 py-3 text-sm text-center text-gray-500">
                        Tidak ada data pelanggaran yang menunggu validasi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination untuk data pending */}
            {currentPendingItems.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPendingPage}
                  totalPages={totalPendingPages}
                  onPageChange={setCurrentPendingPage}
                />
              </div>
            )}
          </>
        )}

        {/* Modal untuk edit pelanggaran */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Pelanggaran</h3>
                
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {errorMessage}
                  </div>
                )}
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                    <input
                      type="text"
                      value={showModal.nim}
                      disabled
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={showModal.nama}
                      disabled
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gedung</label>
                      <input
                        type="text"
                        value={showModal.gedung}
                        onChange={(e) => setShowModal({...showModal, gedung: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No Kamar</label>
                      <input
                        type="text"
                        value={showModal.noKamar}
                        onChange={(e) => setShowModal({...showModal, noKamar: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelanggaran</label>
                    <input
                      type="date"
                      value={showModal.tanggalPelanggaran}
                      onChange={(e) => setShowModal({...showModal, tanggalPelanggaran: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Pelanggaran</label>
                    <textarea
                      value={showModal.keteranganPelanggaran}
                      onChange={(e) => setShowModal({...showModal, keteranganPelanggaran: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(null);
                        setErrorMessage('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
};

export default DataPelanggaranKasra;
