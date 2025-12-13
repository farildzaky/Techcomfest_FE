// app/sekolah/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import Sidebar from '@/src/components/common/Sidebar';
import Image from 'next/image';
import logoOrange from "../../../assets/logo-orange.png"

export default function SekolahLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // --- LOGIC HALAMAN FULLSCREEN (HIDDEN SIDEBAR DI DESKTOP) ---
    const isMenuDetail = pathname.startsWith('/sekolah/menu-mbg/') && pathname !== '/sekolah/menu-mbg';
    const isScanResult = pathname.startsWith('/sekolah/scan-nutrisi/') && pathname !== '/sekolah/scan-nutrisi';
    const isProfilePage = pathname === '/sekolah/profile' || pathname.startsWith('/sekolah/profile/');

    // Halaman spesifik lain yang ingin full screen di desktop
    const isSpecificPage = [
        "/sekolah/riwayat-scan",
    ].includes(pathname);

    const isFullScreen = isMenuDetail || isScanResult || isSpecificPage || isProfilePage;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Tutup sidebar otomatis saat pindah halaman (UX Mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen relative bg-white">

            {/* --- SIDEBAR WRAPPER --- */}
            {/* LOGIKA: 
          1. Default: 'block' (Muncul di Mobile karena Sidebar posisinya fixed/absolute).
          2. lg: (Desktop): Jika isFullScreen=true, maka 'lg:hidden', jika tidak 'lg:block'.
      */}
            <div className={`
        z-40
        ${isFullScreen ? 'lg:hidden' : 'lg:block'}
      `}>
                <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
            </div>

            {/* --- KONTEN UTAMA --- */}
            <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto transition-all duration-300">

                {/* --- Header Mobile (Tombol Hamburger) --- */}
                {/* Header ini hanya muncul di mobile (lg:hidden), jadi aman */}
                <header
                    className="lg:hidden bg-white p-[3vw] flex flex-row items-center sticky top-0 z-30"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                        aria-label="Buka Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[8vw] h-[8vw] text-[#E87E2F]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className='flex flex-row items-center justify-center w-full gap-[1vw] pr-[10vw]'>
                        <Image src={logoOrange} alt="Logo" width={868} height={870} className='w-[8vw] h-auto' />
                        <p className="text-[5vw] font-bold text-[#E87E2F] text-center leading-none">INKLUZI</p>
                    </div>
                </header>

                {/* --- Area Konten Halaman --- */}
                <main className="flex-1 lg:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
}