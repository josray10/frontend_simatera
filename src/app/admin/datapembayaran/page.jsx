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
    const updatedData = dataPembayaran.map((item) =>
      item.id === id ? { ...item, statusPembayaran: status } : item
    );
    setDataPembayaran(updatedData);
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

    if (!pembayaran.tanggalPembayaran || !pembayaran.metodePembayaran) {
      toast.error('Tanggal pembayaran dan metode pembayaran harus diisi!');
      return;
    }

    // Update status pembayaran menjadi 'Lunas' dan simpan ke localStorage
    const updatedData = dataPembayaran.map(item =>
      item.id === id
        ? { ...item, statusPembayaran: 'Lunas' }
        : item
    );

    setDataPembayaran(updatedData);

    // Simpan data pembayaran ke localStorage per mahasiswa
    const pembayaranData = {
      statusPembayaran: 'Lunas',
      periode: pembayaran.periode,
      nominal: pembayaran.nominal,
      metodePembayaran: pembayaran.metodePembayaran,
      tanggalPembayaran: pembayaran.tanggalPembayaran,
      catatan: pembayaran.catatan,
    };

    localStorage.setItem(`pembayaran_${pembayaran.nim}`, JSON.stringify(pembayaranData));
    toast.success('Pembayaran berhasil ditambahkan!');
  };

  // Fungsi untuk mencetak bukti pembayaran
  

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Pembayaran" />

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
                placeholder="Cari pembayaran..."
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full">
          <thead className="bg-gray-50">
              <tr>
                {TABLE_HEAD.map((item) => (
                  <th key={item} className="px-4 py-2 text-sm">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className="odd:bg-[#FDE9CC] even:bg-white">
                  <td className="px-4 py-2 text-sm">{item.nim}</td>
                  <td className="px-4 py-2 text-sm">{item.nama}</td>
                  <td className="px-4 py-2 text-sm">{item.gedung}</td>
                  <td className="px-4 py-2 text-sm">{item.noKamar}</td>
                  <td className="px-4 py-2 text-sm">
                    <select
                      value={item.statusPembayaran}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="p-1 border"
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.periode}</td>
                  <td className="px-4 py-2 text-sm">Rp. {item.nominal.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">
                    {item.statusPembayaran === 'Lunas' ? (
                      <span>{item.metodePembayaran}</span>
                    ) : (
                      <select
                        value={item.metodePembayaran}
                        onChange={(e) => handleMetodeChange(item.id, e.target.value)}
                        className="p-1 border"
                      >
                        <option value="">-- Pilih Metode --</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Tunai">Tunai</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {item.statusPembayaran === 'Lunas' ? (
                      <span>{item.tanggalPembayaran}</span>
                    ) : (
                      <input
                        type="date"
                        value={item.tanggalPembayaran}
                        onChange={(e) => handleTanggalChange(item.id, e.target.value)}
                        className="p-1 border"
                        max={maxDate}
                        
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <textarea
                      value={item.catatan}
                      onChange={(e) => handleCatatanChange(item.id, e.target.value)}
                      className="p-1 border"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {item.statusPembayaran === 'Lunas' ? (
                      <PDFDownloadLink
                        document={<PaymentReceipt dataMahasiswa={item} dataPembayaran={item} />}
                        fileName={`bukti_pembayaran_${item.nim}.pdf`}
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition-colors"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? 'Menyiapkan dokumen...' : 'Cetak Bukti Pembayaran'
                        }
          </PDFDownloadLink>
                    ) : (
                      <button
                        onClick={() => handleFinalizePembayaran(item.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Simpan Pembayaran
                      </button>
                    )}
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
          
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DataPembayaran;
