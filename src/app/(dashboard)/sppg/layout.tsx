'use client';
import React from 'react';
import { usePathname } from "next/navigation"; 
import SidebarSppg from "@/src/components/common/sppg/Sidebar";

export default function SppgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isPelaporanDetail = pathname.startsWith('/sppg/pelaporan/') && pathname !== '/sppg/pelaporan';
    const isProfilePage = pathname.startsWith('/sppg/profile');
    const weeklyMenuBase = '/sppg/menu-mbg/weekly-menu';
    
    const isWeeklyMenuDetail = pathname.startsWith(`${weeklyMenuBase}/`);

    const isFullScreen = isPelaporanDetail || isProfilePage || isWeeklyMenuDetail;

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
                <SidebarSppg />
            </div>
            <div className="col-span-5 overflow-y-auto h-screen">
                {children}
            </div>
        </div>
    );
}