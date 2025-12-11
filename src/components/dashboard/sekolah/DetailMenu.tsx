'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation'; 
import { fetchWithAuth } from '@/src/lib/api'; 
import warning from '../../../assets/dashboard/sekolah/warning.png'; 

interface APIKomponen {
    nama: string;
    porsi: string;
}

interface APIKandunganGizi {
    komponen: string;
    jumlah: string;
}

interface APIDeteksiRisiko {
    alergi: string[];
    tekstur: string[];
    porsi_gizi: string[];
}

interface APIMenuResponse {
    id: string;
    hari: string;
    tanggal: string;
    nama_menu: string;
    komponen_menu: APIKomponen[];
    kandungan_gizi: APIKandunganGizi[];
    deteksi_risiko: APIDeteksiRisiko;
    rekomendasi: string;
    status_keamanan: string;
    ml_confidence: number;
    catatan_tambahan: string | null;
}

const DetailMenu = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [menuData, setMenuData] = useState<APIMenuResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await fetchWithAuth(`/school/menus/${id}`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error("Gagal mengambil data");

                const result = await response.json();
                if (result.data) {
                    setMenuData(result.data);
                }
            } catch (error) {
                console.error("Error fetching menu detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center bg-white relative">
                {/* Header Skeleton */}
                <div className='satoshiBold text-[6vw] lg:text-[3.5vw] text-black z-10 w-full bg-[#F5DDCA] text-center py-[4vw] lg:py-[2vw] flex justify-center'>
                    <div className="h-[6vw] lg:h-[3.5vw] bg-gray-300 rounded animate-pulse w-[50%]" />
                </div>

                {/* Decoration Skeleton */}
                <div className='relative w-full h-[30vw] lg:h-[15vw] mb-[4vw] lg:mb-0'>
                    <div className="w-full h-full bg-[#F5DDCA] [clip-path:ellipse(80%_80%_at_50%_0%)] lg:[clip-path:ellipse(50%_50%_at_50%_0%)] relative z-0 flex items-center justify-center">
                    </div>
                    <div className='absolute top-[10%] left-[50%] translate-x-[-50%] z-10 bg-gray-300 w-[20vw] h-[20vw] lg:w-[12vw] lg:h-[12vw] rounded-full animate-pulse'>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className='w-full flex flex-col gap-[4vw] lg:gap-[1vw] px-[4vw] lg:px-[2vw] pb-[6vw] lg:pb-[3vw] z-10 mt-[-4vw] lg:mt-[-2vw]'>
                    <div className="h-[40vw] bg-gray-200 rounded-[2vw] animate-pulse"></div>
                    <div className="h-[40vw] bg-gray-200 rounded-[2vw] animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!menuData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white">
                <span className="satoshiBold text-gray-500 text-[4vw] lg:text-[1.5vw]">Data menu tidak ditemukan.</span>
            </div>
        );
    }

    const getBgColor = (status: string): string => {
        const s = status || "";
        switch (s.toLowerCase()) {
            case 'aman': return '#07B563';
            case 'perlu_perhatian': return '#FCCF34'; 
            case 'perlu perhatian': return '#FCCF34';
            case 'tidak_aman': return '#EF0E20';
            case 'tidak aman': return '#EF0E20';
            default: return '#07B563';
        }
    };

    const formattedStatus = menuData.status_keamanan
        ? menuData.status_keamanan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : "Aman";

    const confidencePercentage = menuData.ml_confidence
        ? Math.round(menuData.ml_confidence * 100)
        : 0;

    const bgColor = getBgColor(menuData.status_keamanan);
    const additionalNote = menuData.catatan_tambahan;

    return (
        <div className="flex flex-col min-h-screen items-center bg-white relative pb-[10vw] lg:pb-0">

            {/* HEADER JUDUL */}
            <h1 className='satoshiBold text-[5vw] lg:text-[3.5vw] text-black z-10 w-full bg-[#F5DDCA] text-center py-[4vw] lg:py-[2vw] px-[4vw]'>
                {menuData.nama_menu}
            </h1>

            {/* HEADER DEKORASI & HARI */}
            <div className='relative w-full h-[30vw] lg:h-[15vw] mb-[4vw] lg:mb-0'>
                <div className="w-full h-full bg-[#F5DDCA] [clip-path:ellipse(80%_80%_at_50%_0%)] lg:[clip-path:ellipse(50%_50%_at_50%_0%)] relative z-0 flex items-center justify-center">
                </div>
                <h2 className='absolute text-[5vw] lg:text-[3vw] text-white top-[20%] lg:top-[10%] left-[50%] translate-x-[-50%] satoshiBold z-10 bg-[#D7762E] w-[30vw] h-[30vw] lg:w-[12vw] lg:h-[12vw] flex items-center justify-center rounded-full shadow-lg'>
                    {menuData.hari}
                </h2>
            </div>

            {/* KONTEN UTAMA */}
            <div className='w-full flex flex-col gap-[4vw] lg:gap-[1vw] px-[4vw] lg:px-[2vw] pb-[6vw] lg:pb-[3vw] z-10 mt-[-4vw] lg:mt-[-2vw]'>

                {/* STATUS BAR (Akurasi & Status Keamanan) */}
                <div className="flex flex-col-reverse lg:flex-row justify-end gap-[2vw] lg:gap-[1vw] items-end lg:items-center ml-auto w-full lg:w-fit mt-[2vw] lg:mt-0">
                    {confidencePercentage > 0 && (
                        <div className="flex items-center gap-[1.5vw] lg:gap-[0.5vw] bg-[#E8F5E9] px-[3vw] lg:px-[1vw] py-[1.5vw] lg:py-[0.5vw] rounded-full border border-[#C8E6C9]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[3.5vw] h-[3.5vw] lg:w-[1.2vw] lg:h-[1.2vw] text-[#2E7D32]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <span className="text-[#2E7D32] satoshiBold text-[3vw] lg:text-[1.2vw]">
                                Akurasi AI: {confidencePercentage}%
                            </span>
                        </div>
                    )}
                    <h4 className='satoshiBold text-white text-[3.5vw] lg:text-[1.5vw] px-[4vw] lg:px-[1vw] py-[1.5vw] lg:py-[0.5vw] rounded-full flex items-center shadow-sm'
                        style={{ backgroundColor: bgColor }}
                    >
                        {formattedStatus}
                    </h4>
                </div>

                {/* GRID UTAMA */}
                <div className='flex flex-col lg:grid lg:grid-cols-8 w-full z-10 gap-[4vw] lg:gap-[2vw] items-stretch'>

                    {/* KOLOM KIRI (Komponen & Gizi) */}
                    <div className='lg:col-span-3 flex flex-col gap-[4vw] lg:gap-[1vw]'>
                        
                        {/* Komponen Menu */}
                        <div className='bg-[#F5DDCA] rounded-[3vw] lg:rounded-[1vw] shadow-md' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                            <h2 className='satoshiBold text-[4vw] lg:text-[2vw] p-[2vw] lg:p-[1vw] bg-[#E87E2F] text-white rounded-t-[3vw] lg:rounded-[1vw] text-center lg:text-left'>Komponen Menu</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-[4vw] lg:gap-x-[2vw] w-full list-disc list-inside text-black satoshiMedium text-[3.5vw] lg:text-[1.3vw] p-[3vw] lg:p-[1vw]">
                                {menuData.komponen_menu.map((comp, index) => (
                                    <li key={index}>{comp.nama} ({comp.porsi})</li>
                                ))}
                            </ul>
                        </div>

                        {/* Kandungan Gizi */}
                        <div className='flex flex-col'>
                            <div className="flex justify-between items-center mb-[2vw] lg:mb-0">
                                <h2 className='satoshiBold text-[4vw] lg:text-[2vw]'>Kandungan Gizi</h2>
                                <Link href={`/sekolah/menu-mbg/${id}/detail-informasi`}>
                                    <p className='text-[#D7762E] text-[3vw] lg:text-[1vw] underline italic cursor-pointer hover:text-[#b05e22] transition-colors'>
                                        Detail Nutrisi
                                    </p>
                                </Link>
                            </div>

                            <div className='w-full rounded-[3vw] lg:rounded-[1vw] overflow-hidden border-[0.5vw] lg:border-[0.15vw] border-[#D7762E] shadow-md'>
                                <div className='flex bg-[#D7762E] text-white h-[8vw] lg:h-[3vw] items-center px-[3vw] lg:px-0'>
                                    <div className='w-[60%] lg:pl-[1.5vw] satoshiBold text-[3.5vw] lg:text-[1.2vw]'>Komponen</div>
                                    <div className='hidden lg:block w-[0.3%] h-full bg-[#F5DDCA]'></div>
                                    <div className='w-[40%] lg:pl-[1.5vw] satoshiBold text-[3.5vw] lg:text-[1.2vw] text-right lg:text-left'>Jumlah</div>
                                </div>
                                <div className='bg-[#FBE4CF]'>
                                    {menuData.kandungan_gizi.map((gizi, index) => (
                                        <div key={index} className='flex border-b-[0.2vw] lg:border-b-[0.1vw] border-[#E87E2F] last:border-0 h-[8vw] lg:h-[3vw] items-center px-[3vw] lg:px-0'>
                                            <div className='w-[60%] lg:pl-[1.5vw] satoshiBold text-[3.2vw] lg:text-[1.1vw] text-black truncate'>{gizi.komponen}</div>
                                            <div className='hidden lg:block w-[0.3%] h-full bg-[#E87E2F]'></div>
                                            <div className='w-[40%] lg:pl-[1.5vw] satoshiMedium text-[3.2vw] lg:text-[1.1vw] text-black text-right lg:text-left'>{gizi.jumlah}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN (Risiko & Rekomendasi) */}
                    <div className='lg:col-span-5 flex flex-col gap-[4vw] lg:gap-[1vw]'>
                        
                        {/* Deteksi Risiko */}
                        <div className='bg-[#F5DDCA] rounded-[3vw] lg:rounded-[1vw] shadow-md' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                            <h2 className='satoshiBold text-[4vw] lg:text-[2vw] p-[2vw] lg:p-[1vw] bg-[#E87E2F] text-white rounded-t-[3vw] lg:rounded-[1vw] text-center lg:text-left'>Deteksi Risiko</h2>
                            <div className='p-[3vw] lg:p-[1.5vw] flex flex-col gap-[3vw] lg:gap-[1vw]'>
                                {[
                                    { title: "Alergi", items: menuData.deteksi_risiko.alergi },
                                    { title: "Tekstur", items: menuData.deteksi_risiko.tekstur },
                                    { title: "Porsi Gizi", items: menuData.deteksi_risiko.porsi_gizi }
                                ].map((risk, i) => (
                                    <div key={i} className='flex flex-col gap-[1vw] lg:gap-[0.5vw]'>
                                        <h3 className='satoshiBold text-[3.5vw] lg:text-[1.5vw] text-black'>{risk.title}</h3>
                                        <ul className='list-disc list-inside satoshiMedium text-[3.2vw] lg:text-[1.3vw] text-black pl-[1vw] lg:pl-[0.5vw]'>
                                            {(risk.items && risk.items.length > 0)
                                                ? risk.items.map((item, index) => <li key={index}>{item}</li>)
                                                : <li>Aman / Sesuai standar</li>
                                            }
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-[4vw] lg:gap-[1vw]'>
                            {/* Rekomendasi */}
                            <div className='bg-[#F5DDCA] rounded-[3vw] lg:rounded-[1vw] lg:col-span-2 shadow-md' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                                <h2 className='satoshiBold text-[4vw] lg:text-[2vw] p-[2vw] lg:p-[1vw] bg-[#E87E2F] text-white rounded-t-[3vw] lg:rounded-[1vw] text-center lg:text-left'>Rekomendasi</h2>
                                <div className="p-[3vw] lg:p-[1vw] text-black satoshiMedium text-[3.2vw] lg:text-[1.3vw] text-justify leading-relaxed">
                                    {menuData.rekomendasi || "Tidak ada rekomendasi khusus."}
                                </div>
                            </div>
                            
                            {/* Tombol Lapor */}
                            <Link href="/sekolah/pelaporan/form-pelaporan" className='lg:col-span-1 block'>
                                <div className='flex flex-row lg:flex-col items-center justify-center p-[3vw] lg:p-[1vw] bg-[#D7762E] rounded-[3vw] lg:rounded-[1vw] h-[20vw] lg:h-[16.5vw] hover:bg-[#b56225] transition-colors cursor-pointer gap-[3vw] lg:gap-[1vw] shadow-md'>
                                    <h2 className='satoshiBold text-[5vw] lg:text-[3vw] text-white'>Laporkan</h2>
                                    <Image src={warning} alt="warning icon" className="w-[8vw] h-[8vw] object-contain" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FOOTER (Catatan Tambahan & Tombol Kembali) */}
                <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end mt-[6vw] lg:mt-[2vw] gap-[4vw] lg:gap-0">
                    
                    <div className="flex-1 w-full lg:max-w-[70%] bg-gray-50 p-[3vw] lg:p-0 rounded-[2vw] lg:bg-transparent">
                        {additionalNote ? (
                            <div className='flex flex-row gap-[2vw] lg:gap-[1vw]'>
                                <div className="mt-[0.5vw] lg:mt-[0.2vw] shrink-0 w-[5vw] h-[5vw] lg:w-[2.5vw] lg:h-[2.5vw]">
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#5A5A5A" fillOpacity="0"/>
                                        <path d="M12 9V14" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 18H12.01" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M10.29 3.86L1.82 18C1.64556 18.3024 1.55293 18.6453 1.55201 18.9945C1.55108 19.3437 1.64189 19.6871 1.81442 19.9894C1.98695 20.2917 2.23483 20.5417 2.53232 20.7132C2.82981 20.8848 3.16599 20.9717 3.505 20.966H20.495C20.834 20.9717 21.1702 20.8848 21.4677 20.7132C21.7652 20.5417 22.013 20.2917 22.1856 19.9894C22.3581 19.6871 22.4489 19.3437 22.448 18.9945C22.4471 18.6453 22.3544 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9822 3.15535C12.6837 2.98759 12.3481 2.89954 12.0089 2.90001C11.6698 2.90049 11.3344 2.98947 11.0363 3.15797C10.7383 3.32647 10.4879 3.56846 10.31 3.86H10.29Z" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p className="satoshiBold font-bold text-[3.5vw] lg:text-[1.2vw] leading-relaxed text-[#4A4A4A]">
                                    {additionalNote}
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-[2vw] lg:gap-[1vw]">
                                <div className="mt-[0.5vw] lg:mt-[0.2vw] shrink-0 w-[5vw] h-[5vw] lg:w-[2.5vw] lg:h-[2.5vw]">
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7.75 12.75L10.58 15.58L16.25 9.91" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <p className="satoshiBold font-bold text-[3.5vw] lg:text-[1.2vw] leading-relaxed text-[#07B563]">
                                    Tidak ada catatan tambahan.
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.back()} 
                        className="w-full lg:w-auto bg-[#D7762E] text-white rounded-full lg:rounded-[2vw] px-[8vw] lg:px-[4vw] py-[2.5vw] lg:py-[0.8vw] satoshiBold text-[4vw] lg:text-[1.5vw] shadow-md hover:bg-[#b56225] transition-all cursor-pointer active:scale-95 text-center"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailMenu;