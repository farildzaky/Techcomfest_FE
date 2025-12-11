'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/api"; 

// Interface data sekolah
interface SchoolData {
    id: string;
    nama_sekolah: string; // Sesuaikan dengan field di JSON Anda
}

const DaftarSekolah = () => {
    const [sekolahList, setSekolahList] = useState<SchoolData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSekolah = async () => {
            try {
                // MENGGUNAKAN ENDPOINT /sppg/schools
                const response = await fetchWithAuth('/sppg/schools', { 
                    method: 'GET' 
                });

                if (response.ok) {
                    const result = await response.json();
                    // Pastikan mengambil array dari result.data
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
            <div className="p-[3vw] flex flex-col gap-[3vw] min-h-screen items-center justify-center">
                <p className="satoshiBold text-[2vw] text-[#E87E2F]">Memuat Data Sekolah...</p>
            </div>
        );
    }

    return (
        <div className="p-[3vw] flex flex-col gap-[3vw]">

            <h1 className="satoshiBold text-[2.5vw]">Pelaporan Sekolah</h1>

            <div className="flex flex-col gap-[2vw]">
                {sekolahList.length > 0 ? (
                    sekolahList.map((item) => (
                        <Link 
                            href={`/sppg/pelaporan/${item.id}`} 
                            key={item.id} 
                            className="block transition-transform hover:scale-[1.01]"
                        >
                            {/* Tampilan Kotak Oranye */}
                            <h1 
                                className="satoshiBold text-[1.8vw] bg-[#E87E2F] text-white p-[1vw] px-[2vw] rounded-[1vw]"
                                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                            >
                                {item.nama_sekolah}
                            </h1>
                        </Link>
                    ))
                ) : (
                    <div className="text-center p-[2vw]">
                        <p className="satoshiMedium text-[1.5vw] text-gray-500">
                            Tidak ada data sekolah ditemukan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DaftarSekolah;