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
    <div className="flex bg-[#F5F6FA]">
      {/* Dropdown Pilihan */}
      <div className="flex-1 flex flex-col">
        <PageHeading title="Data Mahasiswa" />
        <div className="mt-4">
          {' '}
          {/* Tambahin margin atas */}
          <Select
            className="w-full ml-5"
            selectedValue={categories}
            valueOption={valueOption}
            onChange={(e) => setCategories(e.target.value)}
          />
        </div>
        {/* Konten yang dipilih */}
        {categories === 'Data Mahasiswa' ? <DataMahasiswa /> : <DataKasra />}
      </div>
    </div>
  );
};

export default KelolaData;
