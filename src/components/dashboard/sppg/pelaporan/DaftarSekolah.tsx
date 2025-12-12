'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/api"; 

// Interface data sekolah
interface SchoolData {
    id: string;
    nama_sekolah: string; 
}

const DaftarSekolah = () => {
    const [sekolahList, setSekolahList] = useState<SchoolData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSekolah = async () => {
            try {
                const response = await fetchWithAuth('/sppg/schools', { 
                    method: 'GET' 
                });

                if (response.ok) {
                    const result = await response.json();
                    setSekolahList(result.data || []); 
                } else {
                    console.error("Gagal mengambil data sekolah");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSekolah();
    }, []);

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center 
                p-6 gap-6 
                lg:p-[3vw] lg:gap-[3vw]"
            >
                <p className="satoshiBold text-[#E87E2F] 
                    text-xl 
                    lg:text-[2vw]"
                >
                    Memuat Data Sekolah...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col 
            p-6 gap-6 
            lg:p-[3vw] lg:gap-[3vw]"
        >

            <h1 className="satoshiBold 
                text-2xl 
                lg:text-[2.5vw]"
            >
                Pelaporan Sekolah
            </h1>

            <div className="flex flex-col 
                gap-4 
                lg:gap-[2vw]"
            >
                {sekolahList.length > 0 ? (
                    sekolahList.map((item) => (
                        <Link 
                            href={`/sppg/pelaporan/${item.id}`} 
                            key={item.id} 
                            className="block transition-transform hover:scale-[1.01]"
                        >
                            {/* Tampilan Kotak Oranye */}
                            <h1 
                                className="satoshiBold bg-[#E87E2F] text-white 
                                    text-lg p-4 px-6 rounded-xl 
                                    lg:text-[1.8vw] lg:p-[1vw] lg:px-[2vw] lg:rounded-[1vw]"
                                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                            >
                                {item.nama_sekolah}
                            </h1>
                        </Link>
                    ))
                ) : (
                    <div className="text-center 
                        p-4 
                        lg:p-[2vw]"
                    >
                        <p className="satoshiMedium text-gray-500 
                            text-base 
                            lg:text-[1.5vw]"
                        >
                            Tidak ada data sekolah ditemukan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DaftarSekolah;