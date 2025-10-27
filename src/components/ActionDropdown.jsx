import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { FiEdit, FiMoreVertical } from 'react-icons/fi';
import { ExclamationTriangleIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import SuratIzin from './SuratIzin';  
import SuratBebas from './SuratBebas'; // Import the new SuratBebas component

const ActionDropdown = ({ mahasiswa, handleEdit, handleTambahPelanggaran, handleDelete, showEdit = false, showAddViolation = false, showPrint = false, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [alasanIzin, setAlasanIzin] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [showPreviewSuratBebas, setShowPreviewSuratBebas] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonClasses = isMobile
    ? "p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
    : "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900";

  const dropdownClasses = isMobile
    ? "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    : "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5";

  const handlePrintSuratIzin = () => {
    setShowForm(true);
    setIsOpen(false);
  };

  const handlePrintSuratBebas = () => {
    setShowPreviewSuratBebas(true);
    setIsOpen(false);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
  };

  const Wrapper = isMobile ? 'div' : 'td';

  return (
    <Wrapper className={isMobile ? "relative" : "px-4 py-2 text-sm"}>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <FiMoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className={dropdownClasses}>
            <div className="py-1" role="menu">
              {showEdit && (
                <button
                  onClick={() => {
                    handleEdit(mahasiswa.id);
                    setIsOpen(false);
                  }}
                  className={buttonClasses}
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <FiEdit className="mr-2 h-4 w-4" />
                    Edit
                  </div>
                </button>
              )}

              {showAddViolation && (
                <button
                  onClick={() => {
                    handleTambahPelanggaran(mahasiswa);
                    setIsOpen(false);
                  }}
                  className={buttonClasses}
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
                    Tambah Pelanggaran
                  </div>
                </button>
              )}

              {showPrint && (
                <>
                  <button
                    onClick={handlePrintSuratIzin}
                    className={buttonClasses}
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className="mr-2 h-4 w-4" />
                      Cetak Surat Izin
                    </div>
                  </button>

                  <button
                    onClick={handlePrintSuratBebas}
                    className={buttonClasses}
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className="mr-2 h-4 w-4" />
                      Cetak Surat Bebas
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  handleDelete(mahasiswa.id);
                  setIsOpen(false);
                }}
                className={`${buttonClasses} text-red-600 hover:text-red-700 hover:bg-red-50`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Hapus
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Surat Izin */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Form Surat Izin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Izin
                </label>
                <textarea
                  value={alasanIzin}
                  onChange={(e) => setAlasanIzin(e.target.value)}
                  placeholder="Masukkan alasan izin..."
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <PDFDownloadLink
                document={
                  <SuratIzin 
                    mahasiswa={mahasiswa} 
                    catatan={alasanIzin}
                    tanggalMulai={tanggalMulai}
                    tanggalSelesai={tanggalSelesai}
                  />
                }
                fileName={`Surat_Izin_${mahasiswa.nim}.pdf`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {({ loading }) => loading ? "Menyiapkan..." : "Download PDF"}
              </PDFDownloadLink>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Surat Bebas */}
      {showPreviewSuratBebas && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-4/5 h-4/5 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Preview Surat Bebas Asrama</h2>
            
            <div className="flex-1 mb-4">
              <PDFViewer width="100%" height="100%" className="border border-gray-300">
                <SuratBebas 
                  mahasiswa={mahasiswa}
                  namaPembina="Dr. Ahmad Syauqi, M.T."
                  nipPembina="NIP. 198507302010121002"
                />
              </PDFViewer>
            </div>
            
            <div className="flex justify-end gap-4">
              <PDFDownloadLink
                document={
                  <SuratBebas 
                    mahasiswa={mahasiswa}
                    namaPembina="Dr. Ahmad Syauqi, M.T."
                    nipPembina="NIP. 198507302010121002"
                  />
                }
                fileName={`Surat_Bebas_Asrama_${mahasiswa.nim}.pdf`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {({ loading }) => loading ? "Menyiapkan..." : "Download PDF"}
              </PDFDownloadLink>
              <button
                onClick={() => setShowPreviewSuratBebas(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ActionDropdown;