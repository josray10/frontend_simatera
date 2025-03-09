'use client';
import { useEffect, useState } from 'react';
import {
  getDataPelanggaranMahasiswa,
  saveDataPelanggaranMahasiswa,
} from '@/utils/localStorage';
import dayjs from 'dayjs';
import { useAuth } from '@/utils/AuthContext';
import PageHeading from '@/components/PageHeading';

import { FiEdit } from 'react-icons/fi';

const TABLE_HEAD = [
  'NIM',
  'Nama',
  'Gedung',
  'No Kamar',
  'Tanggal Pelanggaran',
  'Keterangan Pelanggaran',
];

const DataPelanggaran = () => {
  const { user } = useAuth();
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    if (user && user.nim) {
      const data = getDataPelanggaranMahasiswa(user.nim);
      setPelanggaranList(data);
    }
  }, [user]);

  // Format tanggal untuk tampilan
  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    return dayjs(tanggal, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('DD/MM/YYYY');
  };

  return (
    <div className="flex-1 flex flex-col">
      <PageHeading title="Data Pelanggaran" />
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Data Pelanggaran</h1>
          <p className="text-gray-600">Riwayat pelanggaran yang telah Anda lakukan</p>
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pelanggaranList.length > 0 ? (
                pelanggaranList.map((item, index) => (
                  <tr
                    key={index}
                    className="odd:bg-[#FDE9CC] even:bg-white"
                  >
                    <td className="px-4 py-3 text-sm">{item.nim}</td>
                    <td className="px-4 py-3 text-sm">{item.nama}</td>
                    <td className="px-4 py-3 text-sm">{item.gedung || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.noKamar || '-'}</td>
                    <td className="px-4 py-3 text-sm">{formatTanggal(item.tanggalPelanggaran)}</td>
                    <td className="px-4 py-3 text-sm">{item.keteranganPelanggaran || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-4 py-3 text-sm text-center text-gray-500">
                    Tidak ada data pelanggaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Shown only on smaller screens */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {pelanggaranList.length > 0 ? (
            pelanggaranList.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{item.nama}</h3>
                  <p className="text-sm text-gray-500">NIM: {item.nim}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Gedung</p>
                    <p className="font-medium">{item.gedung || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kamar</p>
                    <p className="font-medium">{item.noKamar || '-'}</p>
                  </div>
                </div>
                
                <div className="text-sm mb-3">
                  <p className="text-gray-500">Tanggal Pelanggaran</p>
                  <p className="font-medium">{formatTanggal(item.tanggalPelanggaran)}</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-500">Keterangan Pelanggaran</p>
                  <p className="font-medium">{item.keteranganPelanggaran || '-'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md text-center text-gray-500">
              Tidak ada data pelanggaran
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPelanggaran;
