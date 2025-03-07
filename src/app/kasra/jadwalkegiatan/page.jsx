'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getDataJadwalKegiatan,
  saveDataJadwalKegiatan,
} from '@/utils/localStorage';
import PageHeading from '@/components/PageHeading';

const CreateJadwalKegiatan = () => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState(null);
  const [jadwalKegiatan, setjadwalKegiatan] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setjadwalKegiatan(getDataJadwalKegiatan());
  }, []);

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('File harus berformat PDF atau Word!');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB!');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      // Convert file to base64 for localStorage
      const reader = new FileReader();
      reader.onload = () => {
        setFile({
          name: selectedFile.name,
          type: selectedFile.type,
          data: reader.result,
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      e.target.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!judul || !deskripsi) {
      toast.error('Judul dan deskripsi harus diisi!');
      return;
    }

    let updatedJadwalKegiatan;
    if (editId) {
      updatedJadwalKegiatan = jadwalKegiatan.map((item) =>
        item.id === editId
          ? {
              ...item,
              judul,
              deskripsi,
              file: file || item.file, // Keep existing file if no new file uploaded
            }
          : item
      );
      setEditId(null);
      toast.success('Jadwal Kegiatan berhasil diperbarui!');
    } else {
      const newjadwalKegiatan = {
        id: Date.now(),
        judul,
        deskripsi,
        tanggal: new Date().toLocaleDateString(),
        file: file,
      };
      updatedJadwalKegiatan = [...jadwalKegiatan, newjadwalKegiatan];
      toast.success('jadwalKegiatan berhasil dibuat!');
    }

    saveDataJadwalKegiatan(updatedJadwalKegiatan);
    setjadwalKegiatan(updatedJadwalKegiatan);
    setJudul('');
    setDeskripsi('');
    setFile(null);
  };

  const handleDownload = (fileData) => {
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (id) => {
    const item = jadwalKegiatan.find((p) => p.id === id);
    if (item) {
      setJudul(item.judul);
      setDeskripsi(item.deskripsi);
      setFile(item.file);
      setEditId(id);
    }
  };

  const handleDelete = (id) => {
    const updatedJadwalKegiatan = jadwalKegiatan.filter((p) => p.id !== id);
    saveDataJadwalKegiatan(updatedJadwalKegiatan);
    setjadwalKegiatan(updatedJadwalKegiatan);
    toast.success('JadwalKegiatan berhasil dihapus!');
  };

  return (
    <div className="flex bg-[#F5F6FA]">
      <div className="flex-1 flex flex-col">
        <PageHeading title="Jadwal Kegiatan" />

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">
            {editId ? 'Edit Jadwal Kegiatan' : 'Buat Jadwal Kegiatan'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                rows="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload File (PDF/Word, max 5MB)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              />
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  File terpilih: {file.name}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                {editId ? 'Update Jadwal Kegiatan' : 'Buat Jadwal Kegiatan'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setJudul('');
                    setDeskripsi('');
                    setFile(null);
                    setEditId(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Daftar Jadwal Kegiatan</h2>
            <div className="space-y-3">
              {jadwalKegiatan.length > 0 ? (
                jadwalKegiatan.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold">{item.judul}</h3>
                    <p className="text-sm text-gray-500 mb-1">{item.tanggal}</p>
                    <p className="text-gray-700">{item.deskripsi}</p>
                    {item.file && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleDownload(item.file)}
                          className="text-blue-500 hover:underline flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download {item.file.name}
                        </button>
                      </div>
                    )}
                    <div className="mt-2 flex gap-4">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada jadwal kegiatan.</p>
              )}
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CreateJadwalKegiatan;
