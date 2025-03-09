'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeading from '@/components/PageHeading';
import { getDataMahasiswa, saveDataPembayaran } from '@/utils/localStorage';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import moment from 'moment-timezone';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';
import { FiEdit } from 'react-icons/fi';
import dayjs from 'dayjs';

const TABLE_HEAD = [
  'NIM',
  'Nama',
  'Gedung',
  'No Kamar',
  'Status Pembayaran',
  'Periode',
  'Nominal',
  'Metode Pembayaran',
  'Tanggal Pembayaran',
  'Catatan',
  'Aksi',
  ];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    borderBottom: 1,
    paddingBottom: 10,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 140,
  },
  value: {
    flex: 1,
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottom: 1,
    marginTop: 50,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});

const PaymentReceipt = ({ dataMahasiswa, dataPembayaran }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          src="/images/logoasrama.png" // Make sure to add your logo in the public folder
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>BUKTI PEMBAYARAN ASRAMA</Text>
          <Text style={styles.subtitle}>Institut Teknologi Sumatera</Text>
          <Text style={styles.subtitle}>Jl. Terusan Ryacudu, Way Huwi, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung 35365</Text>
        </View>
      </View>

      {/* Student Information */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Nama</Text>
          <Text style={styles.value}>: {dataMahasiswa.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NIM</Text>
          <Text style={styles.value}>: {dataMahasiswa.nim}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gedung</Text>
          <Text style={styles.value}>: {dataMahasiswa.gedung}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kamar</Text>
          <Text style={styles.value}>: {dataMahasiswa.noKamar}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Periode</Text>
          <Text style={styles.value}>: {dataPembayaran.periode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nominal</Text>
          <Text style={styles.value}>: Rp. {dataPembayaran.nominal.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status Pembayaran</Text>
          <Text style={styles.value}>: {dataPembayaran.statusPembayaran}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal Pembayaran</Text>
          <Text style={styles.value}>: {dataPembayaran.tanggalPembayaran || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Metode Pembayaran</Text>
          <Text style={styles.value}>: {dataPembayaran.metodePembayaran}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Catatan</Text>
          <Text style={styles.value}>: {dataPembayaran.catatan || '-'}</Text>
        </View>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text>Pembayar,</Text>
          <View style={styles.signatureLine} />
          <Text>{dataMahasiswa.nama}</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text>Petugas,</Text>
          <View style={styles.signatureLine} />
          <Text>(_________________)</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Dokumen ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah
      </Text>
    </Page>
  </Document>
);

const DataPembayaran = () => {
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const maxDate = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Filter data berdasarkan pencarian
  const getFilteredData = () => {
    let filteredData = dataPembayaran;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) => 
        item.nim.toLowerCase().includes(query) ||
        item.nama.toLowerCase().includes(query) ||
        item.gedung.toLowerCase().includes(query) ||
        item.noKamar.toLowerCase().includes(query) ||
        item.statusPembayaran.toLowerCase().includes(query) ||
        item.periode.toLowerCase().includes(query) ||
        item.metodePembayaran.toLowerCase().includes(query) ||
        (item.catatan && item.catatan.toLowerCase().includes(query))
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

  useEffect(() => {
    // Ambil data mahasiswa dari localStorage
    const mahasiswaData = getDataMahasiswa(); // Data mahasiswa yang sudah ada
    const existingPembayaran = mahasiswaData.map((mahasiswa) => {
      // Mengambil data pembayaran untuk setiap mahasiswa dari localStorage
      const pembayaranData = JSON.parse(localStorage.getItem(`pembayaran_${mahasiswa.nim}`)) || {};
      return {
        ...mahasiswa,
        statusPembayaran: pembayaranData.statusPembayaran || 'Belum Lunas',
        periode: pembayaranData.periode || 'Semester 1',
        nominal: pembayaranData.nominal || 1000000,
        metodePembayaran: pembayaranData.metodePembayaran || '',
        tanggalPembayaran: pembayaranData.tanggalPembayaran || '',
        catatan: pembayaranData.catatan || '',
      };
    });

    setDataPembayaran(existingPembayaran);
  }, []);

  // Fungsi untuk mengubah status pembayaran
  const handleStatusChange = (id, status) => {
    // Jika status diubah menjadi "Lunas", periksa apakah metode dan tanggal pembayaran sudah diisi
    if (status === 'Lunas') {
      const pembayaran = dataPembayaran.find(item => item.id === id);
      if (!pembayaran.metodePembayaran || pembayaran.metodePembayaran === '') {
        toast.error('Metode pembayaran harus diisi terlebih dahulu!');
        return;
      }
      if (!pembayaran.tanggalPembayaran || pembayaran.tanggalPembayaran === '') {
        toast.error('Tanggal pembayaran harus diisi terlebih dahulu!');
        return;
      }
    }

    const updatedData = dataPembayaran.map((item) =>
      item.id === id ? { ...item, statusPembayaran: status } : item
    );
    setDataPembayaran(updatedData);
    
    // Simpan perubahan ke localStorage
    const updatedItem = updatedData.find(item => item.id === id);
    if (updatedItem) {
      saveDataPembayaran(updatedItem.nim, updatedItem);
    }
    
    toast.success('Status pembayaran berhasil diperbarui!');
  };

  // Fungsi untuk mengupdate metode pembayaran
  const handleMetodeChange = (id, metode) => {
    setDataPembayaran(prev =>
      prev.map(item =>
        item.id === id ? { ...item, metodePembayaran: metode } : item
      )
    );
  };

  // Fungsi untuk mengupdate tanggal pembayaran
  const handleTanggalChange = (id, tanggal) => {
    setDataPembayaran(prev =>
      prev.map(item =>
        item.id === id ? { ...item, tanggalPembayaran: tanggal } : item
      )
    );
  };

  // Fungsi untuk mengupdate catatan pembayaran
  const handleCatatanChange = (id, catatan) => {
    setDataPembayaran(prev =>
      prev.map(item =>
        item.id === id ? { ...item, catatan: catatan } : item
      )
    );
  };

  // Fungsi untuk menyimpan pembayaran
  const handleFinalizePembayaran = (id) => {
    const pembayaran = dataPembayaran.find(item => item.id === id);

    // Validasi data pembayaran
    if (!pembayaran.metodePembayaran || pembayaran.metodePembayaran === '') {
      toast.error('Metode pembayaran harus diisi!');
      return;
    }

    if (!pembayaran.tanggalPembayaran || pembayaran.tanggalPembayaran === '') {
      toast.error('Tanggal pembayaran harus diisi!');
      return;
    }

    // Update status menjadi Lunas
    const updatedData = dataPembayaran.map(item =>
      item.id === id ? { ...item, statusPembayaran: 'Lunas' } : item
    );

    setDataPembayaran(updatedData);

    // Simpan ke localStorage
    const updatedItem = updatedData.find(item => item.id === id);
    if (updatedItem) {
      saveDataPembayaran(updatedItem.nim, updatedItem);
    }
    
    toast.success('Pembayaran berhasil difinalisasi!');
  };

  // Fungsi untuk mencetak bukti pembayaran
  

  const handleEdit = (pembayaran) => {
    setShowModal('edit');
    setEditData(pembayaran);
  };

  const handleSaveEdit = () => {
    // Implementasi penyimpanan perubahan data
    // ...
    setShowModal(null);
  };

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Pembayaran" />

        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Data Pembayaran</h1>
            <p className="text-gray-600">Kelola data pembayaran mahasiswa</p>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <Search
                placeholder="Cari berdasarkan NIM atau nama..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset ke halaman pertama saat mencari
                }}
              />
            </div>
          </div>

          {/* Table Section - Hanya tampil di layar medium ke atas */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                {TABLE_HEAD.map((item) => (
                    <th
                      key={item}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {item}
                    </th>
                ))}
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((pembayaran) => (
                  <tr
                    key={`${pembayaran.nim}_${pembayaran.tanggalPembayaran}`}
                    className="odd:bg-[#FDE9CC] even:bg-white"
                  >
                    <td className="px-4 py-2 text-sm">{pembayaran.nim}</td>
                    <td className="px-4 py-2 text-sm">{pembayaran.nama}</td>
                    <td className="px-4 py-2 text-sm">{pembayaran.gedung}</td>
                    <td className="px-4 py-2 text-sm">{pembayaran.noKamar}</td>
                    <td className="px-4 py-2 text-sm">
                      <select
                        value={pembayaran.statusPembayaran}
                        onChange={(e) => handleStatusChange(pembayaran.id, e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-sm">{pembayaran.periode}</td>
                    <td className="px-4 py-2 text-sm">{pembayaran.nominal.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      {pembayaran.statusPembayaran === 'Lunas' ? (
                        <span>{pembayaran.metodePembayaran}</span>
                      ) : (
                        <select
                          value={pembayaran.metodePembayaran}
                          onChange={(e) => handleMetodeChange(pembayaran.id, e.target.value)}
                          className="p-1 border rounded"
                        >
                          <option value="">-- Pilih Metode --</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Tunai">Tunai</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {pembayaran.statusPembayaran === 'Lunas' ? (
                        <span>{pembayaran.tanggalPembayaran}</span>
                      ) : (
                        <input
                          type="date"
                          value={pembayaran.tanggalPembayaran}
                          onChange={(e) => handleTanggalChange(pembayaran.id, e.target.value)}
                          className="p-1 border rounded"
                          max={maxDate}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <textarea
                        value={pembayaran.catatan}
                        onChange={(e) => handleCatatanChange(pembayaran.id, e.target.value)}
                        className="p-1 border rounded w-full"
                        rows="2"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {pembayaran.statusPembayaran === 'Lunas' ? (
                        <PDFDownloadLink
                          document={<PaymentReceipt dataMahasiswa={pembayaran} dataPembayaran={pembayaran} />}
                          fileName={`bukti_pembayaran_${pembayaran.nim}.pdf`}
                          className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          {({ blob, url, loading, error }) =>
                            loading ? 'Menyiapkan...' : 'Cetak Bukti'
                          }
                        </PDFDownloadLink>
                      ) : (
                        <button
                          onClick={() => handleFinalizePembayaran(pembayaran.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors text-sm"
                        >
                          Simpan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card View untuk Mobile dan Tablet - Hanya tampil di layar kecil */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentItems.map((pembayaran) => (
              <div 
                key={`${pembayaran.nim}_${pembayaran.tanggalPembayaran}`}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{pembayaran.nama}</h3>
                    <p className="text-sm text-gray-500">NIM: {pembayaran.nim}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(pembayaran)}
                    className="p-2 text-orange-600 hover:text-orange-900 rounded-full hover:bg-orange-50"
                    aria-label="Edit Pembayaran"
                  >
                    <FiEdit size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Gedung</p>
                    <p className="font-medium">{pembayaran.gedung}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kamar</p>
                    <p className="font-medium">{pembayaran.noKamar}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Periode</p>
                    <p className="font-medium">{pembayaran.periode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nominal</p>
                    <p className="font-medium">Rp. {pembayaran.nominal.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-3">
                  <div>
                    <p className="text-gray-500">Status Pembayaran</p>
                    <select
                      value={pembayaran.statusPembayaran}
                      onChange={(e) => handleStatusChange(pembayaran.id, e.target.value)}
                      className="mt-1 p-2 border rounded w-full"
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    {pembayaran.statusPembayaran === 'Lunas' ? (
                      <p className="font-medium">{pembayaran.metodePembayaran}</p>
                    ) : (
                      <select
                        value={pembayaran.metodePembayaran}
                        onChange={(e) => handleMetodeChange(pembayaran.id, e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                      >
                        <option value="">-- Pilih Metode --</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Tunai">Tunai</option>
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Tanggal Pembayaran</p>
                    {pembayaran.statusPembayaran === 'Lunas' ? (
                      <p className="font-medium">{pembayaran.tanggalPembayaran}</p>
                    ) : (
                      <input
                        type="date"
                        value={pembayaran.tanggalPembayaran}
                        onChange={(e) => handleTanggalChange(pembayaran.id, e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        max={maxDate}
                      />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Catatan</p>
                    <textarea
                      value={pembayaran.catatan}
                      onChange={(e) => handleCatatanChange(pembayaran.id, e.target.value)}
                      className="mt-1 p-2 border rounded w-full"
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  {pembayaran.statusPembayaran === 'Lunas' ? (
                      <PDFDownloadLink
                      document={<PaymentReceipt dataMahasiswa={pembayaran} dataPembayaran={pembayaran} />}
                      fileName={`bukti_pembayaran_${pembayaran.nim}.pdf`}
                      className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full text-center"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? 'Menyiapkan dokumen...' : 'Cetak Bukti Pembayaran'
                        }
          </PDFDownloadLink>
                    ) : (
                      <button
                      onClick={() => handleFinalizePembayaran(pembayaran.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full"
                      >
                        Simpan Pembayaran
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dengan margin responsif */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Edit Modal dengan padding responsif */}
          {showModal === 'edit' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto">
                <h3 className="text-lg font-medium mb-4">Edit Pembayaran</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                    <input
                      type="text"
                      value={editData.nim}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={editData.nama}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                    <input
                      type="date"
                      value={dayjs(editData.tanggalPembayaran).format('YYYY-MM-DD')}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          tanggalPembayaran: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembayaran</label>
                    <input
                      type="number"
                      value={editData.nominal}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nominal: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                    <select
                      value={editData.statusPembayaran}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          statusPembayaran: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Cicilan">Cicilan</option>
                    </select>
                  </div>
                  
                  {errorMessage && (
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default DataPembayaran;
