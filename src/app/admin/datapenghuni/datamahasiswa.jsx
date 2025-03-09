import { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';
import {
  getDataMahasiswa,
  saveDataMahasiswa,
  clearDataMahasiswa,
  getDataPelanggaranMahasiswa,
  saveDataPelanggaranMahasiswa,
} from '@/utils/localStorage';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ActionDropdown from '@/components/ActionDropdown';
import { getDataKamar } from '@/utils/localStorage';
import Pagination from '@/components/Pagination';
import Search from '@/components/Search';
import { v4 as uuidv4 } from 'uuid';

dayjs.extend(customParseFormat);
const formatTanggal = (tanggal) => {
  if (!tanggal) return 'Invalid Date';

  // Jika berupa angka (serial Excel)
  if (typeof tanggal === 'number') {
    return dayjs(new Date((tanggal - 25569) * 86400 * 1000)).format(
      'DD/MM/YYYY'
    );
  }

  // Jika berupa string dengan berbagai format tanggal
  const parsedDate = dayjs(
    tanggal,
    ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'],
    true
  );

  return parsedDate.isValid()
    ? parsedDate.format('DD/MM/YYYY')
    : 'Invalid Date';
};

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

// Data dummy mahasiswa
const dummyData = [
  {
    id: 120140001,
    nim: '120140001',
    nama: 'John Doe',
    prodi: 'Teknik Informatika',
    gedung: 'TB1',
    noKamar: 'A101',
    email: 'john@example.com',
    tempatLahir: 'Jakarta',
    tanggalLahir: '01/01/2001',
    asal: 'Jakarta',
    golonganUKT: 3,
    status: 'Aktif Tinggal',
    jenisKelamin: 'Laki-laki',
    password: 'mahasiswa123',
    role: 'mahasiswa',
  },
];

const DataMahasiswa = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [dataMahasiswa, setDataMahasiswa] = useState(() => {
    const savedData = getDataMahasiswa();
    return savedData.length > 0 ? savedData : [];
  });
  const [dataEditMahasiswa, setDataEditMahasiswa] = useState({});
  const [dataPelanggaran, setDataPelanggaran] = useState(() => {
    const savedData = getDataPelanggaranMahasiswa();
    return savedData.length > 0 ? savedData : [];
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Pilih file...');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

  const initialFormState = {
    id: '',
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
    jenisKelamin: 'Laki-laki',
    password: '',
    role: 'mahasiswa',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [pelanggaran, setPelanggaran] = useState('');

  const [showPelanggaranForm, setShowPelanggaranForm] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);

  const [availableRooms, setAvailableRooms] = useState([]);

  // Filter data berdasarkan pencarian
  const filteredData = dataMahasiswa.filter((mahasiswa) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      mahasiswa.nim.toLowerCase().includes(searchLower) ||
      mahasiswa.nama.toLowerCase().includes(searchLower) ||
      mahasiswa.prodi.toLowerCase().includes(searchLower) ||
      mahasiswa.gedung.toLowerCase().includes(searchLower) ||
      mahasiswa.noKamar.toLowerCase().includes(searchLower) ||
      mahasiswa.email.toLowerCase().includes(searchLower) ||
      mahasiswa.tempatLahir.toLowerCase().includes(searchLower) ||
      mahasiswa.asal.toLowerCase().includes(searchLower) ||
      mahasiswa.status.toLowerCase().includes(searchLower)
    );
  });

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const dormRooms = JSON.parse(localStorage.getItem('dormRooms') || '[]');
    setAvailableRooms(dormRooms);
  }, []);

  const handleTambahPelanggaran = (mahasiswa) => {
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

    // Ambil data pelanggaran lama dari localStorage
    const existingPelanggaran = getDataPelanggaranMahasiswa(
      selectedMahasiswa.nim
    );

    // Tambahkan data baru tanpa menghapus yang lama
    const updatedPelanggaran = [
      ...existingPelanggaran,
      { ...formData, id: existingPelanggaran.length + 1 },
    ];

    // Simpan kembali ke localStorage
    saveDataPelanggaranMahasiswa(selectedMahasiswa.nim, updatedPelanggaran);

    // Update state
    setPelanggaran(updatedPelanggaran);

    setShowPelanggaranForm(false);
    setFormData({
      nim: '',
      nama: '',
      gedung: '',
      noKamar: '',
      tanggalPelanggaran: '',
      keteranganPelanggaran: '',
    });

    toast.success('Data pelanggaran berhasil ditambahkan');
  };

  useEffect(() => {
    setMounted(true);
    const savedData = getDataMahasiswa();
    setDataMahasiswa(savedData.length > 0 ? savedData : []);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveDataMahasiswa(dataMahasiswa);
    }
  }, [dataMahasiswa, mounted]);

  useEffect(() => {
    if (pelanggaran && pelanggaran.length > 0) {
      saveDataPelanggaranMahasiswa(pelanggaran);
    }
  }, [pelanggaran]);

  const findAvailableRoom = (jenisKelamin) => {
    // Gedung untuk laki-laki: TB2 dan TB3
    // Gedung untuk perempuan: TB1, TB4, dan TB5
    const gedungLakiLaki = ['TB2', 'TB3'];
    const gedungPerempuan = ['TB1', 'TB4', 'TB5'];
    
    // Filter rooms based on gender
    const isLakiLaki = jenisKelamin && jenisKelamin.toLowerCase() === 'laki-laki';
    const gedungSesuaiGender = availableRooms.filter(kamar => {
      return isLakiLaki ?
        gedungLakiLaki.includes(kamar.gedung) :  // Laki-laki di TB2 dan TB3
        gedungPerempuan.includes(kamar.gedung);  // Perempuan di TB1, TB4, TB5
    });

    // Debug log
    console.log('Jenis Kelamin:', jenisKelamin);
    console.log('Is Laki-laki:', isLakiLaki);
    console.log('Gedung Laki-laki:', gedungLakiLaki);
    console.log('Gedung Perempuan:', gedungPerempuan);
    console.log('Gedung yang sesuai:', gedungSesuaiGender.map(k => k.gedung));
    
    // Check for available rooms
    const availableRoomsForGender = gedungSesuaiGender.filter(kamar => 
      kamar.status !== 'penuh' && kamar.status !== 'perbaikan'
    );
    
    return availableRoomsForGender;
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nim') {
      setFormData({
        ...formData,
        [name]: value,
        id: value, // Set ID sama dengan NIM
        password: value || 'mahasiswa123', // Set default password ke NIM
      });
    } else if (name === 'jenisKelamin') {
      setFormData({
        ...formData,
        [name]: value,
        gedung: value.toLowerCase() === 'laki-laki' ? 'TB2' : 'TB1',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nim || !formData.nama || !formData.jenisKelamin || !formData.gedung || !formData.noKamar) {
      setErrorMessage('Semua field harus diisi');
      return;
    }

    // Validasi NIM unik
    const existingMahasiswa = dataMahasiswa.find(
      (mahasiswa) => mahasiswa.nim === formData.nim
    );
    
    if (existingMahasiswa) {
      setErrorMessage('NIM sudah terdaftar sebagai mahasiswa');
      return;
    }
    
    // Validasi NIM tidak ada di data kasra
    try {
      const dataKasra = JSON.parse(localStorage.getItem('dataKasra') || '[]');
      const existingKasra = Array.isArray(dataKasra) ? 
        dataKasra.find(kasra => kasra && kasra.nim === formData.nim) : null;
      
      if (existingKasra) {
        setErrorMessage('NIM sudah terdaftar sebagai kasra. Tidak bisa mendaftar sebagai mahasiswa dengan NIM yang sama.');
        return;
      }
    } catch (error) {
      console.error('Error checking kasra data:', error);
    }

    // Validasi kamar
    try {
      const validationResult = validateRoomChange(formData.gedung, formData.noKamar, formData.jenisKelamin, formData.nim);
      if (!validationResult.valid) {
        setErrorMessage(validationResult.message);
        return;
      }
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }

    try {
      setIsLoading(true);
      const idd = toast.loading('Create Data Mahasiswa...');

      // Pastikan gedung dan noKamar sudah dipilih
      if (!formData.gedung || !formData.noKamar) {
        toast.error('Pilih Gedung dan Nomor Kamar terlebih dahulu');
        setIsLoading(false);
        return;
      }

      // Cari kamar yang dipilih
      const selectedRoom = availableRooms.find(
        room => room.gedung === formData.gedung && room.nomorKamar === formData.noKamar
      );

      if (!selectedRoom) {
        toast.error('Kamar yang dipilih tidak valid');
        setIsLoading(false);
        return;
      }

      const newMahasiswa = {
        ...formData,
        id: formData.nim,
        gedung: formData.gedung, // Gunakan gedung yang dipilih
        noKamar: formData.noKamar, // Gunakan nomor kamar yang dipilih
        tanggalLahir: formData.tanggalLahir || new Date().toISOString().split('T')[0],
        password: formData.nim || 'mahasiswa123',
        role: 'mahasiswa',
      };

      // Update room occupancy
      const updatedRooms = availableRooms.map(room => {
        if (room.gedung === formData.gedung && room.nomorKamar === formData.noKamar) {
          return {
            ...room,
            terisi: room.terisi + 1
          };
        }
        return room;
      });

      // Update available rooms in state and localStorage
      setAvailableRooms(updatedRooms);
      localStorage.setItem('dormRooms', JSON.stringify(updatedRooms));

      const updatedData = [...dataMahasiswa, newMahasiswa];
      setDataMahasiswa(updatedData);
      saveDataMahasiswa(updatedData);

      toast.update(idd, {
        render: 'Data berhasil ditambahkan',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      setFormData(initialFormState);
      setErrorMessage('');
      setShowForm(false);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleEdit = (nim) => {
    const mahasiswa = dataMahasiswa.find((m) => m.nim === nim);
    setDataEditMahasiswa({ ...mahasiswa });
    setShowModal(true);
  };

  const validateRoomChange = (newGedung, newNoKamar, jenisKelamin, currentNIM = null) => {
    // Validasi gedung sesuai jenis kelamin
    const isLakiLaki = jenisKelamin && jenisKelamin.toLowerCase() === 'laki-laki';
    
    // Gedung untuk laki-laki: TB2 dan TB3
    // Gedung untuk perempuan: TB1, TB4, dan TB5
    const gedungLakiLaki = ['TB2', 'TB3'];
    const gedungPerempuan = ['TB1', 'TB4', 'TB5'];
    
    const gedungValid = isLakiLaki ? 
      gedungLakiLaki.includes(newGedung) : 
      gedungPerempuan.includes(newGedung);
    
    // Debug log
    console.log('Validasi Kamar:', { 
      jenisKelamin, 
      isLakiLaki, 
      newGedung, 
      gedungValid,
      gedungLakiLaki,
      gedungPerempuan
    });
    
    if (!gedungValid) {
      const pesanError = isLakiLaki 
        ? `Gedung tidak sesuai dengan jenis kelamin Laki-laki. Laki-laki hanya boleh di ${gedungLakiLaki.join(' dan ')}`
        : `Gedung tidak sesuai dengan jenis kelamin Perempuan. Perempuan hanya boleh di ${gedungPerempuan.join(', ')}`;
      
      return { 
        valid: false, 
        message: pesanError
      };
    }
    
    // Validasi kamar tersedia
    const selectedRoom = availableRooms.find(
      room => room.gedung === newGedung && room.nomorKamar === newNoKamar
    );
    
    if (!selectedRoom) {
      return { valid: false, message: 'Kamar tidak ditemukan' };
    }
    
    if (selectedRoom.status === 'penuh') {
      // Jika ini adalah edit dan mahasiswa sudah menempati kamar ini, tetap izinkan
      if (currentNIM) {
        const currentMahasiswa = dataMahasiswa.find(m => m.nim === currentNIM);
        if (currentMahasiswa && currentMahasiswa.gedung === newGedung && currentMahasiswa.noKamar === newNoKamar) {
          return { valid: true };
        }
      }
      return { valid: false, message: 'Kamar sudah penuh' };
    }
    
    if (selectedRoom.status === 'perbaikan') {
      return { valid: false, message: 'Kamar sedang dalam perbaikan' };
    }
    
    return { valid: true };
  };

  // Update handleSubmitEdit dengan validasi NIM
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!dataEditMahasiswa.nim || !dataEditMahasiswa.nama || !dataEditMahasiswa.jenisKelamin || !dataEditMahasiswa.gedung || !dataEditMahasiswa.noKamar) {
      setEditErrorMessage('Semua field harus diisi');
      return;
    }

    // Jika NIM berubah, validasi NIM baru tidak ada di data mahasiswa lain
    const originalMahasiswa = dataMahasiswa.find(m => m.nim === dataEditMahasiswa.nim);
    if (dataEditMahasiswa.nim !== dataEditMahasiswa.nim) {
      const existingMahasiswa = dataMahasiswa.find(
        (mahasiswa) => mahasiswa.nim === dataEditMahasiswa.nim && mahasiswa.nim !== dataEditMahasiswa.nim
      );
      
      if (existingMahasiswa) {
        setEditErrorMessage('NIM sudah terdaftar sebagai mahasiswa lain');
        return;
      }
      
      // Validasi NIM tidak ada di data kasra
      try {
        const dataKasra = JSON.parse(localStorage.getItem('dataKasra') || '[]');
        const existingKasra = Array.isArray(dataKasra) ? 
          dataKasra.find(kasra => kasra && kasra.nim === dataEditMahasiswa.nim) : null;
        
        if (existingKasra) {
          setEditErrorMessage('NIM sudah terdaftar sebagai kasra. Tidak bisa menggunakan NIM yang sama.');
          return;
        }
      } catch (error) {
        console.error('Error checking kasra data:', error);
      }
    }

    // Validasi kamar jika kamar berubah
    if (dataEditMahasiswa.gedung !== originalMahasiswa.gedung || 
        dataEditMahasiswa.noKamar !== originalMahasiswa.noKamar) {
      try {
        const validationResult = validateRoomChange(
          dataEditMahasiswa.gedung, 
          dataEditMahasiswa.noKamar, 
          dataEditMahasiswa.jenisKelamin,
          dataEditMahasiswa.nim
        );
        if (!validationResult.valid) {
          setEditErrorMessage(validationResult.message);
          return;
        }
      } catch (error) {
        setEditErrorMessage(error.message);
        return;
      }
    }

    try {
      setIsLoading(true);
      const idd = toast.loading('Edit Data Mahasiswa...');

      // Cari data mahasiswa asli
      const originalStudent = dataMahasiswa.find(m => m.nim === dataEditMahasiswa.nim);

      // Ambil data kamar dari localStorage
      const dormRooms = JSON.parse(localStorage.getItem('dormRooms') || '[]');

      // Jika gedung atau kamar berubah, update occupancy
      if (originalStudent.gedung !== dataEditMahasiswa.gedung ||
        originalStudent.noKamar !== dataEditMahasiswa.noKamar) {

        // Kurangi penghuni di kamar lama
        const updatedRoomsDecrement = dormRooms.map(room => {
          if (room.gedung === originalStudent.gedung &&
            room.nomorKamar === originalStudent.noKamar) {
            return {
              ...room,
              terisi: Math.max(0, room.terisi - 1)
            };
          }
          return room;
        });

        // Tambah penghuni di kamar baru
        const updatedRoomsFinal = updatedRoomsDecrement.map(room => {
          if (room.gedung === dataEditMahasiswa.gedung &&
            room.nomorKamar === dataEditMahasiswa.noKamar) {
            return {
              ...room,
              terisi: room.terisi + 1
            };
          }
          return room;
        });

        // Simpan kembali ke localStorage
        localStorage.setItem('dormRooms', JSON.stringify(updatedRoomsFinal));

        // Perbarui state availableRooms
        setAvailableRooms(updatedRoomsFinal);
      }

      // Update data mahasiswa
      const updatedData = dataMahasiswa.map((item) =>
        item.nim === originalStudent.nim ? { ...dataEditMahasiswa } : item
      );

      // Simpan data mahasiswa
      setDataMahasiswa(updatedData);
      saveDataMahasiswa(updatedData);

      // Notifikasi sukses
      toast.update(idd, {
        render: 'Data berhasil diubah',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      // Reset state
      setEditErrorMessage('');
      setShowModal(false);
      setIsLoading(false);

    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Gagal mengupdate data mahasiswa');
      setIsLoading(false);
    }
  };



  const handleDelete = (nim) => {
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
          const filteredData = dataMahasiswa.filter((m) => m.nim !== nim);
          setDataMahasiswa(filteredData);
          
          // Update data di localStorage
          localStorage.setItem('mahasiswaData', JSON.stringify(filteredData));
          console.log('Data mahasiswa berhasil dihapus dari localStorage', filteredData);
          
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
      toast.error('Pilih file terlebih dahulu!');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === 'csv' || fileExtension === 'xlsx') {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const binaryString = event.target.result;
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          let data = XLSX.utils.sheet_to_json(sheet);

          if (data.length === 0) {
            toast.error('File Excel tidak memiliki data!');
            return;
          }

          // Validasi format data minimal
          const requiredFields = ['NIM', 'Nama', 'Jenis Kelamin'];
          const isValidFormat = data.every(item => 
            requiredFields.every(field => item[field] !== undefined)
          );

          if (!isValidFormat) {
            toast.error('Format Excel tidak valid! Pastikan memiliki kolom: NIM, Nama, Jenis Kelamin');
            return;
          }

          // Cek duplikasi dengan data yang sudah ada
          const existingNIMs = dataMahasiswa.map(mahasiswa => mahasiswa.nim);
          const duplicateEntries = data.filter(item => existingNIMs.includes(String(item.NIM)));
          
          if (duplicateEntries.length > 0) {
            const duplicateNIMs = duplicateEntries.map(item => item.NIM).join(', ');
            toast.error(`Terdapat ${duplicateEntries.length} data dengan NIM yang sudah ada: ${duplicateNIMs}`);
            return;
          }

          // Cek duplikasi dengan data kasra
          try {
            const dataKasraRaw = localStorage.getItem('kasraData');
            if (dataKasraRaw) {
              const dataKasra = JSON.parse(dataKasraRaw);
              if (Array.isArray(dataKasra)) {
                const existingKasraNIMs = dataKasra.map(kasra => kasra.nim);
                const duplicateWithKasra = data.filter(item => existingKasraNIMs.includes(String(item.NIM)));
                
                if (duplicateWithKasra.length > 0) {
                  const duplicateNIMs = duplicateWithKasra.map(item => item.NIM).join(', ');
                  toast.error(`Terdapat ${duplicateWithKasra.length} data dengan NIM yang sudah terdaftar sebagai kasra: ${duplicateNIMs}`);
                  return;
                }
              }
            }
          } catch (error) {
            console.error('Error checking kasra data:', error);
          }

          // Format tanggal
          const formatDate = (excelDate) => {
            if (!excelDate) return '';
            if (typeof excelDate === 'number') {
              return dayjs(new Date((excelDate - 25569) * 86400 * 1000)).format('DD/MM/YYYY');
            } else if (typeof excelDate === 'string') {
              const parsedDate = dayjs(excelDate, ['DD/MM/YYYY', 'D/M/YYYY', 'YYYY-MM-DD'], true);
              return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY') : '';
            }
            return '';
          };

          // Ambil data kamar dari localStorage
          const dormRooms = JSON.parse(localStorage.getItem('dormRooms') || '[]');

          // Pisahkan mahasiswa berdasarkan jenis kelamin
          const dataLakiLaki = data.filter(item => item['Jenis Kelamin'] === 'Laki-laki');
          const dataPerempuan = data.filter(item => item['Jenis Kelamin'] === 'Perempuan');

          // Gedung untuk laki-laki: TB2 dan TB3
          // Gedung untuk perempuan: TB1, TB4, dan TB5
          const gedungLakiLaki = ['TB2', 'TB3'];
          const gedungPerempuan = ['TB1', 'TB4', 'TB5'];

          // Cari kamar untuk laki-laki di TB2 dan TB3
          const kamarLakiLaki = dormRooms.filter(kamar =>
            gedungLakiLaki.includes(kamar.gedung) && kamar.status !== 'penuh' && kamar.status !== 'perbaikan'
          );

          // Cari kamar untuk perempuan di TB1, TB4, TB5
          const kamarPerempuan = dormRooms.filter(kamar =>
            gedungPerempuan.includes(kamar.gedung) && kamar.status !== 'penuh' && kamar.status !== 'perbaikan'
          );

          if (dataLakiLaki.length > 0 && kamarLakiLaki.length === 0) {
            toast.error('Tidak ada kamar tersedia untuk mahasiswa laki-laki');
            return;
          }

          if (dataPerempuan.length > 0 && kamarPerempuan.length === 0) {
            toast.error('Tidak ada kamar tersedia untuk mahasiswa perempuan');
            return;
          }

          // Proses mahasiswa laki-laki
          const processedLakiLaki = dataLakiLaki.map((item, index) => {
            const roomIndex = index % kamarLakiLaki.length;
            const selectedRoom = kamarLakiLaki[roomIndex];

            // Update occupancy
            selectedRoom.terisi = (selectedRoom.terisi || 0) + 1;
            if (selectedRoom.terisi >= selectedRoom.kapasitas) {
              selectedRoom.status = 'penuh';
            }

            return {
              id: uuidv4(),
              nim: String(item.NIM),
              nama: item.Nama,
              jenisKelamin: item['Jenis Kelamin'],
              prodi: item.Prodi || '',
              gedung: selectedRoom.gedung,
              noKamar: selectedRoom.nomorKamar,
              email: item.Email || '',
              tempatLahir: item['Tempat Lahir'] || '',
              tanggalLahir: formatDate(item['Tanggal Lahir']),
              asal: item.Asal || '',
              noHP: item['No HP'] || '',
              status: 'Aktif Tinggal',
              password: String(item.NIM) || 'mahasiswa123',
              createdAt: new Date().toISOString()
            };
          });

          // Proses mahasiswa perempuan
          const processedPerempuan = dataPerempuan.map((item, index) => {
            const roomIndex = index % kamarPerempuan.length;
            const selectedRoom = kamarPerempuan[roomIndex];

            // Update occupancy
            selectedRoom.terisi = (selectedRoom.terisi || 0) + 1;
            if (selectedRoom.terisi >= selectedRoom.kapasitas) {
              selectedRoom.status = 'penuh';
            }

            return {
              id: uuidv4(),
              nim: String(item.NIM),
              nama: item.Nama,
              jenisKelamin: item['Jenis Kelamin'],
              prodi: item.Prodi || '',
              gedung: selectedRoom.gedung,
              noKamar: selectedRoom.nomorKamar,
              email: item.Email || '',
              tempatLahir: item['Tempat Lahir'] || '',
              tanggalLahir: formatDate(item['Tanggal Lahir']),
              asal: item.Asal || '',
              noHP: item['No HP'] || '',
              status: 'Aktif Tinggal',
              password: String(item.NIM) || 'mahasiswa123',
              createdAt: new Date().toISOString()
            };
          });

          // Gabungkan data
          const processedData = [...processedLakiLaki, ...processedPerempuan];

          // Update localStorage dengan kamar yang sudah diupdate
          localStorage.setItem('dormRooms', JSON.stringify(dormRooms));

          // Update state
          const updatedData = [...dataMahasiswa, ...processedData];
          setDataMahasiswa(updatedData);
          saveDataMahasiswa(updatedData);
          setAvailableRooms(dormRooms);

          // Reset file input
          setFile(null);
          setFileName('');
          
          toast.success(`Berhasil mengupload ${processedData.length} data mahasiswa dengan otomatisasi kamar!`);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          toast.error('Terjadi kesalahan saat memproses file Excel');
        }
      };

      reader.onerror = () => {
        toast.error('Terjadi kesalahan saat membaca file');
      };

      reader.readAsBinaryString(file);
    } else {
      toast.error('Hanya file CSV atau XLSX yang diperbolehkan.');
    }
  };


  if (!mounted) {
    return null;
  }

  return (
    <>
      {showForm ? (
        <div className="flex flex-col justify-center items-center mt-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-300 p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Form Data Mahasiswa
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  Silakan isi data mahasiswa dengan lengkap dan benar
                </p>
                {errorMessage && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitAdd} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section: Informasi Pribadi */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Informasi Pribadi
                    </h3>
                    
                    {/* NIM */}
                    <div >
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
                      />
                    </div>

                    {/* Tempat & Tanggal Lahir */}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="asal"
                        value={formData.asal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Section: Informasi Asrama */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Informasi Asrama
                    </h3>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jenisKelamin"
                        value={formData.jenisKelamin}
                        onChange={(e) => {
                          const selectedGender = e.target.value;
                          setFormData({
                            ...formData,
                            jenisKelamin: selectedGender,
                            gedung: '',
                            noKamar: ''
                          });
                        }}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gedung <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gedung"
                        value={formData.gedung}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Gedung</option>
                        {formData.jenisKelamin === 'Laki-laki'
                          ? ['TB2', 'TB3'].map((gedung) => (
                            <option key={gedung} value={gedung}>
                              {gedung}
                            </option>
                          ))
                          : ['TB1', 'TB4', 'TB5'].map((gedung) => (
                            <option key={gedung} value={gedung}>
                              {gedung}
                            </option>
                          ))
                        }
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.jenisKelamin === 'Laki-laki' ? 'TB2 dan TB3 untuk mahasiswa' : 'TB1, TB4, dan TB5 untuk mahasiswi'}
                      </p>
                    </div>

                    {/* No Kamar */}
                    <div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

                    {/* Golongan UKT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Golongan UKT <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="golonganUKT"
                        value={formData.golonganUKT}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        {['1', '2', '3', '4', '5', '6', '7', '8'].map((golonganUKT) => (
                          <option key={golonganUKT} value={golonganUKT}>
                            Golongan {golonganUKT}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Tinggal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Tinggal <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        {['Aktif Tinggal', 'Checkout'].map((statusTinggal) => (
                          <option key={statusTinggal} value={statusTinggal}>
                            {statusTinggal}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Default: NIM atau 'mahasiswa123'
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </span>
                    ) : (
                      'Tambah Mahasiswa'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Judul */}
            <h1 className="text-2xl md:text-3xl font-bold">Data Mahasiswa</h1>

            {/* Search and Action Buttons */}
            <div className="w-full md:w-auto flex flex-col-reverse md:flex-row gap-3">
              {/* Search */}
              <div className="w-full md:w-64">
                <Search
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset ke halaman pertama saat mencari
                  }}
                  placeholder="Cari mahasiswa..."
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
                  <span>Tambah Mahasiswa</span>
                </button>
              </div>

      
            </div>
          </div>

          {/* Table Section */}
          <div className=" hidden overflow-x-auto md:block rounded-lg border">
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
                {currentItems.map((mahasiswa) => (
                  <tr
                    key={mahasiswa.id}
                    className="odd:bg-[#FDE9CC] even:bg-white"
                  >
                    {/* Table Cells */}
                    <td className="px-4 py-2 text-sm">{mahasiswa.nim}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.nama}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.prodi}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.gedung}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.noKamar}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.email}</td>
                    <td className="px-4 py-2 text-sm">
                      {formatTanggal(mahasiswa.tanggalLahir)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {mahasiswa.tempatLahir}
                    </td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.asal}</td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.status}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      {mahasiswa.golonganUKT}
                    </td>
                    <td className="px-4 py-2 text-sm">{mahasiswa.jenisKelamin}</td>

                    {/* Action Buttons */}
                    <ActionDropdown
                      mahasiswa={mahasiswa}
                      handleEdit={handleEdit}
                      handleTambahPelanggaran={handleTambahPelanggaran}
                      handleDelete={handleDelete}
                      showEdit={true}
                      showAddViolation={true}
                      showPrint={true}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

           {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {currentItems.length > 0 ? (
          currentItems.map((mahasiswa) => (
            <div key={mahasiswa.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800">{mahasiswa.nama}</h3>
                  <p className="text-xs text-gray-500 mt-1">NIM: {mahasiswa.nim}</p>
                </div>
                <div className="flex items-center">
                  <ActionDropdown
                    mahasiswa={mahasiswa}
                    handleEdit={handleEdit}
                    handleTambahPelanggaran={handleTambahPelanggaran}
                    handleDelete={handleDelete}
                    showEdit={true}
                    showAddViolation={true}
                    showPrint={true}
                    isMobile={true}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Program Studi</p>
                  <p className="font-medium">{mahasiswa.prodi}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{mahasiswa.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gedung/Kamar</p>
                  <p className="font-medium">{mahasiswa.gedung}/{mahasiswa.noKamar}</p>
                </div>
                <div>
                  <p className="text-gray-500">Golongan UKT</p>
                  <p className="font-medium">{mahasiswa.golonganUKT}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Kelamin</p>
                  <p className="font-medium">{mahasiswa.jenisKelamin}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium break-all">{mahasiswa.email}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            Tidak ada data mahasiswa
          </div>
        )}
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
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex flex-col justify-center items-start px-5 pt-5 pb-2 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-bold pb-2">
                    Form Edit Data Mahasiswa
                  </h3>
                  <p>Update Data Mahasiswa dengan Teliti</p>
                  <p
                    className={`${editErrorMessage ? 'py-3' : ''} text-red-500 font-semibold`}
                  >
                    {editErrorMessage}
                  </p>
                </div>
                <div className="relative p-6 flex-auto">
                  <form
                    className="grid grid-cols-2 gap-4"
                    onSubmit={(e) => handleSubmitEdit(e, dataEditMahasiswa.id)}
                  >
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                      <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          NIM
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.nim || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.nama || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.prodi || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.gedung || ''}
                          onChange={(e) => {
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
                              gedung: e.target.value,
                              noKamar: '' // Reset room selection when building changes
                            });
                          }}
                        >
                          <option value="">Pilih Gedung</option>
                          {dataEditMahasiswa.jenisKelamin === 'Laki-laki'
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
                      </div>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                      <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          No Kamar
                        </label>
                        <select
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.noKamar || ''}
                          onChange={(e) => {
                            const selectedRoom = availableRooms.find(
                              room => room.gedung === dataEditMahasiswa.gedung && room.nomorKamar === e.target.value
                            );
                            if (selectedRoom) {
                              setDataEditMahasiswa({
                                ...dataEditMahasiswa,
                                noKamar: selectedRoom.nomorKamar
                              });
                            }
                          }}
                          disabled={!dataEditMahasiswa.gedung} // Disable if no building is selected
                        >
                          <option value="">Pilih Kamar</option>
                          {availableRooms
                            .filter(room =>
                              room.gedung === dataEditMahasiswa.gedung && // Only show rooms for selected building
                              (room.terisi < room.kapasitas || // Show available rooms
                                room.nomorKamar === dataEditMahasiswa.noKamar) // Always show current room
                            )
                            .sort((a, b) => a.nomorKamar.localeCompare(b.nomorKamar))
                            .map(room => (
                              <option
                                key={room.nomorKamar}
                                value={room.nomorKamar}
                                disabled={room.terisi >= room.kapasitas && room.nomorKamar !== dataEditMahasiswa.noKamar}
                              >
                                {`${room.nomorKamar} (${room.terisi}/${room.kapasitas})`}
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Format: Nomor Kamar (Jumlah Penghuni/Kapasitas)
                        </p>
                      </div>

                      <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          Email
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          type="email"
                          value={dataEditMahasiswa.email || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.tempatLahir || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          type="date"
                          value={dataEditMahasiswa.tanggalLahir || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
                              tanggalLahir: e.target.value,
                            })
                          }
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Baris Bawah */}
                    <div className="col-span-2 space-y-4">
                      <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                          Asal
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.asal || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.golonganUKT || 1}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                          value={dataEditMahasiswa.status || ''}
                          onChange={(e) =>
                            setDataEditMahasiswa({
                              ...dataEditMahasiswa,
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
      <>
        {showPelanggaranForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-4">Tambah Pelanggaran</h2>
              <form onSubmit={handleSubmitPelanggaran}>
                <div className="mb-4">
                  <label className="block mb-2">NIM</label>
                  <input
                    type="text"
                    value={formData.nim}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Nama</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Gedung</label>
                  <input
                    type="text"
                    value={formData.gedung}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">No. Kamar</label>
                  <input
                    type="text"
                    value={formData.noKamar}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Tanggal Pelanggaran</label>
                  <input
                    type="date"
                    value={formData.tanggalPelanggaran || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalPelanggaran: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Keterangan</label>
                  <textarea
                    value={formData.keteranganPelanggaran}
                    onChange={(e) =>
                      setFormData({ ...formData, keteranganPelanggaran: e.target.value })
                    }
                    className="resize-none w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPelanggaranForm(false)}
                    className="bg-gray-500 text-white px-6 ml-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
      <ToastContainer limit={1} position="top-right" />
    </>
  );
};

export default DataMahasiswa;
