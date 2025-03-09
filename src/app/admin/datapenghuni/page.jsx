'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Select from '@/components/elements/Select';
import DataKasra from './datakasra'; // Import halaman Data Kasra
import DataMahasiswa from './datamahasiswa';
import PageHeading from '@/components/PageHeading';

const KelolaData = () => {
  const [categories, setCategories] = useState('Data Mahasiswa');

  const valueOption = [
    { value: 'DEFAULT', label: 'Pilih Kategori', disabled: 'disabled' },
    { value: 'Data Kasra', label: 'Data Kasra', disabled: '' },
    { value: 'Data Mahasiswa', label: 'Data Mahasiswa', disabled: '' },
  ];

  return (
    <div className="flex flex-col bg-[#F5F6FA] min-h-screen">
      {/* Header dan Dropdown Pilihan */}
      <div className="flex-1 flex flex-col">
        <PageHeading title={categories} />
        
        {/* Dropdown dengan margin responsif */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <Select
            className="w-full md:w-64 lg:w-72"
            selectedValue={categories}
            valueOption={valueOption}
            onChange={(e) => setCategories(e.target.value)}
          />
        </div>
        
        {/* Konten yang dipilih */}
        <div className="flex-1">
          {categories === 'Data Mahasiswa' ? <DataMahasiswa /> : <DataKasra />}
        </div>
      </div>
    </div>
  );
};

export default KelolaData;
