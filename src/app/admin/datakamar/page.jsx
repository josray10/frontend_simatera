'use client';

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  BuildingOffice2Icon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeading from '@/components/PageHeading';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';

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

// Update jumlah terisi berdasarkan data mahasiswa
useEffect(() => {
  const updateOccupancy = () => {
    try {
      const dataMahasiswa = JSON.parse(localStorage.getItem('dataMahasiswa') || '[]');
      
      const updatedRooms = rooms.map(room => {
        const occupants = dataMahasiswa.filter(
          mahasiswa => mahasiswa.nomorKamar === room.nomorKamar
        ).length;
        
        return {
          ...room,
          terisi: occupants,
          status: occupants >= room.kapasitas ? 'penuh' : 
                 room.status === 'perbaikan' ? 'perbaikan' : 'tersedia'
        };
      });

      if (updatedRooms.length > 0) {
        setRooms(updatedRooms);
        localStorage.setItem('dormRooms', JSON.stringify(updatedRooms));
      }
    } catch (error) {
      console.error('Error updating occupancy:', error);
    }
  };

  updateOccupancy();
}, []); // Jalankan sekali saat komponen mount

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

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">No Kamar</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Gedung</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Lantai</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Kapasitas</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Terisi</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Keterangan</th>
              <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map(room => (
              <tr key={room.id} className="odd:bg-[#FDE9CC] even:bg-white">
                <td className="px-4 py-2 text-sm">{room.nomorKamar}</td>
                <td className="px-4 py-2 text-sm">{room.gedung}</td>
                <td className="px-4 py-2 text-sm">{room.lantai}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'tersedia' ? 'bg-green-100 text-green-800' :
                    room.status === 'penuh' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{room.kapasitas}</td>
                <td className="px-4 py-2 text-sm">{room.terisi}</td>
                <td className="px-4 py-2 text-sm">{room.keterangan || '-'}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <PencilIcon className="h-5 w-5" />
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Kamar {selectedRoom?.id}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="penuh">Penuh</option>
                  <option value="perbaikan">Perbaikan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kapasitas</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={editForm.kapasitas}
                  onChange={(e) => setEditForm({...editForm, kapasitas: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {editForm.status === 'perbaikan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                  <textarea
                    value={editForm.keterangan}
                    onChange={(e) => setEditForm({...editForm, keterangan: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Simpan
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