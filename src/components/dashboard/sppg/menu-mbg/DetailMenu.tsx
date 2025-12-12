'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';

// --- INTERFACES ---
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

// --- SKELETON COMPONENT ---
const SkeletonDetailMenu = () => {
    return (
        <div className="flex flex-col min-h-screen items-center bg-white relative font-sans overflow-x-hidden animate-pulse">
            {/* Header Skeleton */}
            <div className="relative w-full bg-[#F5DDCA] z-20 px-4 lg:px-0 h-24 lg:h-[8vw]">
                <div className="absolute left-4 lg:left-[2vw] top-1/2 -translate-y-1/2 w-8 h-8 lg:w-[2.5vw] lg:h-[2.5vw] bg-white/50 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-8 lg:h-[3vw] bg-black/10 rounded-lg"></div>
            </div>

            {/* Day Circle Skeleton */}
            <div className='relative w-full h-24 lg:h-[15vw] z-10'>
                <div className="w-full h-full bg-[#F5DDCA] [clip-path:ellipse(60%_70%_at_50%_0%)] lg:[clip-path:ellipse(50%_50%_at_50%_0%)] relative flex items-center justify-center"></div>
                <div className='absolute top-[10%] left-1/2 -translate-x-1/2 z-20 bg-gray-300 w-20 h-20 lg:w-[12vw] lg:h-[12vw] rounded-full border-4 border-white'></div>
            </div>

            {/* Main Content Skeleton */}
            <div className='w-full flex flex-col gap-6 lg:gap-[1vw] p-4 lg:p-[2vw] z-10 mt-[-40px] lg:mt-[-2vw]'>
                {/* Status Badge */}
                <div className='ml-auto w-32 h-8 lg:w-[10vw] lg:h-[2vw] bg-gray-300 rounded-full shadow-md'></div>

                {/* Grid Layout */}
                <div className='flex flex-col lg:grid lg:grid-cols-8 w-full z-10 gap-6 lg:gap-[2vw] items-stretch'>
                    
                    {/* Left Column */}
                    <div className='flex flex-col gap-6 lg:gap-[1vw] lg:col-span-3'>
                        {/* Components Box */}
                        <div className='bg-gray-100 rounded-xl lg:rounded-[1vw] overflow-hidden h-64 lg:h-[20vw]'>
                            <div className='h-12 lg:h-[4vw] bg-gray-300 w-full'></div>
                            <div className='p-4 lg:p-[1vw] flex flex-col gap-3 lg:gap-[1vw]'>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className='h-4 lg:h-[1.2vw] bg-gray-200 rounded w-3/4'></div>
                                ))}
                            </div>
                        </div>

                        {/* Nutrition Box */}
                        <div className='flex flex-col gap-4 lg:gap-[1vw]'>
                            <div className='h-6 lg:h-[2vw] w-1/3 bg-gray-300 rounded'></div>
                            <div className='w-full rounded-xl lg:rounded-[1vw] overflow-hidden border-2 lg:border-[0.15vw] border-gray-200'>
                                <div className='h-12 lg:h-[3vw] bg-gray-300 w-full'></div>
                                <div className='bg-gray-50 flex flex-col'>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className='h-12 lg:h-[3vw] border-b border-gray-200 flex items-center px-4'>
                                            <div className='w-[60%] h-3 lg:h-[1vw] bg-gray-200 rounded'></div>
                                            <div className='w-[40%] h-3 lg:h-[1vw] bg-gray-200 rounded ml-4'></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='flex flex-col gap-6 lg:gap-[1vw] lg:col-span-5'>
                        {/* Risks Box */}
                        <div className='bg-gray-100 rounded-xl lg:rounded-[1vw] overflow-hidden'>
                            <div className='h-12 lg:h-[4vw] bg-gray-300 w-full'></div>
                            <div className='p-4 lg:p-[1.5vw] flex flex-col gap-6 lg:gap-[2vw]'>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className='flex flex-col gap-2'>
                                        <div className='h-5 lg:h-[1.5vw] w-1/4 bg-gray-300 rounded'></div>
                                        <div className='h-3 lg:h-[1vw] w-1/2 bg-gray-200 rounded'></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation & Accuracy */}
                        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-[1vw]'>
                            <div className='bg-gray-100 rounded-xl lg:rounded-[1vw] lg:col-span-2 overflow-hidden h-40 lg:h-[16.5vw]'>
                                <div className='h-12 lg:h-[4vw] bg-gray-300 w-full'></div>
                                <div className='p-4 lg:p-[1vw] flex flex-col gap-2'>
                                    <div className='h-3 lg:h-[1vw] bg-gray-200 rounded w-full'></div>
                                    <div className='h-3 lg:h-[1vw] bg-gray-200 rounded w-5/6'></div>
                                    <div className='h-3 lg:h-[1vw] bg-gray-200 rounded w-4/5'></div>
                                </div>
                            </div>
                            <div className='flex flex-col items-center justify-center p-4 lg:p-[1vw] bg-gray-300 rounded-xl lg:rounded-[1vw] h-40 lg:h-[16.5vw]'>
                                <div className='h-5 lg:h-[2vw] w-1/2 bg-gray-400/50 rounded mb-2'></div>
                                <div className='rounded-full w-20 h-20 lg:w-[8vw] lg:h-[8vw] bg-gray-100 border-4 border-gray-400/30'></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Skeleton */}
                <div className="flex items-center gap-2 lg:gap-[1vw] px-2 lg:px-[1vw] mt-4 lg:mt-0 w-full">
                   <div className='w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw] bg-gray-300 rounded-full'></div>
                   <div className='h-4 lg:h-[1.2vw] w-1/3 bg-gray-300 rounded'></div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
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
                const response = await fetchWithAuth(`/sppg/menus/${id}`, { method: 'GET' });
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

    if (loading) return <SkeletonDetailMenu />;
    
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-red-500 satoshiBold text-xl lg:text-[2vw]">Error: {error}</p>
            <button onClick={() => router.back()} className="px-4 py-2 bg-[#E87E2F] text-white rounded-lg">Kembali</button>
        </div>
    );

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
        <div className="flex flex-col min-h-screen items-center bg-white relative font-sans overflow-x-hidden">
            {/* Header / Judul */}
            <div className="relative w-full bg-[#F5DDCA] z-20 px-4 lg:px-0">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 lg:left-[2vw] top-1/2 -translate-y-1/2 p-2 lg:p-[0.5vw] rounded-full hover:bg-black/5 transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw]">
                        <path d="M15 19L8 12L15 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h1 className='satoshiBold text-2xl lg:text-[3.5vw] text-black text-center py-6 lg:py-[2vw] max-w-[80%] mx-auto leading-tight'>
                    {menuData.nama_menu}
                </h1>
            </div>

            {/* Dekorasi Hari (Bulat Oranye) */}
            <div className='relative w-full h-24 lg:h-[15vw] z-10'>
                <div className="w-full h-full bg-[#F5DDCA] [clip-path:ellipse(60%_70%_at_50%_0%)] lg:[clip-path:ellipse(50%_50%_at_50%_0%)] relative flex items-center justify-center"></div>
                <h2 className='absolute text-xl lg:text-[3vw] text-white top-[10%] left-1/2 -translate-x-1/2 satoshiBold z-20 bg-[#D7762E] w-20 h-20 lg:w-[12vw] lg:h-[12vw] flex items-center justify-center rounded-full shadow-lg'>
                    {menuData.hari}
                </h2>
            </div>

            {/* Konten Utama */}
            <div className='w-full flex flex-col gap-6 lg:gap-[1vw] p-4 lg:p-[2vw] z-10 mt-[-40px] lg:mt-[-2vw]'>

                {/* Status Badge */}
                <h4 className='satoshiBold text-white text-sm lg:text-[1.5vw] px-4 py-2 lg:px-[1vw] lg:py-[0.5vw] rounded-full w-fit flex items-end ml-auto shadow-md'
                    style={{ backgroundColor: bgColor }}
                >
                    {statusText}
                </h4>

                {/* Grid Layout Utama */}
                <div className='flex flex-col lg:grid lg:grid-cols-8 w-full z-10 gap-6 lg:gap-[2vw] items-stretch'>

                    {/* --- Kolom Kiri (Komponen & Gizi) --- */}
                    <div className='flex flex-col gap-6 lg:gap-[1vw] lg:col-span-3'>

                        {/* Komponen Menu */}
                        <div className='bg-[#F5DDCA] rounded-xl lg:rounded-[1vw] shadow-md overflow-hidden'>
                            <h2 className='satoshiBold text-lg lg:text-[2vw] p-3 lg:p-[1vw] bg-[#E87E2F] text-white'>Komponen Menu</h2>
                            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 lg:gap-x-[2vw] w-full list-disc list-inside text-black satoshiMedium text-base lg:text-[1.3vw] p-4 lg:p-[1vw]">
                                {componentsList.map((component, index) => (
                                    <li key={index}>{component}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Kandungan Gizi */}
                        <div className='flex flex-col gap-4 lg:gap-[1vw]'>
                            <h2 className='satoshiBold text-xl lg:text-[2vw]'>Kandungan Gizi</h2>
                            <div
                                className='w-full rounded-xl lg:rounded-[1vw] overflow-hidden border-2 lg:border-[0.15vw] border-[#D7762E]'
                                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                            >
                                <div className='flex bg-[#D7762E] text-white h-12 lg:h-[3vw] items-center'>
                                    <div className='w-[60%] pl-4 lg:pl-[1.5vw] satoshiBold text-base lg:text-[1.2vw]'>Komponen</div>
                                    <div className='w-[2px] lg:w-[0.3%] h-full bg-[#F5DDCA]'></div>
                                    <div className='w-[40%] pl-4 lg:pl-[1.5vw] satoshiBold text-base lg:text-[1.2vw]'>Jumlah</div>
                                </div>
                                <div className='bg-[#FBE4CF]'>
                                    {nutritionList.map((item, index) => (
                                        <div
                                            key={index}
                                            className='flex border-b lg:border-b-[0.1vw] border-[#E87E2F] last:border-0 h-12 lg:h-[3vw] items-center'
                                        >
                                            <div className='w-[60%] pl-4 lg:pl-[1.5vw] satoshiBold text-sm lg:text-[1.1vw] text-black'>
                                                {item.label}
                                            </div>
                                            <div className='w-[2px] lg:w-[0.3%] h-full bg-[#E87E2F]'></div>
                                            <div className='w-[40%] pl-4 lg:pl-[1.5vw] satoshiMedium text-sm lg:text-[1.1vw] text-black'>
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Kolom Kanan (Risiko & Rekomendasi) --- */}
                    <div className='flex flex-col gap-6 lg:gap-[1vw] lg:col-span-5'>
                        {/* Deteksi Risiko */}
                        <div className='bg-[#F5DDCA] rounded-xl lg:rounded-[1vw] shadow-md overflow-hidden'>
                            <h2 className='satoshiBold text-lg lg:text-[2vw] p-3 lg:p-[1vw] bg-[#E87E2F] text-white'>Deteksi Risiko</h2>
                            <div className='p-4 lg:p-[1.5vw] flex flex-col gap-4 lg:gap-[1vw]'>
                                <div className='flex flex-col gap-1 lg:gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-base lg:text-[1.5vw] text-black'>Alergi</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-sm lg:text-[1.3vw] text-black pl-2 lg:pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.alergi.length > 0 ? menuData.deteksi_risiko.alergi.map((item, index) => <li key={index}>{item}</li>) : <li>Tidak ada risiko terdeteksi</li>}
                                    </ul>
                                </div>
                                <div className='flex flex-col gap-1 lg:gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-base lg:text-[1.5vw] text-black'>Tekstur</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-sm lg:text-[1.3vw] text-black pl-2 lg:pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.tekstur.length > 0 ? menuData.deteksi_risiko.tekstur.map((item, index) => <li key={index}>{item}</li>) : <li>Tidak ada risiko terdeteksi</li>}
                                    </ul>
                                </div>
                                <div className='flex flex-col gap-1 lg:gap-[0.5vw]'>
                                    <h3 className='satoshiBold text-base lg:text-[1.5vw] text-black'>Porsi Gizi</h3>
                                    <ul className='list-disc list-inside satoshiMedium text-sm lg:text-[1.3vw] text-black pl-2 lg:pl-[0.5vw]'>
                                        {menuData.deteksi_risiko.porsi_gizi.length > 0 ? menuData.deteksi_risiko.porsi_gizi.map((item, index) => <li key={index}>{item}</li>) : <li>Tidak ada risiko terdeteksi</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Rekomendasi & Akurasi AI */}
                        <div className='flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-[1vw]'>
                            <div className='bg-[#F5DDCA] rounded-xl lg:rounded-[1vw] lg:col-span-2 shadow-md overflow-hidden'>
                                <h2 className='satoshiBold text-lg lg:text-[2vw] p-3 lg:p-[1vw] bg-[#E87E2F] text-white'>Rekomendasi</h2>
                                <ul className="list-disc list-inside text-black satoshiMedium text-sm lg:text-[1.3vw] p-4 lg:p-[1vw] leading-relaxed text-justify">
                                    {recommendationList.map((recommendations, index) => (
                                        <li key={index}>{recommendations}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className='flex flex-col items-center justify-center p-4 lg:p-[1vw] bg-[#D7762E] rounded-xl lg:rounded-[1vw] h-40 lg:h-[16.5vw] shadow-md'>
                                <h2 className='satoshiBold text-lg lg:text-[2vw] text-white text-center mb-2 lg:mb-[1vw]'>Akurasi AI</h2>
                                <div className='bg-white/20 rounded-full w-20 h-20 lg:w-[8vw] lg:h-[8vw] flex items-center justify-center border-4 lg:border-[0.3vw] border-white backdrop-blur-sm'>
                                    <span className='satoshiBold text-xl lg:text-[2.5vw] text-white'>
                                        {String(menuData.ml_confidence).slice(0, 2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catatan Tambahan */}
                <div className="flex items-start lg:items-center gap-2 lg:gap-[1vw] px-2 lg:px-[1vw] mt-4 lg:mt-0">
                    {menuData.catatan_tambahan ? (
                        <h1 className='satoshiBold text-sm lg:text-[1.2vw] text-black'>
                            Catatan: {menuData.catatan_tambahan}
                        </h1>
                    ) : (
                        <div className="flex items-center gap-2 lg:gap-[1vw]">
                            <div className="shrink-0 w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw]">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7.75 12.75L10.58 15.58L16.25 9.91" stroke="#07B563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="satoshiBold font-bold text-sm lg:text-[1.2vw] leading-relaxed text-[#07B563]">
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