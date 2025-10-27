'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeading from '@/components/PageHeading';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { getDataMahasiswa } from '@/utils/localStorage';

// PDF Styles dan PaymentReceipt component tetap sama...

const DataPembayaranMahasiswa = () => {
  const { user } = useAuth();
  const [dataPembayaran, setDataPembayaran] = useState(null);
  const [dataMahasiswa, setDataMahasiswa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.nim) {
        try {
          setIsLoading(true);
          // Ambil data mahasiswa
          const savedData = getDataMahasiswa();
          const mahasiswa = savedData.find(item => item.nim === user.nim);

          if (mahasiswa) {
            setDataMahasiswa(mahasiswa);
            
            // Ambil data pembayaran dari localStorage
            const pembayaranData = JSON.parse(localStorage.getItem(`pembayaran_${user.nim}`)) || {
              statusPembayaran: 'Belum Lunas',
              periode: 'Semester 1',
              nominal: 1000000,
              metodePembayaran: '-',
              tanggalPembayaran: '-',
              catatan: '-'
            };

            setDataPembayaran(pembayaranData);
          } else {
            toast.error("Data mahasiswa tidak ditemukan!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Terjadi kesalahan saat mengambil data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex">
        <div className="flex-1 flex flex-col">
          <PageHeading title="Bukti Pembayaran" />
          <div className="p-6">
            <div className="animate-pulse bg-gray-100 rounded-lg p-4">
              Loading data pembayaran...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataMahasiswa || !dataPembayaran) {
    return (
      <div className="flex">
        <div className="flex-1 flex flex-col">
          <PageHeading title="Bukti Pembayaran" />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Data tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Bukti Pembayaran" />
        <div className="flex-1 p-6">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              dataPembayaran.statusPembayaran === 'Lunas'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              Status: {dataPembayaran.statusPembayaran}
            </span>
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b p-3 text-left">NIM</th>
                  <th className="border-b p-3 text-left">Nama</th>
                  <th className="border-b p-3 text-left">Gedung</th>
                  <th className="border-b p-3 text-left">Kamar</th>
                  <th className="border-b p-3 text-left">Status</th>
                  <th className="border-b p-3 text-left">Periode</th>
                  <th className="border-b p-3 text-left">Nominal</th>
                  <th className="border-b p-3 text-left">Metode</th>
                  <th className="border-b p-3 text-left">Tanggal</th>
                  <th className="border-b p-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border-b p-3">{dataMahasiswa.nim}</td>
                  <td className="border-b p-3">{dataMahasiswa.nama}</td>
                  <td className="border-b p-3">{dataMahasiswa.gedung}</td>
                  <td className="border-b p-3">{dataMahasiswa.noKamar}</td>
                  <td className="border-b p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dataPembayaran.statusPembayaran === 'Lunas'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dataPembayaran.statusPembayaran}
                    </span>
                  </td>
                  <td className="border-b p-3">{dataPembayaran.periode}</td>
                  <td className="border-b p-3">Rp. {dataPembayaran.nominal.toLocaleString()}</td>
                  <td className="border-b p-3">{dataPembayaran.metodePembayaran}</td>
                  <td className="border-b p-3">{dataPembayaran.tanggalPembayaran}</td>
                  <td className="border-b p-3">{dataPembayaran.catatan}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {dataPembayaran.statusPembayaran === 'Lunas' ? (
            <PDFDownloadLink
              document={<PaymentReceipt dataMahasiswa={dataMahasiswa} dataPembayaran={dataPembayaran} />}
              fileName={`bukti_pembayaran_${dataMahasiswa.nim}.pdf`}
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition-colors"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Menyiapkan dokumen...' : 'Cetak Bukti Pembayaran'
              }
            </PDFDownloadLink>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Silakan lakukan pembayaran sesuai dengan nominal yang tertera. Bukti pembayaran akan tersedia setelah status pembayaran diverifikasi.
              </p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default DataPembayaranMahasiswa;