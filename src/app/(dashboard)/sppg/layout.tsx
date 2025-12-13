// app/sppg/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import SidebarSppg from "@/src/components/common/sppg/Sidebar";
import Image from 'next/image';
import logoOrange from "../../../assets/logo-orange.png";

export default function SppgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // --- LOGIC FULLSCREEN ---
    const isPelaporanDetail = pathname.startsWith('/sppg/pelaporan/') && pathname !== '/sppg/pelaporan';
    const isProfilePage = pathname.startsWith('/sppg/profile');
    const weeklyMenuBase = '/sppg/menu-mbg/weekly-menu';
    const isWeeklyMenuDetail = pathname.startsWith(`${weeklyMenuBase}/`);

    const isFullScreen = isPelaporanDetail || isProfilePage || isWeeklyMenuDetail;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        // KUNCI 1: h-screen (bukan min-h-screen) dan overflow-hidden agar body tidak scroll
        <div className="flex h-screen w-full bg-white overflow-hidden">

            {/* --- SIDEBAR WRAPPER --- */}
            {/* Sidebar akan mengisi tinggi penuh dari parent (h-screen) */}
            <div className={`
        flex-shrink-0 
        ${isFullScreen ? 'lg:hidden' : 'lg:block'}
      `}>
                <SidebarSppg isOpen={isSidebarOpen} toggle={toggleSidebar} />
            </div>

            {/* --- KONTEN UTAMA WRAPPER --- */}
            <div className="flex-1 flex flex-col h-full w-full relative">

                {/* Header Mobile */}
                <header
                    className="lg:hidden bg-white p-[3vw] flex flex-row items-center justify-between sticky top-0 z-30 shadow-md flex-shrink-0"
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

                {/* KUNCI 2: Main Area yang Scrollable (overflow-y-auto) */}
                <main className="flex-1 overflow-y-auto lg:p-0 h-full">
                    {children}
                </main>
            </div>
        </div>
    );
}