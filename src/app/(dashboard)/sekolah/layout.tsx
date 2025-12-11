'use client';
import React from 'react';
import { usePathname } from "next/navigation"; 
import Sidebar from "@/src/components/common/Sidebar"; 

export default function SekolahLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isMenuDetail = pathname.startsWith('/sekolah/menu-mbg/') && pathname !== '/sekolah/menu-mbg';
    const isProfilePage = pathname.startsWith('/sekolah/profile');

    const isScanResult = pathname.startsWith('/sekolah/scan-nutrisi/') && pathname !== '/sekolah/scan-nutrisi';

    const isSpecificPage = [
        "/sekolah/riwayat-scan", 
    ].includes(pathname);


    const isFullScreen = isMenuDetail || isScanResult ||  isProfilePage || isSpecificPage;


    if (isFullScreen) {
        return (
            <main className="w-full min-h-screen bg-white">
                {children}
            </main>
        );
    }

    return (
        <div className="grid grid-cols-6 min-h-screen w-full bg-white">
            <div className="col-span-1 sticky top-0 h-screen z-50">
                <Sidebar />
            </div>

            <div className="col-span-5 overflow-y-auto h-screen">
                {children}
            </div>
        </div>
    );
}