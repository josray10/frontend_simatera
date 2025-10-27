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
  'Jenis Kelamin',
  'Aksi',
];


const DataKasra = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [dataKasra, setDataKasra] = useState([]);
  const [dataEditKasra, setDataEditKasra] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Pilih file...');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);

  const initialFormState = {
    nim: '',
    nama: '',
    prodi: '',
    gedung: '',
    noKamar: '',
    email: '',
    tempatLahir: '',
    tanggalLahir: '',
    asal: '',
    golonganUKT: 1,
    status: 'Aktif Tinggal',
    password: '',
    jenisKelamin: '',
    lantaiKamar: '',
    nomorKamar: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter data berdasarkan pencarian
  const filteredData = Array.isArray(dataKasra) 
    ? dataKasra.filter((kasra) => {
        if (!kasra) return false;
        const searchLower = searchQuery.toLowerCase();
        return (
          (kasra.nim && kasra.nim.toLowerCase().includes(searchLower)) ||
          (kasra.nama && kasra.nama.toLowerCase().includes(searchLower)) ||
          (kasra.prodi && kasra.prodi.toLowerCase().includes(searchLower)) ||
          (kasra.gedung && kasra.gedung.toLowerCase().includes(searchLower)) ||
          (kasra.noKamar && kasra.noKamar.toLowerCase().includes(searchLower)) ||
          (kasra.email && kasra.email.toLowerCase().includes(searchLower)) ||
          (kasra.tempatLahir && kasra.tempatLahir.toLowerCase().includes(searchLower)) ||
          (kasra.asal && kasra.asal.toLowerCase().includes(searchLower)) ||
          (kasra.status && kasra.status.toLowerCase().includes(searchLower))
        );
      })
    : [];

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Ambil data kasra dari localStorage saat komponen dimuat
  useEffect(() => {
    setMounted(true);
    try {
      const storedData = getDataKasra();
      console.log('Loaded kasra data:', storedData);
      setDataKasra(storedData);
    } catch (error) {
      console.error('Error loading kasra data:', error);
      toast.error('Terjadi kesalahan saat memuat data kasra');
    }
  }, []);

  // Simpan data kasra ke localStorage saat data berubah
  useEffect(() => {
    if (mounted) {
      try {
      saveDataKasra(dataKasra);
        console.log('Saved kasra data to localStorage:', dataKasra);
      } catch (error) {
        console.error('Error saving kasra data:', error);
      }
    }
  }, [dataKasra, mounted]);

  // Ambil data kamar yang tersedia
  useEffect(() => {
    const dormRooms = JSON.parse(localStorage.getItem('dormRooms') || '[]');
    setAvailableRooms(dormRooms);
  }, []);

  const findAvailableRoom = (jenisKelamin) => {
    // Gedung untuk laki-laki: TB2 dan TB3
    // Gedung untuk perempuan: TB1, TB4, dan TB5
    const gedungLakiLaki = ['TB2', 'TB3'];
    const gedungPerempuan = ['TB1', 'TB4', 'TB5'];
    
    // Filter rooms based on gender
    const isLakiLaki = jenisKelamin && jenisKelamin.toLowerCase() === 'laki-laki';
    const gedungSesuaiGender = availableRooms.filter(kamar => {
      return isLakiLaki ?
        gedungLakiLaki.includes(kamar.gedung) :
        gedungPerempuan.includes(kamar.gedung);
    });
    
    console.log('Gedung sesuai gender:', gedungSesuaiGender);
    
    // Filter rooms that are not full
    const availableRoomsForGender = gedungSesuaiGender.filter(kamar => {
      // Periksa berbagai kemungkinan properti untuk status kamar
      const kapasitas = kamar.kapasitas || 4; // Default kapasitas jika tidak ada
      const jumlahPenghuni = kamar.jumlahPenghuni || kamar.terisi || 0;
      
      return jumlahPenghuni < kapasitas;
    });
    
    console.log('Available rooms for gender:', availableRoomsForGender);
    
    if (availableRoomsForGender.length === 0) {
      console.log('Tidak ada kamar tersedia untuk gender:', jenisKelamin);
      return null;
    }
    
    // Pilih kamar dengan jumlah penghuni paling sedikit
    availableRoomsForGender.sort((a, b) => {
      const penghuniA = a.jumlahPenghuni || a.terisi || 0;
      const penghuniB = b.jumlahPenghuni || b.terisi || 0;
      return penghuniA - penghuniB;
    });
    
    const selectedRoom = availableRoomsForGender[0];
    console.log('Selected room:', selectedRoom);
    
    return {
      gedung: selectedRoom.gedung,
      noKamar: selectedRoom.noKamar || selectedRoom.nomorKamar || selectedRoom.no_kamar
    };
  };

  const validateRoomChange = (newGedung, newNoKamar, jenisKelamin) => {
    console.log('Validating room change:', { newGedung, newNoKamar, jenisKelamin });
    
    // Validasi gedung berdasarkan jenis kelamin
    const gedungLakiLaki = ['TB2', 'TB3'];
    const gedungPerempuan = ['TB1', 'TB4', 'TB5'];
    
    if (jenisKelamin === 'Laki-laki' && !gedungLakiLaki.includes(newGedung)) {
      return {
        valid: false,
        message: `Gedung tidak sesuai dengan jenis kelamin Laki-laki. Pilih gedung: ${gedungLakiLaki.join(', ')}`
      };
    }
    
    if (jenisKelamin === 'Perempuan' && !gedungPerempuan.includes(newGedung)) {
      return {
        valid: false,
        message: `Gedung tidak sesuai dengan jenis kelamin Perempuan. Pilih gedung: ${gedungPerempuan.join(', ')}`
      };
    }
    
    // Validasi kapasitas kamar
    try {
      const dormRooms = JSON.parse(localStorage.getItem('dormRooms') || '[]');
      console.log('Dorm rooms:', dormRooms);
      
      // Cari kamar yang sesuai - periksa berbagai kemungkinan properti
      const targetRoom = dormRooms.find(room => {
        // Periksa berbagai kemungkinan properti untuk gedung dan nomor kamar
        const gedungMatch = room.gedung === newGedung;
        const noKamarMatch = 
          room.noKamar === newNoKamar || 
          room.nomorKamar === newNoKamar || 
          room.no_kamar === newNoKamar;
        
        return gedungMatch && noKamarMatch;
      });
      
      console.log('Target room:', targetRoom);
      
      // Jika kamar tidak ditemukan, kembalikan valid true saja
      // Ini untuk mengatasi masalah ketidaksesuaian struktur data
      if (!targetRoom) {
        console.log(`Kamar ${newGedung}-${newNoKamar} tidak ditemukan dalam data, tetapi validasi dilanjutkan`);
        return { valid: true };
      }
      
      // Cek apakah kamar sudah penuh (jika informasi kapasitas tersedia)
      if (targetRoom.kapasitas && targetRoom.jumlahPenghuni >= targetRoom.kapasitas) {
        return {
          valid: false,
          message: `Kamar ${newGedung}-${newNoKamar} sudah penuh (${targetRoom.jumlahPenghuni}/${targetRoom.kapasitas})`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Error validating room:', error);
      // Jika terjadi error, tetap lanjutkan validasi
      console.log('Terjadi kesalahan saat validasi kamar, tetapi validasi dilanjutkan');
      return { valid: true };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nim') {
      setFormData({
        ...formData,
        [name]: value,
        id: value, // Set ID sama dengan NIM
        password: value || 'kasra123', // Set default password ke NIM
      });
    } else if (name === 'jenisKelamin') {
      setFormData({
        ...formData,
        [name]: value,
        gedung: '',
        noKamar: ''
      });
    } else {
    setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nim || !formData.nama || !formData.jenisKelamin) {
      setErrorMessage('NIM, Nama, dan Jenis Kelamin harus diisi');
      return;
    }

    // Jika gedung dan noKamar tidak diisi, cari kamar yang tersedia
    if (!formData.gedung || !formData.noKamar) {
      const availableRoom = findAvailableRoom(formData.jenisKelamin);
      
      if (!availableRoom) {
        setErrorMessage('Tidak ada kamar tersedia untuk jenis kelamin ' + formData.jenisKelamin);
        return;
      }
      
      // Update formData dengan kamar yang tersedia
      formData.gedung = availableRoom.gedung;
      formData.noKamar = availableRoom.noKamar;
      console.log('Assigned room:', formData.gedung, formData.noKamar);
    }

    // Validasi NIM unik di data kasra
    if (!Array.isArray(dataKasra)) {
      console.error('Data Kasra bukan array:', dataKasra);
      setErrorMessage('Terjadi kesalahan saat validasi data');
      return;
    }
    
    const existingKasra = dataKasra.find(kasra => kasra && kasra.nim === formData.nim);
    console.log('Existing Kasra check:', { nim: formData.nim, existingKasra });
    
    if (existingKasra) {
      setErrorMessage('NIM sudah terdaftar sebagai kasra');
      return;
    }
    
    // Validasi NIM tidak ada di data mahasiswa
    try {
      // Dapatkan data mahasiswa dari localStorage
      const dataMahasiswaRaw = localStorage.getItem('mahasiswaData');
      console.log('Raw Mahasiswa data:', dataMahasiswaRaw);
      
      if (dataMahasiswaRaw) {
        let dataMahasiswa;
        try {
          dataMahasiswa = JSON.parse(dataMahasiswaRaw);
        } catch (error) {
          console.error('Error parsing mahasiswa data:', error);
          setErrorMessage('Terjadi kesalahan saat memproses data mahasiswa');
          return;
        }
        
        // Pastikan dataMahasiswa adalah array
        if (!Array.isArray(dataMahasiswa)) {
          console.error('Data Mahasiswa bukan array:', dataMahasiswa);
          setErrorMessage('Terjadi kesalahan saat validasi data');
          return;
        }
        
        const existingMahasiswa = dataMahasiswa.find(mahasiswa => 
          mahasiswa && mahasiswa.nim && mahasiswa.nim.toString() === formData.nim.toString()
        );
        console.log('Existing Mahasiswa check:', { nim: formData.nim, existingMahasiswa });
        
        if (existingMahasiswa) {
          setErrorMessage('NIM sudah terdaftar sebagai mahasiswa. Tidak bisa mendaftar sebagai kasra dengan NIM yang sama.');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking mahasiswa data:', error);
      setErrorMessage('Terjadi kesalahan saat validasi data mahasiswa');
      return;
    }

    // Validasi kamar
    try {
      const validationResult = validateRoomChange(formData.gedung, formData.noKamar, formData.jenisKelamin);
      if (!validationResult.valid) {
        setErrorMessage(validationResult.message);
        return;
      }
    } catch (error) {
      console.error('Error validating room:', error);
      setErrorMessage('Terjadi kesalahan saat validasi kamar');
      return;
    }
    
    // Tambahkan data kasra baru dengan status default "Aktif Tinggal"
    const newData = {
      ...formData,
      id: formData.nim, // ID sama dengan NIM
      status: 'Aktif Tinggal',
      createdAt: new Date().toISOString(),
      role: 'kasra', // Tambahkan role kasra
      email: formData.email || `${formData.nim}@student.itera.ac.id`, // Pastikan email ada
      password: formData.password || formData.nim || 'kasra123' // Pastikan password ada
    };
    
    // Update state dan localStorage
    const updatedDataKasra = Array.isArray(dataKasra) ? [...dataKasra, newData] : [newData];
    
    // Simpan ke localStorage terlebih dahulu
    const saveSuccess = saveDataKasra(updatedDataKasra);
    
    if (saveSuccess) {
      // Update state setelah berhasil menyimpan ke localStorage
      setDataKasra(updatedDataKasra);
      
      // Reset form
      setFormData({
        nim: '',
        nama: '',
        jenisKelamin: '',
        prodi: '',
        gedung: '',
        noKamar: '',
        email: '',
        tanggalLahir: '',
        tempatLahir: '',
        asal: '',
        golonganUKT: '',
      });
      
    setShowForm(false);
      setErrorMessage('');
      toast.success('Data kasra berhasil ditambahkan');
    } else {
      toast.error('Gagal menyimpan data kasra');
    }
  };

  const handleEdit = (id) => {
    const kasra = dataKasra.find((m) => m.id === id);
    setDataEditKasra({ ...kasra });
    setShowModal(true);
  };

  const handleSubmitEdit = (e, id) => {
    e.preventDefault();
    
    // Validasi form
    if (!dataEditKasra.nim || !dataEditKasra.nama || !dataEditKasra.jenisKelamin || !dataEditKasra.gedung || !dataEditKasra.noKamar) {
      setEditErrorMessage('Semua field harus diisi');
      return;
    }
    
    // Validasi kamar
    try {
      const validationResult = validateRoomChange(dataEditKasra.gedung, dataEditKasra.noKamar, dataEditKasra.jenisKelamin);
      if (!validationResult.valid) {
        setEditErrorMessage(validationResult.message);
        return;
      }
    } catch (error) {
      setEditErrorMessage(error.message || 'Terjadi kesalahan saat validasi kamar');
      return;
    }
    
    // Update data kasra
    const updatedDataKasra = dataKasra.map(kasra => {
      if (kasra.id === id) {
        return {
          ...dataEditKasra,
          role: 'kasra', // Pastikan role tetap kasra
          email: dataEditKasra.email || `${dataEditKasra.nim}@student.itera.ac.id`, // Pastikan email ada
          password: dataEditKasra.password || dataEditKasra.nim || 'kasra123' // Pastikan password ada
        };
      }
      return kasra;
    });
    
    // Update state dan localStorage
    setDataKasra(updatedDataKasra);
    saveDataKasra(updatedDataKasra);
    
    // Reset form
    setDataEditKasra({});
    setShowModal(false);
    setEditErrorMessage('');
    toast.success('Data kasra berhasil diperbarui');
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
        try {
        // Filter data dan update state
        const filteredData = dataKasra.filter((m) => m.id !== id);
        setDataKasra(filteredData);
          
          // Update data di localStorage
          localStorage.setItem('kasraData', JSON.stringify(filteredData));
          console.log('Data kasra berhasil dihapus dari localStorage', filteredData);
          
          // Trigger custom event untuk memperbarui kapasitas kamar
          window.dispatchEvent(new Event('localStorageChange'));
          
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        } catch (error) {
          console.error('Error saat menghapus data:', error);
          Swal.fire('Error!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
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
      toast.error('Pilih file terlebih dahulu');
      return;
    }

      const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('File tidak berisi data');
          return;
        }

        // Validasi format data
        const requiredFields = ['nim', 'nama', 'jenisKelamin', 'gedung', 'noKamar'];
        const isValidFormat = jsonData.every(item => 
          requiredFields.every(field => item[field] !== undefined)
        );

        if (!isValidFormat) {
          toast.error('Format file tidak valid. Pastikan file memiliki kolom: ' + requiredFields.join(', '));
          return;
        }

        // Ambil data mahasiswa untuk validasi
        const dataMahasiswa = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
        
        // Validasi dan filter data
        const validatedData = [];
        const errors = [];
        
        for (let i = 0; i < jsonData.length; i++) {
          const item = jsonData[i];
          const nim = String(item.nim);
          
          // Cek apakah NIM sudah ada di data kasra
          const existingKasra = dataKasra.find(kasra => kasra && String(kasra.nim) === nim);
          if (existingKasra) {
            errors.push(`Baris ${i + 2}: NIM ${nim} sudah terdaftar sebagai kasra`);
            continue;
          }
          
          // Cek apakah NIM sudah ada di data mahasiswa
          const existingMahasiswa = dataMahasiswa.find(mahasiswa => 
            mahasiswa && String(mahasiswa.nim) === nim
          );
          if (existingMahasiswa) {
            errors.push(`Baris ${i + 2}: NIM ${nim} sudah terdaftar sebagai mahasiswa`);
            continue;
          }
          
          // Validasi gedung berdasarkan jenis kelamin
          const jenisKelamin = item.jenisKelamin;
          const gedung = item.gedung;
          
          const gedungLakiLaki = ['TB2', 'TB3'];
          const gedungPerempuan = ['TB1', 'TB4', 'TB5'];
          
          if (jenisKelamin === 'Laki-laki' && !gedungLakiLaki.includes(gedung)) {
            errors.push(`Baris ${i + 2}: Gedung ${gedung} tidak sesuai untuk jenis kelamin Laki-laki`);
            continue;
          }
          
          if (jenisKelamin === 'Perempuan' && !gedungPerempuan.includes(gedung)) {
            errors.push(`Baris ${i + 2}: Gedung ${gedung} tidak sesuai untuk jenis kelamin Perempuan`);
            continue;
          }
          
          // Tambahkan data yang valid
          validatedData.push({
            ...item,
            id: nim,
            status: 'Aktif Tinggal',
            createdAt: new Date().toISOString(),
            role: 'kasra', // Tambahkan role kasra
            email: item.email || `${nim}@student.itera.ac.id`, // Pastikan email ada
            password: item.password || nim || 'kasra123' // Pastikan password ada
          });
        }
        
        // Tampilkan error jika ada
        if (errors.length > 0) {
          const errorMessage = `Terdapat ${errors.length} error:\n${errors.join('\n')}`;
          console.error(errorMessage);
          toast.error(errorMessage);
          
          // Jika semua data error, berhenti
          if (validatedData.length === 0) {
            return;
          }
          
          // Tanya user apakah ingin melanjutkan dengan data yang valid
          if (!window.confirm(`Terdapat ${errors.length} error. Apakah Anda ingin melanjutkan dengan ${validatedData.length} data yang valid?`)) {
            return;
          }
        }
        
        // Update state dan localStorage
        const updatedDataKasra = [...dataKasra, ...validatedData];
        const saveSuccess = saveDataKasra(updatedDataKasra);
        
        if (saveSuccess) {
          setDataKasra(updatedDataKasra);
          setFile(null);
          setFileName('Pilih file...');
          toast.success(`Berhasil menambahkan ${validatedData.length} data kasra`);
    } else {
          toast.error('Gagal menyimpan data kasra');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Terjadi kesalahan saat memproses file');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (!mounted) {
    return null;
  }
  return (
    <>
      <ToastContainer />
      {showForm ? (
        <div className="flex flex-col justify-center items-center mt-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header Form dengan gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-300 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Form Data Kasra</h1>
              <p className="mt-1 text-sm text-white/80">Tambah data kasra baru dengan mengisi form di bawah ini</p>
              {errorMessage && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmitAdd} className="p-6 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informasi Pribadi */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pribadi</h3>
              {/* NIM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                      placeholder="Masukkan NIM"
                />
              </div>

              {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                      placeholder="Masukkan nama lengkap"
                />
              </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                </label>
                <input
                      type="email"
                      name="email"
                      value={formData.email}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                      placeholder="contoh@itera.ac.id"
                />
              </div>

                  {/* Program Studi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program Studi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                      name="prodi"
                      value={formData.prodi}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                      placeholder="Masukkan program studi"
                />
              </div>

              {/* Tempat Lahir */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                      </div>
              </div>

              {/* Asal */}
                  <div className="form-group col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="asal"
                  value={formData.asal}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                      placeholder="Masukkan asal daerah"
                />
                  </div>
              </div>

              {/* Informasi Asrama */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi Asrama</h3>

                {/* Jenis Kelamin */}
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jenisKelamin"
                        value={formData.jenisKelamin}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        {['Laki-laki', 'Perempuan'].map((jenisKelamin) => (
                          <option key={jenisKelamin} value={jenisKelamin}>
                            {jenisKelamin}
                          </option>
                        ))}
                      </select>
                    </div>

                  {/* Gedung */}
              <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gedung <span className="text-red-500">*</span>
                </label>
                <select
                      name="gedung"
                      value={formData.gedung}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    >
                      <option value="">Pilih Gedung</option>
                      {formData.jenisKelamin === 'Laki-laki'
                        ? ['TB2', 'TB3'].map((gedung) => (
                          <option key={gedung} value={gedung}>
                            {gedung}
                      </option>
                        ))
                        : formData.jenisKelamin === 'Perempuan'
                        ? ['TB1', 'TB4', 'TB5'].map((gedung) => (
                          <option key={gedung} value={gedung}>
                            {gedung}
                          </option>
                        ))
                        : null}
                </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.jenisKelamin === 'Laki-laki' 
                        ? 'TB2 dan TB3 untuk kasra laki-laki' 
                        : 'TB1, TB4, dan TB5 untuk kasra perempuan'}
                    </p>
                  </div>

                  {/* No Kamar */}
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Kamar <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="noKamar"
                      value={formData.noKamar}
                      onChange={(e) => {
                        const selectedRoom = availableRooms.find(room => room.nomorKamar === e.target.value);
                        if (selectedRoom) {
                          setFormData({
                            ...formData,
                            noKamar: selectedRoom.nomorKamar,
                            gedung: selectedRoom.gedung
                          });
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      disabled={!formData.gedung}
                      required
                    >
                      <option value="">Pilih Kamar</option>
                      {availableRooms
                        .filter(room => {
                          return room.gedung === formData.gedung &&
                            room.status === 'tersedia' &&
                            room.terisi < room.kapasitas;
                        })
                        .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar))
                        .map(room => (
                          <option
                            key={room.nomorKamar}
                            value={room.nomorKamar}
                          >
                            {`${room.nomorKamar} (${room.terisi}/${room.kapasitas})`}
                          </option>
                        ))
                      }
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {!formData.gedung
                        ? "Pilih gedung terlebih dahulu"
                        : "Format: Nomor Kamar (Jumlah Penghuni/Kapasitas)"}
                    </p>
              </div>

              {/* Status */}
              <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Tinggal <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                >
                  {['Aktif Tinggal', 'Checkout'].map((statusTinggal) => (
                        <option key={statusTinggal} value={statusTinggal}>{statusTinggal}</option>
                  ))}
                </select>
              </div>

                  {/* Golongan UKT */}
              <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Golongan UKT <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="golonganUKT"
                      value={formData.golonganUKT}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((golongan) => (
                        <option key={golongan} value={golongan}>Golongan {golongan}</option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div className="form-group col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                      placeholder="Masukkan password"
                />
                    <p className="mt-1 text-xs text-gray-500">Password default: kasra123</p>
                  </div>
                </div>
              </div>


              {/* Tombol Submit dan Cancel */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-300"
                >
                  Tambah Kasra
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
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

          {/* Table Section */}
          <div className="hidden overflow-x-auto md:block rounded-lg border">
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
                    <td className="px-4 py-2 text-xs md:text-sm text-center">{kasra.jenisKelamin}</td>

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

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {currentItems.map((kasra) => (
            <div key={kasra.id} className="bg-white p-4 rounded-lg shadow space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{kasra.nama}</h3>
                  <p className="text-sm text-gray-600">{kasra.nim}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(kasra.id)}
                    className="p-1 hover:text-blue-600"
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(kasra.id)}
                    className="p-1 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Program Studi</p>
                  <p className="font-medium">{kasra.prodi}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium break-all">{kasra.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gedung</p>
                  <p className="font-medium">{kasra.gedung}</p>
                </div>
                <div>
                  <p className="text-gray-500">No Kamar</p>
                  <p className="font-medium">{kasra.noKamar}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{kasra.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Golongan UKT</p>
                  <p className="font-medium">{kasra.golonganUKT}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tempat Lahir</p>
                  <p className="font-medium">{kasra.tempatLahir}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal Lahir</p>
                  <p className="font-medium">
                    {dayjs(kasra.tanggalLahir, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('DD/MM/YYYY')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Asal</p>
                  <p className="font-medium">{kasra.asal}</p>
                </div>
              </div>
            </div>
          ))}
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
          <div className="relative w-full sm:w-auto my-6 mx-auto max-w-3xl px-4">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                    Form Edit Data Kasra
                  </h3>
                <p className="mt-1 text-sm text-gray-600">Update data kasra dengan teliti</p>
                {editErrorMessage && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{editErrorMessage}</p>
                )}
                </div>

              {/* Form */}
              <div className="p-4 sm:p-6">
                <form onSubmit={(e) => handleSubmitEdit(e, dataEditKasra.id)} 
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Form fields */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* NIM */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          NIM
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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

                    {/* Nama */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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

                    {/* Prodi */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Program Studi
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                          value={dataEditKasra.prodi || ''}
                          onChange={(e) =>
                            setDataEditKasra({
                              ...dataEditKasra,
                              prodi: e.target.value,
                            })
                          }
                        />
                      </div>

                    {/* Gedung */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gedung
                        </label>
                        <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                        value={dataEditKasra.gedung || ''}
                        onChange={(e) => {
                            setDataEditKasra({
                              ...dataEditKasra,
                              gedung: e.target.value,
                            noKamar: '' // Reset room selection when building changes
                          });
                        }}
                      >
                        <option value="">Pilih Gedung</option>
                        {dataEditKasra.jenisKelamin === 'Laki-laki'
                          ? ['TB2', 'TB3'].map((gedung) => (
                            <option key={gedung} value={gedung}>
                              {gedung}
                            </option>
                          ))
                          : ['TB1', 'TB4', 'TB5'].map((gedung) => (
                            <option key={gedung} value={gedung}>
                              {gedung}
                            </option>
                          ))}
                        </select>
                      <p className="mt-1 text-sm text-gray-500">
                        {dataEditKasra.jenisKelamin === 'Laki-laki' 
                          ? 'TB1 dan TB2 untuk kasra laki-laki' 
                          : 'TB3, TB4, dan TB5 untuk kasra perempuan'}
                      </p>
                    </div>

                    {/* No Kamar */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          No Kamar
                        </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                          value={dataEditKasra.noKamar || ''}
                        onChange={(e) => {
                          const selectedRoom = availableRooms.find(
                            room => room.gedung === dataEditKasra.gedung && room.nomorKamar === e.target.value
                          );
                          if (selectedRoom) {
                            setDataEditKasra({
                              ...dataEditKasra,
                              noKamar: selectedRoom.nomorKamar
                            });
                          }
                        }}
                        disabled={!dataEditKasra.gedung}
                        required
                      >
                        <option value="">Pilih Kamar</option>
                        {availableRooms
                          .filter(room =>
                            room.gedung === dataEditKasra.gedung && // Only show rooms for selected building
                            (room.terisi < room.kapasitas || // Show available rooms
                              room.nomorKamar === dataEditKasra.noKamar) // Always show current room
                          )
                          .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar))
                          .map(room => (
                            <option
                              key={room.nomorKamar}
                              value={room.nomorKamar}
                              disabled={room.terisi >= room.kapasitas && room.nomorKamar !== dataEditKasra.noKamar}
                            >
                              {`${room.nomorKamar} (${room.terisi}/${room.kapasitas})`}
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Format: Nomor Kamar (Jumlah Penghuni/Kapasitas)
                      </p>
                      </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                      </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Tempat Lahir */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tempat Lahir
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                          value={dataEditKasra.tempatLahir || ''}
                          onChange={(e) =>
                            setDataEditKasra({
                              ...dataEditKasra,
                              tempatLahir: e.target.value,
                            })
                          }
                        />
                      </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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

                    {/* Asal */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Asal
                        </label>
                        <input
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                          value={dataEditKasra.asal || ''}
                          onChange={(e) =>
                            setDataEditKasra({
                              ...dataEditKasra,
                              asal: e.target.value,
                            })
                          }
                        />
                      </div>

                    {/* Golongan UKT */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Golongan UKT
                        </label>
                        <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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

                    {/* Status Tinggal */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status Tinggal
                        </label>
                        <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                    </div>

                    {/* Tombol */}
                  <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-6">
                      <button
                        type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
