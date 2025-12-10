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

    const isDetailPage = pathname.startsWith('/admin/sppg/') && pathname.split('/').length > 3;
    const isDetailSekolahPage = pathname.startsWith('/admin/sekolah/') && pathname.split('/').length > 3;

    const isAnyDetailPage = isDetailPage || isDetailSekolahPage;

    const containerClass = isAnyDetailPage ? "grid-cols-1" : "grid-cols-6";
    const contentClass = isAnyDetailPage ? "col-span-6" : "col-span-5";

    return (
        <div className={`grid ${containerClass} min-h-screen w-full bg-white relative`}>
            
            {!isAnyDetailPage && (
                <div className="col-span-1 sticky top-0 h-screen z-50">
                    <SidebarAdmin/>
                </div>
            )}

            <div className={`${contentClass} relative z-10 `}>
                {children}
            </div>
            
        </div>
    );
}