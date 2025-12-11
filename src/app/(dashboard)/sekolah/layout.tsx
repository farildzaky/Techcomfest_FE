// app/sekolah/layout.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/src/components/common/Sidebar'; 
import Image from 'next/image';
import logoOrange from "../../../assets/logo-orange.png"

export default function SekolahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State untuk mengontrol sidebar di mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fungsi untuk membuka/menutup sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen  relative">
      {/* --- Sidebar --- */}
      {/* Pass state dan fungsi toggle ke komponen Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

      {/* --- Konten Utama --- */}
      <div className="flex-1 flex flex-col  min-h-screen w-full  lg:w-auto">
        
        {/* --- Header Mobile (Tombol Hamburger) --- */}
        <header className="lg:hidden bg-white p-[1vw] flex flex-row items-center sticky top-0 z-30"
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

        >
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Buka Menu"
          >
            {/* Icon Hamburger (Garis Tiga) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[5vw] h-[5vw] stroke-[#E87E2F]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className='flex flex-row items-center justify-center w-full gap-[1vw]'>
            <Image src={logoOrange} alt="Logo" className='w-[5vw]' />
          <p className="text-[3vw] font-bold text-[#E87E2F] text-center ">INKLUZI</p>
          </div>
        </header>

        {/* --- Halaman / Children --- */}
        <main className="flex-1 p-[1vw] lg:p-0 ">
          {children}
        </main>
      </div>
    </div>
  );
}