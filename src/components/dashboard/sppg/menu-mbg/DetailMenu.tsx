'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 

interface KomponenAPI {
    nama: string;
    porsi: string;
}

interface GiziAPI {
    komponen: string;
    jumlah: string;
}

interface DeteksiRisikoAPI {
    alergi: string[];
    tekstur: string[];
    porsi_gizi: string[];
}

interface MenuDataAPI {
    menu_id: string;
    nama_menu: string;
    hari: string;
    status_keamanan: string;
    komponen_menu: KomponenAPI[];
    kandungan_gizi: GiziAPI[];
    deteksi_risiko: DeteksiRisikoAPI;
    rekomendasi: string;
    catatan_tambahan: string | null;
    ml_confidence: number;
}

interface ApiResponse {
    status: string;
    message: string;
    data: MenuDataAPI;
}

const DetailMenu = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [menuData, setMenuData] = useState<MenuDataAPI | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await fetchWithAuth(`/sppg/menus/${id}`, {
                    method: 'GET'
                });

                const result: ApiResponse = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal mengambil detail menu');
                }

                setMenuData(result.data);

            } catch (err: any) {
                console.error("Fetch Detail Error:", err);
                setError(err.message || "Terjadi kesalahan saat memuat data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const getBgColor = (status: string): string => {
        const normalized = status?.toLowerCase().replace(/_/g, ' ');
        if (normalized?.includes('aman') && !normalized.includes('tidak')) return '#07B563';
        if (normalized?.includes('perlu perhatian')) return '#FCCF34';
        if (normalized?.includes('tidak aman') || normalized?.includes('bahaya')) return '#EF0E20';
        return '#07B563'; 
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center satoshiBold text-[2vw]">Memuat data...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 satoshiBold text-[2vw]">Error: {error}</div>;
    if (!menuData) return null;

    const bgColor = getBgColor(menuData.status_keamanan);
    const statusText = menuData.status_keamanan.replace(/_/g, ' ').toUpperCase();
    const componentsList = menuData.komponen_menu.map(item => `${item.nama} ${item.porsi}`);
    const nutritionList = menuData.kandungan_gizi.map(item => ({
        label: item.komponen,
        value: item.jumlah
    }));
    const recommendationList = [menuData.rekomendasi];

    return (
        <div className="flex flex-col min-h-screen items-center bg-white relative ">
            
            <div className="relative w-full bg-[#F5DDCA] z-20">
                <button 
                    onClick={() => router.back()} 
                    className="absolute left-[2vw] top-1/2 -translate-y-1/2 p-[0.5vw] rounded-full hover:bg-black/5 transition-colors"
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[2.5vw] h-[2.5vw]">
                        <path d="M15 19L8 12L15 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h1 className='satoshiBold text-[3.5vw] text-black text-center py-[2vw]'>
                    {menuData.nama_menu}
                </h1>
            </div>

            <div className='relative w-full h-[15vw] z-10'>
                <div className="w-full h-full bg-[#F5DDCA] [clip-path:ellipse(50%_50%_at_50%_0%)] relative flex items-center justify-center"></div>
                <h2 className='absolute text-[3vw] text-white top-[10%] left-[50%] translate-x-[-50%] text-black satoshiBold z-20 bg-[#D7762E] w-[12vw] h-[12vw] flex items-center justify-center rounded-full '>
                    {menuData.hari}
                </h2>
            </div>

            <div className='w-full flex flex-col gap-[1vw] p-[2vw] z-10 mt-[-2vw]'>
                <h4 className='satoshiBold text-white text-[1.5vw] px-[1vw] py-[0.5vw] rounded-full w-fit flex items-end ml-auto'
                    style={{ backgroundColor: bgColor }}
                >
                    {statusText}
                </h4>

                <div className='grid grid-cols-8 w-full z-10 gap-[2vw] items-stretch'>
                    <div className='col-span-3 flex flex-col gap-[1vw]'>
                        <div className='bg-[#F5DDCA] rounded-[1vw] ' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                            <h2 className='satoshiBold text-[2vw] p-[1vw] bg-[#E87E2F] text-white rounded-[1vw]'>Komponen Menu</h2>
                            <ul className="grid grid-cols-2 gap-x-[2vw] w-full list-disc list-inside text-black satoshiMedium text-[1.3vw] p-[1vw]">
                                {componentsList.map((component, index) => (
                                    <li key={index}>{component}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='flex flex-col gap-[1vw]'>
                            <h2 className=' satoshiBold text-[2vw]'>Kandungan Gizi</h2>
                            <div className='w-full rounded-[1vw] overflow-hidden border-[0.15vw] border-[#D7762E]' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                                <div className='flex bg-[#D7762E] text-white h-[3vw] items-center flex'>
                                    <div className='w-[60%] pl-[1.5vw] satoshiBold text-[1.2vw]'>Komponen</div>
                                    <div className='w-[0.3%] h-full bg-[#F5DDCA]'></div>
                                    <div className='w-[40%] pl-[1.5vw] satoshiBold text-[1.2vw]'>Jumlah</div>
                                </div>
                                <div className='bg-[#FBE4CF]'>
                                    {nutritionList.map((item, index) => (
                                        <div key={index} className='flex border-b-[0.1vw] border-[#E87E2F] last:border-0 h-[3vw] items-center'>
                                            <div className='w-[60%] pl-[1.5vw] satoshiBold text-[1.1vw] text-black'>{item.label}</div>
                                            <div className='w-[0.3%] h-full bg-[#E87E2F]'></div>
                                            <div className='w-[40%] pl-[1.5vw] satoshiMedium text-[1.1vw] text-black'>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-span-5 flex flex-col gap-[1vw]'>
                        <div className='bg-[#F5DDCA] rounded-[1vw] ' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                            <h2 className='satoshiBold text-[2vw] p-[1vw] bg-[#E87E2F] text-white rounded-[1vw]'>Deteksi Risiko</h2>
                            <div className='p-[1.5vw] flex flex-col gap-[1vw]'>
                                <div className='flex flex-col gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-[1.5vw] text-black'>Alergi</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-black pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.alergi.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className='flex flex-col gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-[1.5vw] text-black'>Tekstur</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-black pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.tekstur.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className='flex flex-col gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-[1.5vw] text-black'>Porsi Gizi</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-black pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.porsi_gizi.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-3 gap-[1vw]'>
                            <div className='bg-[#F5DDCA] rounded-[1vw] col-span-2 ' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                                <h2 className='satoshiBold text-[2vw] p-[1vw] bg-[#E87E2F] text-white rounded-[1vw]'>Rekomendasi</h2>
                                <ul className="gap-x-[2vw] w-full list-disc list-inside text-black satoshiMedium text-[1.3vw] p-[1vw]">
                                    {recommendationList.map((recommendations, index) => (
                                        <li key={index} className="leading-relaxed text-justify">{recommendations}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className='col-span-1 flex flex-col items-center justify-center p-[1vw] bg-[#D7762E] rounded-[1vw] h-[16.5vw]' style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                                <h2 className='satoshiBold text-[2vw] text-white text-center mb-[1vw]'>Akurasi AI</h2>
                                <div className='bg-white/20 rounded-full w-[8vw] h-[8vw] flex items-center justify-center border-[0.3vw] border-white backdrop-blur-sm'>
                                    <span className='satoshiBold text-[2.5vw] text-white'>
                                        {String(menuData.ml_confidence).slice(0, 2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-[1vw]  px-[1vw]">
                    {menuData.catatan_tambahan ? (
                        <>
                            <div className='flex flex-row gap-[1vw] '>
                        <h1 className='satoshiBold text-[1.2vw] text-black'>
                            {menuData.catatan_tambahan}
                        </h1>
                    </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-[1vw] ">
                        <div className="mt-[0.2vw] shrink-0 w-[2.5vw] h-[2.5vw]">
                            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7.75 12.75L10.58 15.58L16.25 9.91" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className="satoshiBold font-bold text-[1.2vw] leading-relaxed text-[#07B563]">
                            Tidak ada catatan tambahan.
                        </p>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailMenu;