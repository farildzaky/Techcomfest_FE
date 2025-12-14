'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/api"; 
import Image from 'next/image';
import bg from "../../../../assets/bg.png";
import loadingSpinner from "../../../../assets/loading.png"; 

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

    // Loading State dengan Modal
    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">
                    <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                        <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                        <Image src={loadingSpinner} alt="Loading" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Memuat Data</h3>
                        <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                            Sedang mengambil daftar sekolah...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col 
            p-6 gap-6 min-h-screen
            lg:p-[3vw] lg:gap-[3vw]"
        >

            <h1 className="satoshiBold 
                text-2xl 
                lg:text-[2.5vw]"
            >
                Pelaporan Sekolah
            </h1>

            {/* PERUBAHAN DISINI: 
               Ganti 'h-full' dengan 'flex-1'. 
               Ini membuat div ini mengambil semua sisa ruang kosong ke bawah.
            */}
            <div className="flex flex-col 
                gap-4 flex-1
                lg:gap-[2vw]"
            >
                {sekolahList.length > 0 ? (
                    sekolahList.map((item) => (
                        <Link 
                            href={`/sppg/pelaporan/${item.id}`} 
                            key={item.id} 
                            className="block transition-transform hover:scale-[1.01]"
                        >
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
                    /* PERUBAHAN DISINI:
                       Tambahkan 'flex-1', 'w-full', dan 'items-center justify-center'.
                       Karena parent-nya sudah flex-1, div ini akan membesar memenuhi area kosong,
                       lalu textnya ditaruh tepat di tengah.
                    */
                    <div className="flex flex-1 w-full items-center justify-center text-center">
                        <p className="satoshiBold text-gray-400 
                            text-base 
                            lg:text-[2vw]"
                        >
                            Belum ada data pelaporan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DaftarSekolah;