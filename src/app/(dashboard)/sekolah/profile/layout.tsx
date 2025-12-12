'use client'
import React from 'react';
import SidebarProfileSekolah from '@/src/components/common/profile/SidebarProfileSekolah';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Container Utama:
        // Mobile: Flex Column (Sidebar di atas, Content di bawah)
        // Desktop (lg): Grid 9 Kolom (Sidebar kiri, Content kanan)
        <div className="flex flex-col lg:grid lg:grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            {/* Sidebar Wrapper */}
            {/* Mobile: Lebar full */}
            {/* Desktop (lg): Ambil 3 kolom, Sticky, Tinggi Full Layar */}
            <div className="w-full lg:col-span-3 lg:sticky lg:top-0 lg:h-screen x`z">
                <SidebarProfileSekolah/>
            </div>

            {/* Content Wrapper */}
            {/* Mobile: Lebar full, tinggi menyesuaikan isi (scroll halaman biasa) */}
            {/* Desktop (lg): Ambil 6 kolom, Scroll di dalam area ini saja, Tinggi Full Layar */}
            <div className="w-full lg:col-span-6 lg:overflow-y-auto lg:h-screen">
                {children}
            </div>

        </div>
    );
}