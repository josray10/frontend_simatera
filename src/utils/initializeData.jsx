// src/utils/initializeData.js
import {
    saveDataKamar, saveDataMahasiswa, saveDataKasra, saveDataPembayaran,
    saveDataPelanggaranMahasiswa, savePendingPelanggaran, saveDataPengaduanMahasiswa,
    saveDataPengumuman, saveDataJadwalKegiatan
} from './localStorage';

const INITIALIZATION_KEY = 'simatera_initialized_json'; // Key untuk menandai inisialisasi

// Helper function to fetch JSON data
const fetchDummyData = async (fileName) => {
    try {
        const response = await fetch(`/dummyData/${fileName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}.json: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading dummy data ${fileName}:`, error);
        return null;
    }
};

export const initializeLocalStorageDataFromJson = async () => {
    if (typeof window === 'undefined') return;

    const isInitialized = localStorage.getItem(INITIALIZATION_KEY);

    if (!isInitialized) {
        console.log("Initializing dummy data from JSON files in localStorage...");

        try {
            // Kamar
            const kamarData = await fetchDummyData('kamar');
            if (kamarData && (!localStorage.getItem('dataKamar') || JSON.parse(localStorage.getItem('dataKamar') || '[]').length === 0)) {
                saveDataKamar(kamarData); console.log("Kamar initialized.");
            }

            // Mahasiswa
            const mahasiswaData = await fetchDummyData('mahasiswa');
            if (mahasiswaData && (!localStorage.getItem('mahasiswaData') || JSON.parse(localStorage.getItem('mahasiswaData') || '[]').length === 0)) {
                saveDataMahasiswa(mahasiswaData); console.log("Mahasiswa initialized.");
            }

            // Kasra
            const kasraData = await fetchDummyData('kasra');
            if (kasraData && (!localStorage.getItem('kasraData') || JSON.parse(localStorage.getItem('kasraData') || '[]').length === 0)) {
                saveDataKasra(kasraData); console.log("Kasra initialized.");
            }

             // Admin Data (Simpan di localStorage jika perlu untuk login simulasi)
             // Anda bisa menambahkannya di sini jika logic login membutuhkannya
             const adminData = await fetchDummyData('admin');
             if (adminData && !localStorage.getItem('adminData')) { // Contoh key
                 localStorage.setItem('adminData', JSON.stringify(adminData));
                 console.log("Admin initialized.");
             }


            // Pembayaran
            const pembayaranData = await fetchDummyData('pembayaran');
            if (pembayaranData) {
                Object.entries(pembayaranData).forEach(([nim, data]) => {
                    if (!localStorage.getItem(`pembayaran_${nim}`)) {
                        saveDataPembayaran(nim, data);
                    }
                });
                console.log("Pembayaran initialized.");
            }

            // Pelanggaran
            const pelanggaranData = await fetchDummyData('pelanggaran');
            if (pelanggaranData) {
                Object.entries(pelanggaranData).forEach(([nim, data]) => {
                    if (!localStorage.getItem(`pelanggaranData_${nim}`)) {
                        saveDataPelanggaranMahasiswa(nim, data);
                    }
                });
                console.log("Pelanggaran initialized.");
            }

            // Pending Pelanggaran
            const pendingPelanggaranData = await fetchDummyData('pendingPelanggaran');
             if (pendingPelanggaranData && (!localStorage.getItem('pendingPelanggaran') || JSON.parse(localStorage.getItem('pendingPelanggaran') || '[]').length === 0)) {
                savePendingPelanggaran(pendingPelanggaranData);
                console.log("Pending Pelanggaran initialized.");
            }

            // Pengaduan
             const pengaduanData = await fetchDummyData('pengaduan');
             if (pengaduanData) {
                 Object.entries(pengaduanData).forEach(([nim, data]) => {
                    if (!localStorage.getItem(`pengaduan_${nim}`)) {
                        saveDataPengaduanMahasiswa(nim, data);
                    }
                 });
                 console.log("Pengaduan initialized.");
             }

             // Pengumuman
             const pengumumanData = await fetchDummyData('pengumuman');
              if (pengumumanData && (!localStorage.getItem('pengumumanData') || JSON.parse(localStorage.getItem('pengumumanData') || '[]').length === 0)) {
                 saveDataPengumuman(pengumumanData);
                 console.log("Pengumuman initialized.");
             }

             // Jadwal Kegiatan
             const jadwalData = await fetchDummyData('jadwalKegiatan');
              if (jadwalData && (!localStorage.getItem('jadwalKegiatan') || JSON.parse(localStorage.getItem('jadwalKegiatan') || '[]').length === 0)) {
                 saveDataJadwalKegiatan(jadwalData);
                 console.log("Jadwal Kegiatan initialized.");
             }

            // Tandai selesai
            localStorage.setItem(INITIALIZATION_KEY, 'true');
            console.log("Dummy data initialization from JSON complete.");
            // window.location.reload(); // Pertimbangkan untuk menghapus ini jika tidak perlu

        } catch (error) {
            console.error("Failed to initialize data from JSON:", error);
        }
    } else {
        console.log("LocalStorage (JSON method) already initialized.");
    }
};