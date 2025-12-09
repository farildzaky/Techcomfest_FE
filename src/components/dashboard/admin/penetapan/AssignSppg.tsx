'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth("/v1/admin/users", {
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
        <div className="w-full h-screen overflow-y-auto bg-white relative">

            <div className="flex justify-between items-center fixed z-10 w-[80%] bg-white pr-[3vw] pt-[2vw] pb-[1vw] top-0 right-0">
                <h1 className="satoshiBold text-[2.5vw] text-black">
                    SPPG Terdaftar dalam Inkluzi
                </h1>

                <div className="relative w-[30%]">
                    <input
                        type="text"
                        placeholder="Cari SPPG..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-[1vw] py-[0.8vw] pl-[3vw] pr-[1vw] text-[1vw] outline-none placeholder:text-gray-400 bg-white"
                        style={{
                            boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 2px 2px 6.5px 2px rgba(0, 0, 0, 0.07)'
                        }}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.2vw] h-[1.2vw] text-[#E87E2F] absolute left-[1vw] top-1/2 -translate-y-1/2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
            </div>

            <div className="pt-[8vw] px-[3vw] pb-[5vw]">
                
                {loading ? (
                    <div className="grid grid-cols-2 gap-[2vw]">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-200 h-[5vw] rounded-[1vw] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredSppg.length > 0 ? (
                    <div className="grid grid-cols-2 gap-[2vw]">
                        {filteredSppg.map((sppg) => (
                            <Link key={sppg.id} href={`/admin/penetapan/assign-sppg/${sppg.id}`}>
                                <div className="bg-[#E87E2F] text-white satoshiBold text-[1.5vw] py-[1.5vw] px-[2vw] rounded-[1vw] shadow-md hover:bg-[#c27233] hover:shadow-lg transition-all duration-300 flex justify-between items-center cursor-pointer group">
                                    
                                    <span className="truncate max-w-[80%]">
                                        {sppg.profile_name || sppg.email}
                                    </span>

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2vw] h-[2vw] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-[5vw] text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[5vw] h-[5vw] mb-[1vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="satoshiMedium text-[1.5vw]">Data SPPG tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AssignSppg;