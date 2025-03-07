// app/admin/layout.js
import Sidebar from '@/components/sidebar';

export default function MahasiswaLayout({ children, params }) {
  // Misal role di sini sudah diketahui dari AuthContext
  const role = 'mahasiswa';

  return (
    <div className="flex bg-[#F5F6FA] overflow-x-hidden">
      <header className="flex h-screen">
        <Sidebar role={role} />
      </header>
      <main className="flex w-full">
        <div className="w-full flex flex-col h-screen overflow-y-auto scrollbar-hide gap-5">
          {children}
        </div>
      </main>
    </div>
  );
}
