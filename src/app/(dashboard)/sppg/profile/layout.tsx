'use client'
import React from 'react';
import SidebarProfileSppg from "@/src/components/common/profile/SidebarProfileSppg"; 

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            <div className="col-span-3 sticky top-0 h-screen z-50">
                <SidebarProfileSppg />
            </div>

            <div className="col-span-6 overflow-y-auto h-screen ">
                {children}
            </div>

        </div>
    );
}