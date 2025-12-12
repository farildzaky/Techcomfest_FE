'use client'
import React from 'react';
import SidebarProfileSppg from "@/src/components/common/profile/SidebarProfileSppg"; 

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Container Utama:
        // Mobile: Flex Column (atas-bawah)
        // Desktop (lg): Grid 9 Kolom (kiri-kanan)
        <div className="flex flex-col lg:grid lg:grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            {/* Sidebar Wrapper */}
            {/* Mobile: Lebar full */}
            {/* Desktop (lg): Ambil 3 kolom, Sticky, Full Height */}
            <div className="w-full lg:col-span-3 lg:sticky lg:top-0 lg:h-screen z-10 ">
                <SidebarProfileSppg />
            </div>

            {/* Content Wrapper */}
            {/* Mobile: Lebar full, tinggi auto (scroll body normal) */}
            {/* Desktop (lg): Ambil 6 kolom, Internal Scroll, Full Height */}
            <div className="w-full lg:col-span-6 lg:overflow-y-auto lg:h-screen">
                {children}
            </div>

        </div>
    );
}