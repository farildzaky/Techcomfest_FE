'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';

interface UserData {
    id: string;
    email: string;
    role: string;
    status: string;
    profile_name: string;
}

const AssignSppg = () => {
    const [sppgList, setSppgList] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth("/admin/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const response = await res.json();
                    const allSppg = response.data.filter((u: UserData) => u.role === 'sppg');
                    setSppgList(allSppg);
                }
            } catch (err) {
                console.error("Error fetching SPPG:", err);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    const filteredSppg = sppgList.filter(sppg => {
        const name = sppg.profile_name || sppg.email || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-full min-h-screen bg-white relative font-sans">

            {/* HEADER SECTION */}
            {/* Mobile: Sticky top, Flex Column. Desktop: Fixed Right 80%, Flex Row */}
            <div className="
                sticky top-0 z-20 bg-white shadow-sm lg:shadow-none
                flex flex-col lg:flex-row lg:justify-between lg:items-center 
                w-full lg:fixed lg:right-0 lg:top-0
                p-4 gap-4 lg:pr-[3vw] lg:pt-[2vw] lg:pb-[1vw] lg:gap-0
            ">
                {/* Wrapper Judul & Back Button */}
                <div className="flex items-center gap-3 lg:gap-[1vw]">
                    <button 
                        onClick={() => router.back()} 
                        className="hover:bg-gray-100 rounded-full p-1 transition-transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw] text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <h1 className="satoshiBold text-2xl lg:text-[2.5vw] text-black">
                        SPPG Terdaftar
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-[30%]">
                    <input
                        type="text"
                        placeholder="Cari SPPG..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="
                            w-full bg-white outline-none placeholder:text-gray-400
                            rounded-xl lg:rounded-[1vw]
                            py-3 lg:py-[0.8vw] 
                            pl-10 pr-4 lg:pl-[3vw] lg:pr-[1vw]
                            text-sm lg:text-[1vw]
                        "
                        style={{
                            boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 2px 2px 6.5px 2px rgba(0, 0, 0, 0.07)'
                        }}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E87E2F] w-5 h-5 lg:w-[1.2vw] lg:h-[1.2vw] lg:left-[1vw]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
            </div>

            {/* CONTENT GRID */}
            {/* Mobile: Padding standard. Desktop: Padding VW + Top Padding untuk offset Fixed Header */}
            <div className="p-4 lg:pt-[8vw] lg:px-[3vw] lg:pb-[5vw]">
                
                {loading ? (
                    // Skeleton Loading
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[2vw]">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-200 h-20 lg:h-[5vw] rounded-xl lg:rounded-[1vw] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredSppg.length > 0 ? (
                    // Data Grid
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[2vw]">
                        {filteredSppg.map((sppg) => (
                            <Link key={sppg.id} href={`/admin/penetapan/assign-sppg/${sppg.id}`} className="block">
                                <div className="
                                    bg-[#E87E2F] text-white shadow-md cursor-pointer group
                                    flex justify-between items-center
                                    transition-all duration-300 hover:bg-[#c27233] hover:shadow-lg
                                    
                                    rounded-xl lg:rounded-[1vw]
                                    p-4 lg:py-[1.5vw] lg:px-[2vw]
                                ">
                                    <span className="truncate max-w-[85%] satoshiBold text-lg lg:text-[1.5vw]">
                                        {sppg.profile_name || sppg.email}
                                    </span>

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="
                                        transition-all duration-300
                                        w-6 h-6 lg:w-[2vw] lg:h-[2vw]
                                        opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                                        lg:-translate-x-2 lg:group-hover:translate-x-0
                                    ">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center mt-10 lg:mt-[5vw] text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 lg:w-[5vw] lg:h-[5vw] mb-2 lg:mb-[1vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="satoshiMedium text-lg lg:text-[1.5vw]">Data SPPG tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AssignSppg;