'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarProfileSppg = () => {
    const pathname = usePathname();

    const menuItems = [
        { label: "Informasi Instansi", href: "/sppg/profile/informasi-instansi" },
        { label: "Data Laporan", href: "/sppg/profile/data-laporan" },
    ];

    return (
        <div className="w-full min-h-screen bg-[#D7762E] flex flex-col items-center py-[2vw] rounded-r-[0.5vw]">
            
            <div className="w-full px-[2vw] mb-[2vw]">
                <Link href="/sppg/dashboard">
                    <button className="text-white hover:bg-white/20 p-[0.5vw] rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2vw] h-[2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </Link>
            </div>

            <div className="flex flex-col items-center gap-[1vw] mb-[3vw]">
                <div className="w-[15vw] h-[15vw] bg-[#F3F4F6] rounded-full relative">
                    <div className="absolute bottom-[0.5vw] right-[1vw] bg-white p-[0.4vw] rounded-full shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[2vw] h-[2vw] text-[#D9833E]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </div>
                </div>
                
                <div className="text-center text-white">
                    <h2 className="satoshiBold text-[1.8vw] leading-tight">SPPG Malang</h2>
                    <p className="satoshiMedium text-[1.5vw]">Malang</p>
                </div>
            </div>

            {/* Menu List */}
            <div className="w-full flex flex-col gap-[1vw] pr-[10vw]">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                        <Link 
                            key={index} 
                            href={item.href}
                            className="block" 
                        >
                            <div className="relative flex items-center p-[1.2vw] cursor-pointer rounded-r-[1vw] group">
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full bg-white opacity-50 rounded-r-[2vw]
                                        transition-all duration-500 ease-in-out
                                        ${isActive ? "w-full" : "w-0"}
                                    `}
                                />

                                <div className={`
                                    relative z-10 flex items-start flex w-full justify-start pl-[8vw] gap-[1.5vw] transition-colors duration-300
                                    ${isActive ? "text-white" : "text-white group-hover:text-white/80"}
                                `}>
                                    
                                    <span className="text-[1.4vw] satoshiBold whitespace-nowrap  ">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

        </div>
    )
}

export default SidebarProfileSppg;