import { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';

import {
  getDataKasra,
  saveDataKasra,
  clearDataKasra,
} from '@/utils/localStorage';

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
  'Aksi',
];

// Data dummy kasra
const dummyData = [
  {
    id: 1,
    nim: '21012345',
    nama: 'John Doe',
    prodi: 'Teknik Informatika',
    gedung: 'TB1',
    noKamar: 'A101',
    email: 'john@itera.ac.id',
    tanggalLahir: '2000-01-01',
    tempatLahir: 'Jakarta',
    asal: 'Jakarta',
    status: 'Aktif Tinggal',
    golonganUKT: 3,
    password: 'kasra123',
    role: 'kasra',
  },
];

const DataKasra = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [dataKasra, setDataKasra] = useState(() => {
    const savedData = getDataKasra();
    return savedData.length > 0 ? savedData : dummyData;
  });
  const [dataEditKasra, setDataEditKasra] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Pilih file...');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

  const initialFormState = {
    nim: '',
    nama: '',
    prodi: '',
    gedung: 'TB1',
    noKamar: '',
    email: '',
    tempatLahir: '',
    tanggalLahir: '',
    asal: '',
    golonganUKT: 1,
    status: 'Aktif Tinggal',
    password: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter data berdasarkan pencarian
  const filteredData = dataKasra.filter((kasra) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      kasra.nim.toLowerCase().includes(searchLower) ||
      kasra.nama.toLowerCase().includes(searchLower) ||
      kasra.prodi.toLowerCase().includes(searchLower) ||
      kasra.gedung.toLowerCase().includes(searchLower) ||
      kasra.noKamar.toLowerCase().includes(searchLower) ||
      kasra.email.toLowerCase().includes(searchLower) ||
      kasra.tempatLahir.toLowerCase().includes(searchLower) ||
      kasra.asal.toLowerCase().includes(searchLower) ||
      kasra.status.toLowerCase().includes(searchLower)
    );
  });

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setMounted(true);
    const savedData = getDataKasra();
    setDataKasra(savedData.length > 0 ? savedData : dummyData);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveDataKasra(dataKasra);
    }
  }, [dataKasra, mounted]);

  useEffect(() => {
    saveDataKasra(dataKasra);
  }, [dataKasra]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formData.nim || !formData.nama || !formData.email) {
      setErrorMessage('NIM, Nama, dan Email wajib diisi!');
      return;
    }
    setIsLoading(true);
    const idd = toast.loading('Create Data Kasra...');

    const newKasra = {
      ...formData,
      id: Date.now(),
      tanggalLahir:
        formData.tanggalLahir || new Date().toISOString().split('T')[0],
      password: formData.password || 'kasra123',
      role: 'kasra',
    };

    // Update state dan otomatis tersimpan ke localStorage via useEffect
    const updatedData = [...dataKasra, newKasra];
    setDataKasra(updatedData);
    // Simpan ke localStorage
    saveDataKasra(updatedData);
    toast.update(idd, {
      render: 'Data berhasil ditambahkan',
      type: 'success',
      isLoading: false,
      autoClose: 1000,
    });
    setFormData(initialFormState);
    setShowForm(false);
  };

  const handleEdit = (id) => {
    const kasra = dataKasra.find((m) => m.id === id);
    setDataEditKasra({ ...kasra });
    setShowModal(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    // Update data di state
    if (
      !dataEditKasra.nim ||
      !dataEditKasra.nama ||
      !dataEditKasra.email
    ) {
      setEditErrorMessage('NIM, Nama, dan Email wajib diisi!');
      return;
    }
    setIsLoading(false);
    const idd = toast.loading('Edit Data Mahasiswa...');
    setDataKasra((prev) =>
      prev.map((item) =>
        item.id === dataEditKasra.id ? { ...dataEditKasra } : item
      )
    );

    toast.update(idd, {
      render: 'Data berhasil diubah',
      type: 'success',
      isLoading: false,
      autoClose: 2000,
    });
    setEditErrorMessage('');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Filter data dan update state
        const filteredData = dataKasra.filter((m) => m.id !== id);
        setDataKasra(filteredData);
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      }
    });
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Pilih file terlebih dahulu!');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === 'csv' || fileExtension === 'xlsx') {
      const reader = new FileReader();

      reader.onload = (event) => {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json(sheet);

        const formatDate = (excelDate) => {
          if (typeof excelDate === 'number') {
            // Jika tanggal berupa angka serial Excel, konversi ke Date
            return dayjs(new Date((excelDate - 25569) * 86400 * 1000)).format(
              'DD/MM/YYYY'
            );
          } else if (typeof excelDate === 'string') {
            // Deteksi format dan konversi dengan benar
            const parsedDate = dayjs(
              excelDate,
              ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'],
              true
            );
            if (parsedDate.isValid()) {
              return parsedDate.format('DD/MM/YYYY');
            } else {
              console.warn('Format tanggal tidak dikenali:', excelDate);
              return 'Invalid Date';
            }
          }
          return 'Invalid Date';
        };

        // Proses data
        data = data.map((item) => ({
          id: Date.now() + Math.random(), // ID unik
          nim: String(item.NIM),
          nama: item.Nama,
          prodi: item.Prodi,
          gedung: item.Gedung,
          noKamar: item['No Kamar'],
          email: item.Email,
          tempatLahir: item['Tempat Lahir'],
          tanggalLahir: formatDate(item['Tanggal Lahir']), // Pertahankan format DD/MM/YYYY
          asal: item.Asal,
          status: item.Status,
          golonganUKT: item['Golongan UKT'],
          password: item.NIM || 'kasra123',
        }));

        console.log('Data setelah format:', data);

        // Gabungkan data baru dengan data yang sudah ada
        setDataKasra((prevState) => [...prevState, ...data]);
      };

      reader.readAsBinaryString(file);
    } else {
      alert('Hanya file CSV atau XLSX yang diperbolehkan.');
    }
  };

  if (!mounted) {
    return null;
  }
  return (
    <>
      <ToastContainer />
      {showForm ? (
        <div className="flex flex-col justify-center items-center mt-5">
          <h1 className="text-3xl font-bold mb-5">Form Data Kasra</h1>
          <div className="flex flex-col bg-white p-10 rounded-xl divide-y w-full max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold mb-5">Tambah Kasra Baru</h1>
              {errorMessage && (
                <p className="text-red-500 font-semibold mb-3">
                  {errorMessage}
                </p>
              )}
            </div>
            <form
              onSubmit={handleSubmitAdd}
              className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* NIM */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  NIM
                </label>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Nama */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Prodi */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Program Studi
                </label>
                <input
                  type="text"
                  name="prodi"
                  value={formData.prodi}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                />
              </div>

              {/* Gedung */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Gedung
                </label>
                <select
                  name="gedung"
                  value={formData.gedung}
                  onChange={handleInputChange}
                  className="select select-bordered w-full text-sm md:text-base"
                >
                  {['TB1', 'TB2', 'TB3', 'TB4', 'TB5'].map((gedung) => (
                    <option key={gedung} value={gedung}>
                      {gedung}
                    </option>
                  ))}
                </select>
              </div>

              {/* No Kamar */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  name="noKamar"
                  value={formData.noKamar}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Tempat Lahir */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Tanggal Lahir */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Asal */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Asal
                </label>
                <input
                  type="text"
                  name="asal"
                  value={formData.asal}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Golongan UKT */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Golongan UKT
                </label>
                <select
                  name="golonganUKT"
                  value={formData.golonganUKT}
                  onChange={handleInputChange}
                  className="select select-bordered w-full text-sm md:text-base"
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map(
                    (golonganUKT) => (
                      <option key={golonganUKT} value={golonganUKT}>
                        {golonganUKT}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Status Tinggal
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full text-sm md:text-base"
                >
                  {['Aktif Tinggal', 'Checkout'].map((statusTinggal) => (
                    <option key={statusTinggal} value={statusTinggal}>
                      {statusTinggal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="block uppercase text-gray-700 text-xs font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input input-bordered w-full text-sm md:text-base"
                  required
                />
              </div>

              {/* Tombol */}
              <div className="col-span-2 flex justify-center gap-4 mt-6">
                <button
                  type="submit"
                  className="btn bg-orange-500 text-white hover:bg-orange-600"
                >
                  Tambah Kasra
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Data Kasra</h1>
            <div className="w-full md:w-auto flex flex-col-reverse md:flex-row gap-3">
              {/* Search */}
              <div className="w-full md:w-64">
                <Search
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset ke halaman pertama saat mencari
                  }}
                  placeholder="Cari kasra..."
                />
              </div>

              {/* Upload Section */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleFileChange}
                  className="border p-2 rounded w-full md:w-48 lg:w-64 text-sm"
                />
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                >
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span className="text-sm md:text-base">Upload</span>
                </button>
              </div>

              {/* Tambah Buttons */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  className="btn bg-[#FDE9CC] hover:bg-[#E0924A] text-gray-500 hover:text-white flex items-center justify-center gap-2 p-2 md:p-3 rounded text-sm md:text-base"
                  onClick={() => setShowForm(true)}
                >
                  <PlusIcon className="h-5 w-5 text-green-500" />
                  <span>Tambah Kasra</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
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
                {currentItems.map((kasra) => (
                <tr key={kasra.id} className="odd:bg-[#FDE9CC] even:bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.nim}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.nama}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.prodi}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.gedung}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.noKamar}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.email}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.tempatLahir}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">
                    {dayjs(kasra.tanggalLahir, [
                      'DD/MM/YYYY',
                      'YYYY-MM-DD',
                    ]).format('DD/MM/YYYY')}
                  </td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.asal}</td>
                    <td className="px-4 py-2 text-xs md:text-sm">{kasra.status}</td>
                    <td className="px-4 py-2 text-xs md:text-sm text-center">{kasra.golonganUKT}</td>

                    {/* Action */}
                    <td className="px-4 py-2 text-xs md:text-sm">
                      <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(kasra.id)}
                          className="p-1 hover:text-blue-600"
                      >
                          <FiEdit className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(kasra.id)}
                          className="p-1 hover:text-red-600"
                      >
                          <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    )}

    {/* Modal Edit */}
    {showModal ? (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl px-4">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex flex-col justify-center items-start px-5 pt-5 pb-2 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-2xl md:text-3xl font-bold pb-2">
                  Form Edit Data Kasra
                </h3>
                <p className="text-sm md:text-base">Update Data Kasra dengan Teliti</p>
                <p
                  className={`${editErrorMessage ? 'py-3' : ''} text-red-500 font-semibold text-sm md:text-base`}
                >
                  {editErrorMessage}
                </p>
              </div>
              <div className="relative p-4 md:p-6 flex-auto">
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={(e) => handleSubmitEdit(e, dataEditKasra.id)}
                >
                  {/* Form fields with responsive classes */}
                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      NIM
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.nim || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          nim: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Nama
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.nama || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          nama: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Prodi
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.prodi || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          prodi: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Gedung
                    </label>
                    <select
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.gedung || 'TB1'}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          gedung: e.target.value,
                        })
                      }
                    >
                      {['TB1', 'TB2', 'TB3', 'TB4', 'TB5'].map((gedung) => (
                        <option key={gedung} value={gedung}>
                          {gedung}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      No Kamar
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.noKamar || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          noKamar: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Email
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      type="email"
                      value={dataEditKasra.email || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Tempat Lahir
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.tempatLahir || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          tempatLahir: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Tanggal Lahir
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      type="date"
                      value={dataEditKasra.tanggalLahir || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          tanggalLahir: e.target.value,
                        })
                      }
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Asal
                    </label>
                    <input
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.asal || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          asal: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Golongan UKT
                    </label>
                    <select
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.golonganUKT || 1}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          golonganUKT: e.target.value,
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((golongan) => (
                        <option key={golongan} value={golongan}>
                          Golongan {golongan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full px-3">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                      Status Tinggal
                    </label>
                    <select
                      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-2 md:py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-sm md:text-base"
                      value={dataEditKasra.status || ''}
                      onChange={(e) =>
                        setDataEditKasra({
                          ...dataEditKasra,
                          status: e.target.value,
                        })
                      }
                    >
                      {['Aktif Tinggal', 'Checkout'].map(
                        (statusTinggal) => (
                          <option key={statusTinggal} value={statusTinggal}>
                            {statusTinggal}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Tombol */}
                  <div className="col-span-2 flex justify-center gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    ) : null}
  </>
);
}

export default DataKasra;
