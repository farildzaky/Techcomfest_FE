'use client'
import React from 'react';
import SidebarProfileSekolah from '@/src/components/common/profile/SidebarProfileSekolah';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            <div className="col-span-3 sticky top-0 h-screen z-50">
                <SidebarProfileSekolah/>
            </div>

            <div className="col-span-6 overflow-y-auto h-screen ">
                {children}
            </div>

        </div>
    );
}