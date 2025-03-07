import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { FiEdit, FiMoreVertical } from 'react-icons/fi';
import { ExclamationTriangleIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import SuratIzin from './SuratIzin';  
import SuratBebas from './SuratBebas'; // Import the new SuratBebas component

const ActionDropdown = ({ mahasiswa, handleEdit, handleTambahPelanggaran, handleDelete, showEdit = true, showAddViolation = true, showPrint = true, showDelete = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [alasanIzin, setAlasanIzin] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState(''); 
  const [showPreviewSuratBebas, setShowPreviewSuratBebas] = useState(false); // Added state for Surat Bebas preview

  const pdfDownloadLinkRef = useRef();

  if (!mahasiswa) {
    return null; // Prevent rendering if mahasiswa is undefined or null
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);  // Close dropdown when scrolling
      }
    };

    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false);  // Close dropdown on resize to avoid it being out of view
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Fungsi untuk menangani perubahan input pada textarea
  const handleAlasanChange = (e) => {
    setAlasanIzin(e.target.value); // Update state dengan input alasan izin
  };
  const handleTanggalMulaiChange = (e) => {
    setTanggalMulai(e.target.value); // Update tanggal mulai izin
  };

  // Fungsi untuk menangani perubahan tanggal selesai izin
  const handleTanggalSelesaiChange = (e) => {
    setTanggalSelesai(e.target.value); // Update tanggal selesai izin
  };

  const handleFormSubmit = () => {
    setShowForm(false); // Menutup form setelah submit
  };

  // Handle printing Surat Bebas Asrama
  const handlePrintSuratBebas = () => {
    setShowPreviewSuratBebas(true); // Show the preview modal
    setIsOpen(false); // Close the dropdown
  };

  // Ensure dropdown position is correctly calculated after the component is rendered
  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY;  // Calculate dropdown's top position
      let left = rect.left + window.scrollX;   // Calculate dropdown's left position

      // Ensure dropdown does not go beyond the right side of the screen
      const dropdownWidth = 200; // Estimated dropdown width (adjust as needed)
      const viewportWidth = window.innerWidth;

      // Check if the dropdown goes out of bounds and adjust position
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 10;  // 10px margin from the right
      }

      // Ensure dropdown does not go beyond the bottom of the screen
      const dropdownHeight = 250; // Estimated dropdown height (adjust as needed)
      const viewportHeight = window.innerHeight;

      if (top + dropdownHeight > viewportHeight) {
        setDropdownPosition({ top: rect.top + window.scrollY - dropdownHeight, left });
      } else {
        setDropdownPosition({ top, left });
      }
    }
  }, [isOpen]);

  return (
    <td className="px-4 py-2 text-sm">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleOpenDropdown}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FiMoreVertical className="h-5 w-5" />
        </button>

        {isOpen && (
          <div
            className="fixed mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              maxHeight: '400px',  // Optional: limits the dropdown's height
              overflowY: 'auto',   // Optional: allows scrolling if content is too long
            }}
          >
            {showEdit && (
              <button
                onClick={() => {
                  handleEdit(mahasiswa.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
              >
                <FiEdit className="h-5 w-5" />
                <span>Edit Data</span>
              </button>
            )}

            {showAddViolation && (
              <button
                onClick={() => {
                  handleTambahPelanggaran(mahasiswa);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Tambah Pelanggaran</span>
              </button>
            )}

            {showPrint && (
              <button
                onClick={() => setShowForm(true)} // Menampilkan form untuk catatan
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Cetak Surat Izin</span>
              </button>
            )}

            <button
              onClick={handlePrintSuratBebas} // Use the new handler for Surat Bebas
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Cetak Surat Bebas</span>
            </button>

            {showDelete && (
              <button
                onClick={() => {
                  handleDelete(mahasiswa.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 text-red-600"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Form for Surat Izin */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Tambah Keterangan Izin</h2>
            <textarea
              value={alasanIzin}
              onChange={handleAlasanChange} // Memanggil handleAlasanChange saat ada perubahan input
              placeholder="Masukkan alasan izin..."
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            ></textarea>
            <input
              type="date"
              value={tanggalMulai}
              onChange={handleTanggalMulaiChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />

            <input
              type="date"
              value={tanggalSelesai}
              onChange={handleTanggalSelesaiChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={handleFormSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowForm(false)} // Menutup form
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Surat Bebas Preview and Download */}
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {({ loading }) => loading ? "Menyiapkan..." : "Download PDF"}
              </PDFDownloadLink>
              <button
                onClick={() => setShowPreviewSuratBebas(false)} 
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setelah form submit, cetak surat dengan catatan yang dimasukkan */}
      {alasanIzin && (
        <PDFDownloadLink
          document={<SuratIzin mahasiswa={mahasiswa} alasanIzin={alasanIzin} />}
          fileName={`Surat_Izin_${mahasiswa.nim}.pdf`}
        >{({ loading }) =>
            loading ? (
              <button className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Cetak Surat Izin</span>
              </button>
            ) : (
              <button className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Cetak Surat Izin</span>
              </button>
            )
          }
        </PDFDownloadLink>
      )}
    </td>
  );
};

export default ActionDropdown;