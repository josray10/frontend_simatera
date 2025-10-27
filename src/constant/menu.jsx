import {
  Home,
  Users,
  FileX,
  CreditCard,
  Megaphone,
  CalendarClock,
  Settings,
  Bed,
} from 'lucide-react';

export const MENU_ITEMS_ADMIN = [
  { name: 'Beranda', key: '', icon: <Home size={20} /> },
  {
    name: 'Pengumuman',
    key: 'pengumuman',
    icon: <Megaphone size={20} />,
  },
  { name: 'Data Penghuni', key: 'datapenghuni', icon: <Users size={20} /> },
  { name: 'Data Kamar', key: 'datakamar', icon: <Bed size={20} /> },
  {
    name: 'Data Pelanggaran',
    key: 'datapelanggaran',
    icon: <FileX size={20} />,
  },
  {
    name: 'Data Pembayaran',
    key: 'datapembayaran',
    icon: <CreditCard size={20} />,
  },
  {
    name: 'Data Pengaduan',
    key: 'datapengaduan',
    icon: <Megaphone size={20} />,
  },
  {
    name: 'Pengaturan',
    key: 'pengaturan',
    icon: <Settings size={20} />,
  },
];

export const MENU_ITEMS_KASRA = [
  { name: 'Beranda', key: '', icon: <Home size={20} /> },
  { name: 'Data Penghuni', key: 'datapenghuni', icon: <Users size={20} /> },
  {
    name: 'Data Pelanggaran',
    key: 'datapelanggaran',
    icon: <FileX size={20} />,
  },
  {
    name: 'Data Pembayaran',
    key: 'datapembayaran',
    icon: <CreditCard size={20} />,
  },
  { name: 'Pengaduan', key: 'pengaduan', icon: <Megaphone size={20} /> },
  {
    name: 'Jadwal Kegiatan',
    key: 'jadwalkegiatan',
    icon: <CalendarClock size={20} />,
  },
  { name: 'Pengaturan', key: 'pengaturan', icon: <Settings size={20} /> },
];

export const MENU_ITEMS_MAHASISWA = [
  { name: 'Beranda', key: '', icon: <Home size={20} /> },
  {
    name: 'Data Pelanggaran',
    key: 'datapelanggaran',
    icon: <FileX size={20} />,
  },
  {
    name: 'Data Pembayaran',
    key: 'datapembayaran',
    icon: <CreditCard size={20} />,
  },
  { name: 'Pengaduan', key: 'pengaduan', icon: <Megaphone size={20} /> },
  {
    name: 'Jadwal Kegiatan',
    key: 'jadwalkegiatan',
    icon: <CalendarClock size={20} />,
  },
  { name: 'Pengaturan', key: 'pengaturan', icon: <Settings size={20} /> },
];
