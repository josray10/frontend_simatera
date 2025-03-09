'use client';

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  BuildingOffice2Icon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeading from '@/components/PageHeading';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';
import { getDataMahasiswa, getDataKasra } from '@/utils/localStorage';

// Konfigurasi Gedung Asrama
const DORM_BUILDINGS = [
  { id: 'TB1', name: 'TB1', gender: 'Perempuan' },
  { id: 'TB2', name: 'TB2', gender: 'Laki-laki' },
  { id: 'TB3', name: 'TB3', gender: 'Laki-laki' },
  { id: 'TB4', name: 'TB4', gender: 'Perempuan' },
  { id: 'TB5', name: 'TB5', gender: 'Perempuan' }
];

const DataKamar = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState({
    status: '',
    kapasitas: 4,
    keterangan: ''
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [roomOccupants, setRoomOccupants] = useState({ mahasiswa: [], kasra: [] });

  // Generate nomor kamar dengan format: LantaiNomorKamar (contoh: 5101)
  const generateRoomNumber = (buildingIndex, floor, roomNum) => {
    return `${buildingIndex}${floor}${roomNum.toString().padStart(2, '0')}`;
  };

  // Filter rooms berdasarkan gedung yang dipilih dan query pencarian
  const getFilteredRooms = () => {
    let filteredRooms = rooms;
    
    // Filter berdasarkan gedung yang dipilih
    if (selectedBuilding !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.gedung === selectedBuilding);
    }
    
    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredRooms = filteredRooms.filter(room => 
        room.nomorKamar.toLowerCase().includes(query) ||
        room.gedung.toLowerCase().includes(query) ||
        room.status.toLowerCase().includes(query) ||
        (room.keterangan && room.keterangan.toLowerCase().includes(query))
      );
    }
    
    return filteredRooms;
  };

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(getFilteredRooms().length / itemsPerPage);

  // Dapatkan data untuk halaman saat ini dari data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getFilteredRooms().slice(indexOfFirstItem, indexOfLastItem);

  // Generate data kamar awal
  const generateInitialRooms = () => {
    try {
      const roomsList = [];
      DORM_BUILDINGS.forEach((building, index) => {
        const buildingIndex = index + 1;
        for (let floor = 1; floor <= 5; floor++) {
          for (let room = 1; room <= 20; room++) {
            const roomNumber = generateRoomNumber(buildingIndex, floor, room);
            roomsList.push({
              id: roomNumber,
              gedung: building.id,
              lantai: floor,
              nomorKamar: roomNumber,
              status: 'tersedia',
              kapasitas: 4,
              terisi: 0,
              keterangan: ''
            });
          }
        }
      });
  
      if (roomsList.length === 0) {
        throw new Error('Failed to generate rooms');
      }
  
      return roomsList;
    } catch (error) {
      console.error('Error generating initial rooms:', error);
      return [];
    }
  };

  // Inisialisasi data kamar
useEffect(() => {
  try {
    const savedRooms = localStorage.getItem('dormRooms');
    
    if (savedRooms && JSON.parse(savedRooms).length > 0) {
      setRooms(JSON.parse(savedRooms));
    } else {
      const initialRooms = generateInitialRooms();
      setRooms(initialRooms);
      localStorage.setItem('dormRooms', JSON.stringify(initialRooms));
    }
  } catch (error) {
    console.error('Error initializing rooms:', error);
    const initialRooms = generateInitialRooms();
    setRooms(initialRooms);
    localStorage.setItem('dormRooms', JSON.stringify(initialRooms));
  }
}, []); // Jalankan sekali saat komponen mount

// Update occupancy ketika ada perubahan data mahasiswa atau kasra
useEffect(() => {
  const updateOccupancy = () => {
    try {
      const dataMahasiswa = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
      const dataKasra = JSON.parse(localStorage.getItem('kasraData') || '[]');
      
      // Debug log
      console.log('Data Mahasiswa:', dataMahasiswa);
      console.log('Data Kasra:', dataKasra);

      if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        console.log('Rooms data is empty or invalid, skipping update');
        return;
      }

      const updatedRooms = rooms.map(room => {
        if (!room || typeof room !== 'object') {
          console.error('Invalid room object:', room);
          return room;
        }

        // Pastikan properti yang dibutuhkan ada
        const gedung = room.gedung || '';
        const nomorKamar = room.nomorKamar || '';
        const kapasitas = room.kapasitas || 4;
        const status = room.status || 'tersedia';
        
        // Hitung penghuni kasra yang aktif
        const kasraCount = Array.isArray(dataKasra) ? dataKasra.filter(
          kasra => 
            kasra && 
            kasra.gedung === gedung && 
            kasra.noKamar === nomorKamar &&
            kasra.status === 'Aktif Tinggal'
        ).length : 0;

        // Hitung penghuni mahasiswa yang aktif
        const mahasiswaCount = Array.isArray(dataMahasiswa) ? dataMahasiswa.filter(
          mahasiswa => 
            mahasiswa && 
            mahasiswa.gedung === gedung && 
            mahasiswa.noKamar === nomorKamar &&
            mahasiswa.status === 'Aktif Tinggal'
        ).length : 0;

        const totalOccupants = kasraCount + mahasiswaCount;
        
        // Debug log untuk setiap kamar
        console.log(`Kamar ${gedung}-${nomorKamar}:`, {
          kasraCount,
          mahasiswaCount,
          totalOccupants,
          kapasitas
        });

        // Validasi kapasitas
        if (totalOccupants > kapasitas) {
          console.warn(`Kamar ${nomorKamar} melebihi kapasitas`);
        }

        // Tentukan status kamar berdasarkan occupancy dan status saat ini
        let newStatus = status;
        if (status !== 'perbaikan') {
          newStatus = totalOccupants >= kapasitas ? 'penuh' : 'tersedia';
        }

        return {
          ...room,
          penghuniKasra: kasraCount,
          penghuniMahasiswa: mahasiswaCount,
          terisi: totalOccupants,
          status: newStatus
        };
      });

      // Hanya update jika ada perubahan
      const hasChanges = JSON.stringify(updatedRooms) !== JSON.stringify(rooms);
      if (hasChanges) {
        console.log('Updating rooms with new occupancy data');
        setRooms(updatedRooms);
        localStorage.setItem('dormRooms', JSON.stringify(updatedRooms));
      } else {
        console.log('No changes in room occupancy');
      }
    } catch (error) {
      console.error('Error updating occupancy:', error);
      toast.error('Gagal memperbarui data hunian kamar');
    }
  };

  // Update ketika komponen mount dan ketika ada perubahan rooms
  updateOccupancy();

  // Tambahkan event listener untuk perubahan localStorage
  const handleStorageChange = (e) => {
    if (e.key === 'mahasiswaData' || e.key === 'kasraData') {
      console.log('Storage changed:', e.key);
      updateOccupancy();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Tambahkan custom event listener untuk menangkap perubahan yang terjadi di tab yang sama
  const handleCustomStorageChange = () => {
    console.log('Custom storage event triggered');
    updateOccupancy();
  };

  window.addEventListener('localStorageChange', handleCustomStorageChange);

  // Cleanup event listener
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('localStorageChange', handleCustomStorageChange);
  };
}, [rooms]); // Tambahkan rooms sebagai dependency

  // Hitung statistik kamar
  const calculateStats = () => {
    const filteredRooms = selectedBuilding === 'all' 
      ? rooms 
      : rooms.filter(room => room.gedung === selectedBuilding);

    return {
      total: filteredRooms.length,
      tersedia: filteredRooms.filter(room => room.status === 'tersedia').length,
      terisi: filteredRooms.filter(room => room.terisi > 0).length,
      perbaikan: filteredRooms.filter(room => room.status === 'perbaikan').length,
      totalKapasitas: filteredRooms.reduce((sum, room) => sum + room.kapasitas, 0),
      totalTerisi: filteredRooms.reduce((sum, room) => sum + room.terisi, 0)
    };
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setEditForm({
      status: room.status,
      kapasitas: room.kapasitas,
      keterangan: room.keterangan || ''
    });
    setShowEditModal(true);
  };

  // Save room changes
  const handleSaveRoom = () => {
    // Validation checks
    if (!selectedRoom || !editForm) {
      toast.error('Data tidak valid');
      return;
    }
  
    try {
      // Get existing data first
      const existingRooms = JSON.parse(localStorage.getItem('dormRooms')) || [];
      
      // Create updated rooms array
      const updatedRooms = existingRooms.map(room => {
        if (room.id === selectedRoom.id) {
          // Create updated room object
          const updatedRoom = {
            ...room,
            status: editForm.status,
            kapasitas: editForm.kapasitas,
            keterangan: editForm.keterangan,
          };
  
          // Update status based on capacity and current occupancy
          if (editForm.status === 'perbaikan') {
            updatedRoom.status = 'perbaikan';
          } else if (room.terisi >= editForm.kapasitas) {
            updatedRoom.status = 'penuh';
          } else {
            updatedRoom.status = 'tersedia';
          }
  
          return updatedRoom;
        }
        return room;
      });
  
      // Verify the update was successful
      if (updatedRooms.length === 0) {
        throw new Error('Update resulted in empty data');
      }
  
      // Save to state and localStorage
      setRooms(updatedRooms);
      localStorage.setItem('dormRooms', JSON.stringify(updatedRooms));
      
      setShowEditModal(false);
      toast.success('Data kamar berhasil diperbarui');
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
      
      // Attempt to restore data if it was accidentally cleared
      const currentRooms = JSON.parse(localStorage.getItem('dormRooms'));
      if (!currentRooms || currentRooms.length === 0) {
        localStorage.setItem('dormRooms', JSON.stringify(rooms));
      }
    }
  };

  // Fungsi untuk menampilkan detail penghuni kamar
  const handleShowDetail = (room) => {
    try {
      const dataMahasiswa = JSON.parse(localStorage.getItem('mahasiswaData') || '[]');
      const dataKasra = JSON.parse(localStorage.getItem('kasraData') || '[]');
      
      // Filter penghuni berdasarkan gedung dan nomor kamar
      const mahasiswaPenghuni = dataMahasiswa.filter(
        mahasiswa => 
          mahasiswa.gedung === room.gedung && 
          mahasiswa.noKamar === room.nomorKamar
      );
      
      const kasraPenghuni = dataKasra.filter(
        kasra => 
          kasra.gedung === room.gedung && 
          kasra.noKamar === room.nomorKamar
      );

      
      setRoomOccupants({
        mahasiswa: mahasiswaPenghuni,
        kasra: kasraPenghuni
      });
      
      setSelectedRoomDetail(room);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching room occupants:', error);
      toast.error('Gagal memuat data penghuni kamar');
    }
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500">Loading data kamar...</p>
          <button 
            onClick={() => {
              const initialRooms = generateInitialRooms();
              setRooms(initialRooms);
              localStorage.setItem('dormRooms', JSON.stringify(initialRooms));
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reset Data Kamar
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="flex bg-[#F5F6FA]">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Kamar" />

        <div className="flex-1 p-6">
          {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Kamar</p>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Kapasitas: {stats.totalKapasitas}</p>
            </div>
            <BuildingOffice2Icon className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kamar Tersedia</p>
              <p className="text-2xl font-bold">{stats.tersedia}</p>
              <p className="text-sm text-gray-500">Siap Huni</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kamar Terisi</p>
              <p className="text-2xl font-bold">{stats.terisi}</p>
              <p className="text-sm text-gray-500">Penghuni: {stats.totalTerisi}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dalam Perbaikan</p>
              <p className="text-2xl font-bold">{stats.perbaikan}</p>
              <p className="text-sm text-gray-500">Maintenance</p>
            </div>
            <WrenchScrewdriverIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedBuilding('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedBuilding === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semua Gedung
          </button>
          {DORM_BUILDINGS.map(building => (
            <button
              key={building.id}
              onClick={() => setSelectedBuilding(building.id)}
              className={`px-4 py-2 rounded-lg ${
                selectedBuilding === building.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {building.name} ({building.gender})
            </button>
          ))}
        </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Search */}
        <div className="w-full md:w-64">
          <Search
            value={searchQuery}
            onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset ke halaman pertama saat mencari
                  }}
            placeholder="Cari kamar..."
          />
        </div>
      </div>

      {/* Table Section - Hidden on Mobile */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gedung</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lantai</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasitas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.gedung}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.nomorKamar}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.lantai}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    room.status === 'tersedia' ? 'bg-green-100 text-green-800' :
                    room.status === 'penuh' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.terisi}/{room.kapasitas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.keterangan || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleShowDetail(room)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Lihat Penghuni"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Edit Kamar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card View - Shown only on smaller screens */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentItems.map(room => (
          <div key={room.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{room.gedung} - {room.nomorKamar}</h3>
                <p className="text-sm text-gray-500">Lantai {room.lantai}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleShowDetail(room)}
                  className="p-2 text-orange-600 hover:text-orange-900 rounded-full hover:bg-orange-50"
                  title="Lihat Penghuni"
                >
                  <UserGroupIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEditRoom(room)}
                  className="p-2 text-orange-600 hover:text-orange-900 rounded-full hover:bg-orange-50"
                  title="Edit Kamar"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                  room.status === 'tersedia' ? 'bg-green-100 text-green-800' :
                  room.status === 'penuh' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {room.status}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Kapasitas</p>
                <p className="font-medium mt-1">{room.terisi}/{room.kapasitas}</p>
              </div>
            </div>

            {room.keterangan && (
              <div className="mt-2 text-sm">
                <p className="text-gray-500">Keterangan:</p>
                <p className="text-gray-700">{room.keterangan}</p>
              </div>
            )}
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

      {/* Edit Modal with responsive padding */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto">
            <h3 className="text-lg font-medium mb-4">Edit Kamar {selectedRoom?.nomorKamar}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="penuh">Penuh</option>
                  <option value="perbaikan">Perbaikan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={editForm.kapasitas}
                  onChange={(e) => setEditForm({...editForm, kapasitas: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {editForm.status === 'perbaikan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={editForm.keterangan}
                    onChange={(e) => setEditForm({...editForm, keterangan: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Masukkan keterangan perbaikan..."
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Penghuni Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Penghuni Kamar {selectedRoomDetail?.gedung}-{selectedRoomDetail?.nomorKamar}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <InformationCircleIcon className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium">Informasi Kamar</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p><span className="font-medium">Status:</span> {selectedRoomDetail?.status}</p>
                <p><span className="font-medium">Kapasitas:</span> {selectedRoomDetail?.terisi}/{selectedRoomDetail?.kapasitas}</p>
                {selectedRoomDetail?.keterangan && (
                  <p><span className="font-medium">Keterangan:</span> {selectedRoomDetail.keterangan}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Daftar Mahasiswa */}
              <div>
                <h4 className="text-sm font-medium mb-2">Mahasiswa ({roomOccupants.mahasiswa.length})</h4>
                {roomOccupants.mahasiswa.length > 0 ? (
                  <div className="space-y-2">
                    {roomOccupants.mahasiswa.map((mahasiswa) => (
                      <div key={mahasiswa.nim} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{mahasiswa.nama}</p>
                        <p className="text-sm text-gray-500">NIM: {mahasiswa.nim}</p>
                        <p className="text-sm text-gray-500">Prodi: {mahasiswa.prodi || '-'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada mahasiswa yang menempati kamar ini</p>
                )}
              </div>
              
              {/* Daftar Kasra */}
              <div>
                <h4 className="text-sm font-medium mb-2">Kasra ({roomOccupants.kasra.length})</h4>
                {roomOccupants.kasra.length > 0 ? (
                  <div className="space-y-2">
                    {roomOccupants.kasra.map((kasra) => (
                      <div key={kasra.id} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{kasra.nama}</p>
                        <p className="text-sm text-gray-500">NIM: {kasra.nim}</p>
                        <p className="text-sm text-gray-500">Prodi: {kasra.prodi   || '-'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada kasra yang menempati kamar ini</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
        
        </div>
      </div>

      
    </div>
  );
};

export default DataKamar;