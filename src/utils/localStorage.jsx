// Ambil data mahasiswa berdasarkan NIM
export const getDataMahasiswa = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('mahasiswaData');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

// Ambil data pelanggaran untuk admin
export const getDataPelanggaranAdmin = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('pelanggaranAdminData');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

// Simpan atau update data pelanggaran untuk admin
export const saveDataPelanggaranAdmin = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pelanggaranAdminData', JSON.stringify(data));
  }
};

// Simpan atau update data mahasiswa berdasarkan NIM
export const saveDataMahasiswa = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mahasiswaData', JSON.stringify(data));
    
    // Trigger custom event untuk memperbarui kapasitas kamar
    try {
      window.dispatchEvent(new Event('localStorageChange'));
    } catch (error) {
      console.error('Error dispatching localStorageChange event:', error);
    }
  }
};

// Hapus data mahasiswa berdasarkan NIM
export const clearDataMahasiswa = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mahasiswaData');
  }
};

// Ambil semua mahasiswa yang tersimpan
export const getAllMahasiswa = () => {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('mahasiswa_')
    );
    return keys.map((key) => JSON.parse(localStorage.getItem(key)));
  }
  return [];
};

// Fungsionalitas yang sama bisa diterapkan untuk Kasra, Pelanggaran, dan Pengumuman:
export const getDataKasra = () => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('kasraData');
      if (!data) return [];
      
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error('Error getting kasra data:', error);
      return [];
    }
  }
  return [];
}

export const saveDataKasra = (data) => {
  if (typeof window !== 'undefined') {
    try {
      // Pastikan data adalah array
      const dataToSave = Array.isArray(data) ? data : [];
      
      // Simpan ke localStorage
      localStorage.setItem('kasraData', JSON.stringify(dataToSave));
      
      // Trigger custom event untuk memperbarui kapasitas kamar
      try {
        window.dispatchEvent(new Event('localStorageChange'));
      } catch (error) {
        console.error('Error dispatching localStorageChange event:', error);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving kasra data:', error);
      return false;
    }
  }
  return false;
};

// Fungsi untuk data pelanggaran per mahasiswa
export const getDataPelanggaranMahasiswa = (nim) => {
  if (typeof window !== 'undefined') {
    const nimKey = String(nim); // pastikan nim adalah string
    const data = localStorage.getItem(`pelanggaranData_${nimKey}`);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const saveDataPelanggaranMahasiswa = (nim, data) => {
  if (typeof window !== 'undefined') {
    const nimKey = String(nim); // pastikan nim adalah string
    localStorage.setItem(`pelanggaranData_${nimKey}`, JSON.stringify(data));
  }
};

// Fungsi untuk data pelanggaran yang menunggu validasi admin
export const getPendingPelanggaran = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('pendingPelanggaran');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const savePendingPelanggaran = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingPelanggaran', JSON.stringify(data));
  }
};

export const addPendingPelanggaran = (pelanggaran) => {
  if (typeof window !== 'undefined') {
    const pendingData = getPendingPelanggaran();
    
    // Pastikan nim adalah string
    const nim = String(pelanggaran.nim || '');
    
    // Tambahkan status validasi dan timestamp
    const newPelanggaran = {
      ...pelanggaran,
      nim: nim, // Pastikan nim adalah string
      id: pelanggaran.id || generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: 'kasra'
    };
    
    // Simpan ke daftar pending
    savePendingPelanggaran([...pendingData, newPelanggaran]);
    
    return newPelanggaran;
  }
  return null;
};

export const validatePelanggaran = (pelanggaranId, isApproved) => {
  if (typeof window !== 'undefined') {
    const pendingData = getPendingPelanggaran();
    const pelanggaran = pendingData.find(item => item.id === pelanggaranId);
    
    if (!pelanggaran) return false;
    
    // Hapus dari daftar pending
    const updatedPendingData = pendingData.filter(item => item.id !== pelanggaranId);
    savePendingPelanggaran(updatedPendingData);
    
    if (isApproved) {
      // Jika disetujui, tambahkan ke data pelanggaran mahasiswa
      const nim = String(pelanggaran.nim); // Pastikan nim adalah string
      
      // Ambil data pelanggaran mahasiswa yang ada
      const existingViolations = getDataPelanggaranMahasiswa(nim);
      
      // Tambahkan pelanggaran yang divalidasi
      const updatedViolations = [
        ...existingViolations,
        {
          ...pelanggaran,
          status: 'validated',
          validatedAt: new Date().toISOString()
        }
      ];
      
      // Simpan kembali ke localStorage
      saveDataPelanggaranMahasiswa(nim, updatedViolations);
    }
    
    return true;
  }
  return false;
};

// Fungsi untuk data pengaduan per mahasiswa
export const getDataPengaduanMahasiswa = (nim) => {
  try {
    const data = localStorage.getItem(`pengaduan_${nim}`);
    if (!data) return [];
    
    const parsedData = JSON.parse(data);
    
    // Ensure all items have IDs and required fields
    return parsedData.map(item => ({
      ...item,
      id: item.id || uuidv4(),
      type: item.type || 'mahasiswa',
      createdAt: item.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error getting pengaduan data:', error);
    return [];
  }
};

export const saveDataPengaduanMahasiswa = (nim, data) => {
  try {
    // Ensure all items have necessary properties before saving
    const validatedData = data.map(item => ({
      ...item,
      id: item.id || uuidv4(),
      type: item.type || 'mahasiswa',
      createdAt: item.createdAt || new Date().toISOString()
    }));
    
    localStorage.setItem(`pengaduan_${nim}`, JSON.stringify(validatedData));
  } catch (error) {
    console.error('Error saving pengaduan data:', error);
  }
};

// Hapus data pengaduan mahasiswa berdasarkan NIM
export const clearDataPengaduan = (nim) => {
  if (typeof window !== 'undefined') {
    let mahasiswa = getDataMahasiswa(nim);
    if (mahasiswa) {
      delete mahasiswa.pengaduan;
      saveDataMahasiswa(nim, mahasiswa);
    }
  }
};

// Fungsi agregator untuk mengambil _semua_ data pelanggaran dari seluruh mahasiswa
export const getAllPelanggaran = () => {
  if (typeof window !== 'undefined') {
    // Ambil semua key di localStorage yang dimulai dengan "pelanggaranData_"
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('pelanggaranData_')
    );
    let allData = [];
    keys.forEach((key) => {
      // Periksa apakah key mengandung [object Object]
      if (key.includes('[object Object]')) {
        console.warn(`Skipping invalid key: ${key}`);
        return; // Skip key yang tidak valid
      }
      
      const data = localStorage.getItem(key);
      if (data) {
        try {
          // Pastikan data adalah string JSON yang valid
          if (typeof data === 'string' && data.trim().startsWith('[')) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              // Tambahkan key ke setiap item untuk menghindari duplikasi
              const dataWithKey = parsed.map((item) => ({
                ...item,
                storageKey: key, // Tambahkan key sebagai referensi
              }));
              // Hanya ambil data yang sudah tervalidasi atau tidak memiliki status
              const validatedData = dataWithKey.filter(item => !item.status || item.status === 'validated');
              allData = allData.concat(validatedData);
            }
          } else {
            console.warn(`Data for key ${key} is not a valid JSON array.`);
          }
        } catch (error) {
          console.error('Error parsing data for key', key, error);
        }
      } else {
        console.warn(`Data for key ${key} is undefined or null.`);
      }
    });
    return allData;
  }
  return [];
};

// Fungsi agregator untuk mengambil _semua_ data pengaduan dari seluruh mahasiswa
// Mengambil semua data pengaduan dari localStorage yang key-nya dimulai dengan "pengaduanData_"


// Contoh implementasi fungsi localStorage
// Function to get all pengaduan data from localStorage
export const getAllDataPengaduanMahasiswa = () => {
  try {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter keys that start with 'pengaduan_'
    const pengaduanKeys = keys.filter(key => key.startsWith('pengaduan_'));
    
    // Combine all pengaduan data into one array
    const allPengaduan = pengaduanKeys.reduce((acc, key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          // Add the NIM from the key to each item if not present
          const nim = key.replace('pengaduan_', '');
          const dataWithNIM = data.map(item => ({
            ...item,
            nim: item.nim || nim,
            type: item.type || 'mahasiswa',
            id: item.id || generateId()
          }));
          return [...acc, ...dataWithNIM];
        }
        return acc;
      } catch (e) {
        console.error(`Error parsing data for key ${key}:`, e);
        return acc;
      }
    }, []);

    return allPengaduan;
  } catch (error) {
    console.error('Error getting all pengaduan data:', error);
    return [];
  }
};

// Function to update specific pengaduan data
export const updatePengaduanStatus = (pengaduanId, newStatus) => {
  try {
    const keys = Object.keys(localStorage);
    const pengaduanKeys = keys.filter(key => key.startsWith('pengaduan_'));
    
    for (const key of pengaduanKeys) {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data)) {
        const updatedData = data.map(item => {
          if (item.id === pengaduanId) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        if (JSON.stringify(data) !== JSON.stringify(updatedData)) {
          localStorage.setItem(key, JSON.stringify(updatedData));
          return true; // Successfully updated
        }
      }
    }
    return false; // Pengaduan not found
  } catch (error) {
    console.error('Error updating pengaduan status:', error);
    return false;
  }
};

// Helper function to generate a simple ID if needed
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const getDataPengumuman = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('pengumumanData');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const saveDataPengumuman = (pengumuman) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pengumumanData', JSON.stringify(pengumuman));
  }
};

export const clearDataPengumuman = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pengumumanData');
  }
};

export const getDataJadwalKegiatan = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('jadwalKegiatan');
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const saveDataJadwalKegiatan = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jadwalKegiatan', JSON.stringify(data));
  }
};

export function clearLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
}

export const getDataPembayaran = (nim) => {
  const data = localStorage.getItem(`pembayaran_${nim}`);
  return data ? JSON.parse(data) : null; // Mengembalikan data pembayaran berdasarkan NIM
};

export const saveDataPembayaran = (nim, pembayaran) => {
  localStorage.setItem(`pembayaran_${nim}`, JSON.stringify(pembayaran)); // Menyimpan data pembayaran di localStorage
};

export const getDataKamar = () => {
  const dataKamar = localStorage.getItem('dataKamar');
  return dataKamar ? JSON.parse(dataKamar) : [];
};

export const saveDataKamar = (data) => {
  localStorage.setItem('dataKamar', JSON.stringify(data));
};

export const updateDataKamar = (dataKamar) => {
  localStorage.setItem('dataKamar', JSON.stringify(dataKamar));
};

const updatePasswordInMahasiswaData = (nim, newPassword) => {
  const storedData = localStorage.getItem('mahasiswaData');
  if (storedData) {
    const mahasiswaArray = JSON.parse(storedData);
    const updatedArray = mahasiswaArray.map((mhs) =>
      mhs.nim === nim ? { ...mhs, password: newPassword } : mhs
    );
    localStorage.setItem('mahasiswaData', JSON.stringify(updatedArray));
  }
};