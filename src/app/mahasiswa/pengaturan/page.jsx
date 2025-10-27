'use client';
import React, { useState, useEffect } from 'react';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      } else {
        setError('Tidak dapat menemukan data login.');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Terjadi kesalahan saat memuat data pengguna');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const validateForm = () => {
    if (!currentUser) {
      setError('Tidak dapat menemukan data login.');
      return false;
    }

    // Validasi password saat ini
    if (formData.currentPassword.trim() !== currentUser.password.trim()) {
      setError('Kata sandi saat ini tidak sesuai');
      return false;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Semua field harus diisi');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Kata sandi baru dan konfirmasi kata sandi tidak cocok');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (!currentUser) {
        throw new Error('Data login tidak ditemukan');
      }

      const newPassword = formData.newPassword.trim();

      // 1. Update data mahasiswa di mahasiswaData
      const mahasiswaData = JSON.parse(localStorage.getItem('mahasiswaData'));
      const updatedMahasiswaData = mahasiswaData.map(mahasiswa => 
        mahasiswa.nim === currentUser.nim 
          ? { ...mahasiswa, password: newPassword }
          : mahasiswa
      );
      localStorage.setItem('mahasiswaData', JSON.stringify(updatedMahasiswaData));

      // 2. Update data user yang sedang login
      const updatedUser = {
        ...currentUser,
        password: newPassword
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setCurrentUser(updatedUser);
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      console.log('Password berhasil diubah untuk:', currentUser.nim);
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Ubah Kata Sandi</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="currentPassword" 
            className="block text-sm font-medium text-gray-700"
          >
            Kata Sandi Saat Ini
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-gray-700"
          >
            Kata Sandi Baru
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Kata sandi berhasil diubah!
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {loading ? 'Memproses...' : 'Ubah Kata Sandi'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;