// src/utils/initializeData.jsx
import {
    saveDataKamar, saveDataMahasiswa, saveDataKasra, saveDataPembayaran,
    saveDataPelanggaranMahasiswa, savePendingPelanggaran, saveDataPengaduanMahasiswa,
    saveDataPengumuman, saveDataJadwalKegiatan
} from './localStorage'; // Pastikan semua fungsi save ini ada di localStorage.jsx

// Kunci unik untuk menandai bahwa inisialisasi dari JSON sudah pernah dilakukan
const INITIALIZATION_KEY = 'simatera_initialized_json_v1'; // v1 ditambahkan untuk reset jika struktur berubah

// Fungsi helper untuk mengambil data dummy dari file JSON di folder public
const fetchDummyData = async (fileName) => {
    try {
        // Tambahkan parameter acak HANYA saat development untuk mencegah caching
        const cacheBuster = process.env.NODE_ENV === 'development' ? `?t=${Date.now()}` : '';
        const fetchUrl = `/dummyData/${fileName}.json${cacheBuster}`;
        console.log(`[Initializer] Fetching: ${fetchUrl}`); // Log URL yang di-fetch

        const response = await fetch(fetchUrl);

        if (!response.ok) {
            // Log detail error jika fetch gagal
            console.error(`[Initializer] Fetch failed for ${fetchUrl}. Status: ${response.status} ${response.statusText}`);
            const responseText = await response.text(); // Coba baca body error jika ada
            console.error("[Initializer] Response body:", responseText);
            throw new Error(`Failed to fetch ${fileName}.json: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[Initializer] Successfully fetched ${fileName}.json`);
        return data;

    } catch (error) {
        console.error(`[Initializer] Error loading or parsing dummy data ${fileName}:`, error);
        return null; // Kembalikan null jika gagal agar proses inisialisasi lain bisa lanjut
    }
};

// Fungsi utama untuk inisialisasi localStorage dari file JSON
export const initializeLocalStorageDataFromJson = async () => {
    // Pastikan hanya berjalan di sisi client (browser)
    if (typeof window === 'undefined') {
        console.log("[Initializer] Not running on client, skipping initialization.");
        return;
    }

    const isInitialized = localStorage.getItem(INITIALIZATION_KEY);

    // Hanya jalankan jika belum pernah diinisialisasi dengan key ini
    if (!isInitialized) {
        console.log(`[Initializer] Flag '${INITIALIZATION_KEY}' not found. Starting data initialization from JSON...`);

        try {
            // 1. Inisialisasi Kamar
            // Cek apakah data kamar sudah ada atau kosong
            const existingKamar = localStorage.getItem('dataKamar'); // Key sesuai localStorage.jsx
            if (!existingKamar || JSON.parse(existingKamar || '[]').length === 0) {
                const kamarData = await fetchDummyData('kamar');
                if (kamarData) {
                    saveDataKamar(kamarData);
                    console.log("[Initializer] Kamar data initialized from JSON.");
                } else {
                    console.warn("[Initializer] Failed to fetch kamar.json, skipping kamar initialization.");
                }
            } else {
                 console.log("[Initializer] Kamar data already exists in localStorage, skipping initialization.");
            }

            // 2. Inisialisasi Mahasiswa
            const existingMahasiswa = localStorage.getItem('mahasiswaData');
            if (!existingMahasiswa || JSON.parse(existingMahasiswa || '[]').length === 0) {
                const mahasiswaData = await fetchDummyData('mahasiswa');
                if (mahasiswaData) {
                    saveDataMahasiswa(mahasiswaData);
                    console.log("[Initializer] Mahasiswa data initialized from JSON.");
                } else {
                    console.warn("[Initializer] Failed to fetch mahasiswa.json, skipping mahasiswa initialization.");
                }
            } else {
                 console.log("[Initializer] Mahasiswa data already exists in localStorage, skipping initialization.");
            }


            // 3. Inisialisasi Kasra
            const existingKasra = localStorage.getItem('kasraData');
             if (!existingKasra || JSON.parse(existingKasra || '[]').length === 0) {
                const kasraData = await fetchDummyData('kasra');
                if (kasraData) {
                    saveDataKasra(kasraData);
                    console.log("[Initializer] Kasra data initialized from JSON.");
                } else {
                     console.warn("[Initializer] Failed to fetch kasra.json, skipping kasra initialization.");
                }
            } else {
                 console.log("[Initializer] Kasra data already exists in localStorage, skipping initialization.");
            }

            // 4. Inisialisasi Admin (jika diperlukan untuk login)
             const adminData = await fetchDummyData('admin');
             if (adminData && !localStorage.getItem('adminData')) { // Ganti 'adminData' jika key-nya berbeda
                 localStorage.setItem('adminData', JSON.stringify(adminData));
                 console.log("[Initializer] Admin login data initialized from JSON.");
             } else if (!adminData) {
                 console.warn("[Initializer] Failed to fetch admin.json, skipping admin initialization.");
             } else {
                 console.log("[Initializer] Admin data already exists in localStorage, skipping initialization.");
             }


            // 5. Inisialisasi Pembayaran (Perlu perulangan karena disimpan per NIM)
            const pembayaranData = await fetchDummyData('pembayaran');
            if (pembayaranData) {
                let count = 0;
                Object.entries(pembayaranData).forEach(([nim, data]) => {
                    // Hanya inisialisasi jika data untuk NIM ini belum ada
                    if (!localStorage.getItem(`pembayaran_${nim}`)) {
                        saveDataPembayaran(nim, data);
                        count++;
                    }
                });
                console.log(`[Initializer] ${count} Pembayaran data records initialized from JSON.`);
            } else {
                 console.warn("[Initializer] Failed to fetch pembayaran.json, skipping pembayaran initialization.");
            }


            // 6. Inisialisasi Pelanggaran (Perlu perulangan karena disimpan per NIM)
            const pelanggaranData = await fetchDummyData('pelanggaran');
            if (pelanggaranData) {
                let count = 0;
                Object.entries(pelanggaranData).forEach(([nim, data]) => {
                    if (!localStorage.getItem(`pelanggaranData_${nim}`)) {
                        saveDataPelanggaranMahasiswa(nim, data);
                         count++;
                    }
                });
                 console.log(`[Initializer] ${count} Pelanggaran data records initialized from JSON.`);
            } else {
                 console.warn("[Initializer] Failed to fetch pelanggaran.json, skipping pelanggaran initialization.");
            }


            // 7. Inisialisasi Pending Pelanggaran
            const existingPending = localStorage.getItem('pendingPelanggaran');
             if (!existingPending || JSON.parse(existingPending || '[]').length === 0) {
                const pendingPelanggaranData = await fetchDummyData('pendingPelanggaran');
                if (pendingPelanggaranData) {
                    savePendingPelanggaran(pendingPelanggaranData);
                    console.log("[Initializer] Pending Pelanggaran data initialized from JSON.");
                } else {
                    console.warn("[Initializer] Failed to fetch pendingPelanggaran.json, skipping pending pelanggaran initialization.");
                }
            } else {
                 console.log("[Initializer] Pending Pelanggaran data already exists in localStorage, skipping initialization.");
            }


            // 8. Inisialisasi Pengaduan (Perlu perulangan karena disimpan per NIM)
             const pengaduanData = await fetchDummyData('pengaduan');
             if (pengaduanData) {
                 let count = 0;
                 Object.entries(pengaduanData).forEach(([nim, data]) => {
                    if (!localStorage.getItem(`pengaduan_${nim}`)) {
                        saveDataPengaduanMahasiswa(nim, data);
                        count++;
                    }
                 });
                 console.log(`[Initializer] ${count} Pengaduan data records initialized from JSON.`);
             } else {
                  console.warn("[Initializer] Failed to fetch pengaduan.json, skipping pengaduan initialization.");
             }

             // 9. Inisialisasi Pengumuman
             const existingPengumuman = localStorage.getItem('pengumumanData');
              if (!existingPengumuman || JSON.parse(existingPengumuman || '[]').length === 0) {
                 const pengumumanData = await fetchDummyData('pengumuman');
                 if (pengumumanData) {
                     saveDataPengumuman(pengumumanData);
                     console.log("[Initializer] Pengumuman data initialized from JSON.");
                 } else {
                      console.warn("[Initializer] Failed to fetch pengumuman.json, skipping pengumuman initialization.");
                 }
             } else {
                  console.log("[Initializer] Pengumuman data already exists in localStorage, skipping initialization.");
             }

             // 10. Inisialisasi Jadwal Kegiatan
             const existingJadwal = localStorage.getItem('jadwalKegiatan');
              if (!existingJadwal || JSON.parse(existingJadwal || '[]').length === 0) {
                 const jadwalData = await fetchDummyData('jadwalKegiatan');
                 if (jadwalData) {
                     saveDataJadwalKegiatan(jadwalData);
                     console.log("[Initializer] Jadwal Kegiatan data initialized from JSON.");
                 } else {
                      console.warn("[Initializer] Failed to fetch jadwalKegiatan.json, skipping jadwal kegiatan initialization.");
                 }
             } else {
                  console.log("[Initializer] Jadwal Kegiatan data already exists in localStorage, skipping initialization.");
             }


            // Tandai bahwa inisialisasi sudah selesai
            localStorage.setItem(INITIALIZATION_KEY, 'true');
            console.log("[Initializer] Dummy data initialization from JSON complete.");

            // **PENTING**: Reload halaman SETELAH semua data disimpan agar komponen
            // yang mungkin sudah termuat bisa membaca data yang baru diinisialisasi.
            console.log("[Initializer] Reloading page to apply initial data...");
            // Beri jeda sedikit sebelum reload
             setTimeout(() => {
                window.location.reload();
             }, 100); // Jeda 100ms

        } catch (error) {
            console.error("[Initializer] General error during data initialization:", error);
            // Hapus flag jika terjadi error agar bisa mencoba lagi nanti
            localStorage.removeItem(INITIALIZATION_KEY);
        }
    } else {
        console.log(`[Initializer] Flag '${INITIALIZATION_KEY}' found. Skipping data initialization.`);
    }
};