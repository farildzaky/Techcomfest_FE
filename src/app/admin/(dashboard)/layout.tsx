'use client';
import React from 'react';
import { usePathname } from "next/navigation";
import SidebarAdmin from '@/src/components/common/admin/Sidebar';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();   

    // Cek kondisi detail page
    const isDetailPage = pathname.startsWith('/admin/sppg/') && pathname.split('/').length > 3;
    const isDetailSekolahPage = pathname.startsWith('/admin/sekolah/') && pathname.split('/').length > 3;

    // Tentukan apakah kita berada di SALAH SATU halaman detail
    const isAnyDetailPage = isDetailPage || isDetailSekolahPage;

    // Tentukan kelas CSS
    const containerClass = isAnyDetailPage ? "grid-cols-1" : "grid-cols-6";
    const contentClass = isAnyDetailPage ? "col-span-6" : "col-span-5";

    return (
        <div className={`grid ${containerClass} min-h-screen w-full bg-white relative`}>
            
            {/* 2. Sidebar (Hanya tampil jika BUKAN halaman detail manapun) */}
            {!isAnyDetailPage && (
                <div className="col-span-1 sticky top-0 h-screen z-50">
                    <SidebarAdmin/>
                </div>
            )}

            {/* 3. Konten Halaman */}
            <div className={`${contentClass} relative z-10 `}>
                {children}
            </div>
            
        </div>
    );
}