'use client'
import React from 'react';
import Link from 'next/link';


const MainDashboardAdmin = () => {

    const menuItems = [
        {
            title: "Akun Sekolah",
            description: "Kelola akun sekolah yang telah mendaftar",
            href: "/admin/sekolah"
        },
        {
            title: "Akun SPPG",
            description: "Kelola akun SPPG yang telah mendaftar",
            href: "/admin/sppg"
        },
        {
            title: "Penetapan Sekolah dengan SPPG",
            description: "Pilih sekolah yang dituju untuk tiap SPPG berdasarkan lokasi terdekat",
            href: "/admin/penetapan"
        }
    ];

    return (
        <div className="p-[3vw] flex flex-col gap-[2vw] font-sans">
            

            <div className="flex flex-col gap-[1.5vw]">
                {menuItems.map((item, index) => (
                    <Link key={index} href={item.href} className="group w-full">
                        <div 
                            className="w-full bg-[#E87E2F] rounded-[1.5vw] p-[2vw] flex justify-between items-center shadow-md transition-all duration-300 hover:bg-[#c27233] hover:shadow-lg hover:scale-[1.01]"
                        >
                            <div className="flex flex-col gap-[0.5vw]">
                                <h2 className="satoshiBold text-[2vw] text-white">
                                    {item.title}
                                </h2>
                                <p className="satoshiMedium text-[1.2vw] text-white opacity-90">
                                    {item.description}
                                </p>
                            </div>

                            <div className="text-white group-hover:translate-x-[0.5vw] transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[3vw] h-[3vw]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
};

export default MainDashboardAdmin;