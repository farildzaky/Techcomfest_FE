'use client'
import React from 'react';
import SidebarProfileSekolah from '@/src/components/common/profile/SidebarProfileSekolah';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-9 min-h-screen bg-[#E87E2F] w-full">

            <div className="w-full lg:col-span-3 lg:sticky lg:top-0 lg:h-screen z-10">
                <SidebarProfileSekolah />
            </div>

            <div className="w-full lg:col-span-6 lg:overflow-y-auto lg:h-screen">
                {children}
            </div>

        </div>
    );
}