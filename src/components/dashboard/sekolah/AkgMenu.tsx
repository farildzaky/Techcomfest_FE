'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import detailCircle from "../../../assets/dashboard/sekolah/detail-circle.png";

// --- INTERFACES (Update: Field dibuat optional '?' untuk mencegah error TypeScript) ---
interface ChartItem {
    label: string;
    persentase: number;
}

interface DonutChart {
    lemak?: ChartItem;
    lainnya?: ChartItem;
    protein?: ChartItem;
    karbohidrat?: ChartItem;
}

interface NutrisiVal {
    label: string;
    nilai: string;
}

interface TetapanAkg {
    lemak?: string;
    serat?: string;
    energi?: string;
    sodium?: string;
    protein?: string;
    karbohidrat?: string;
}

interface InformasiAkg {
    fungsi?: string;
    pengertian?: string;
    tetapan_akg?: TetapanAkg;
}

interface PersentaseAkg {
    gula?: NutrisiVal;
    lemak?: NutrisiVal;
    serat?: NutrisiVal;
    kalori?: NutrisiVal;
    sodium?: NutrisiVal;
    protein?: NutrisiVal;
    karbohidrat?: NutrisiVal;
}

interface KomponenNutrisi {
    gula?: NutrisiVal;
    lemak?: NutrisiVal;
    serat?: NutrisiVal;
    sodium?: NutrisiVal;
    protein?: NutrisiVal;
    karbohidrat?: NutrisiVal;
}

interface KomponenDetail {
    nama: string;
    berat: string;
    kalori: number;
    satuan_kalori: string;
    nutrisi?: KomponenNutrisi; // Bisa undefined
}

interface MenuNutritionResponse {
    menu_id: string;
    nama_menu: string;
    deskripsi: string;
    info_nutrisi?: {
        donut_chart?: DonutChart;
        total_porsi?: string;
        total_kalori?: number;
    };
    informasi_akg?: InformasiAkg;
    persentase_akg?: PersentaseAkg;
    komponen_detail?: KomponenDetail[];
}

// Helper Function
const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const middleAngle = startAngle + (endAngle - startAngle) / 2;
    const radian = (middleAngle - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(radian);
    const y = 50 + radius * Math.sin(radian);
    return { x: `${x}%`, y: `${y}%` };
};

const AkgMenu = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    
    const [menuData, setMenuData] = useState<MenuNutritionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetchWithAuth(`/nutrition/menus/${id}`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error("Gagal mengambil data nutrisi");

                const result = await response.json();
                
                // Normalisasi Data: Handle jika dibungkus .data atau langsung object
                const data = result.data || result;
                
                // Validasi minimal: Jika data null, lempar error agar masuk ke catch
                if (!data) throw new Error("Data kosong dari server");

                setMenuData(data);

            } catch (error) {
                console.error("Error fetching nutrition detail:", error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // --- UI LOADING (SKELETON) ---
    if (loading) {
        return (
            <div className="flex flex-col gap-[5vw] w-full min-h-screen bg-white pb-[5vw] font-sans relative">
                <div className="w-full relative">
                    <div className="satoshiBold text-[3vw] w-full p-[2vw] px-[3vw] bg-[#E87E2F] rounded-b-[2vw] flex"
                        style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                    >
                        <div className="h-[3vw] bg-white/30 rounded animate-pulse w-[40%]" />
                    </div>
                </div>

                <div className="px-[3vw] flex flex-col gap-[3vw]">
                    <div className="flex flex-row gap-[2vw] items-center">
                        <div className="w-full flex items-center justify-center relative">
                            <div className="w-[25vw] h-[25vw] rounded-full relative bg-gray-300 animate-pulse"
                                style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                            >
                                <div className="absolute inset-[5vw] bg-white rounded-full flex flex-col items-center justify-center shadow-inner z-20">
                                    <div className="h-[3.5vw] bg-gray-300 rounded animate-pulse w-[8vw] mb-[0.5vw]" />
                                    <div className="h-[1.2vw] bg-gray-300 rounded animate-pulse w-[4vw]" />
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-[#E87E2F] rounded-[2vw] gap-[1vw] p-[2vw] flex flex-col"
                            style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div className="h-[3vw] bg-white/30 rounded animate-pulse w-[70%]" />
                            <div className="flex flex-row gap-[1vw] items-center">
                                <div className="w-full space-y-[0.5vw]">
                                    <div className="h-[1.1vw] bg-white/30 rounded animate-pulse w-[100%]" />
                                    <div className="h-[1.1vw] bg-white/30 rounded animate-pulse w-[95%]" />
                                    <div className="h-[1.1vw] bg-white/30 rounded animate-pulse w-[90%]" />
                                    <div className="h-[1.1vw] bg-white/30 rounded animate-pulse w-[85%]" />
                                </div>
                                <div className='w-[40%] flex flex-col p-[1vw] rounded-[1vw] gap-[1vw] items-center bg-[#FFF3EB] shrink-0'>
                                    <div className="h-[2vw] bg-gray-300 rounded animate-pulse w-[80%]" />
                                    <div className="h-[2.5vw] bg-gray-300 rounded animate-pulse w-[60%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[1vw]">
                        <div className="flex justify-between items-end">
                            <div className='flex flex-row items-center gap-[1vw]'>
                                <div className="h-[2vw] bg-gray-300 rounded animate-pulse w-[15vw]" />
                                <div className="w-[2.5vw] h-[2.5vw] bg-gray-300 rounded-full animate-pulse" />
                            </div>
                            <div className="h-[1.2vw] bg-gray-300 rounded animate-pulse w-[12vw]" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[1.5vw]">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex justify-between items-center border-[0.2vw] border-[#E87E2F] bg-[#FFF3EB] rounded-[1vw] px-[1.5vw] py-[0.8vw]">
                                    <div className="h-[1.3vw] bg-gray-300 rounded animate-pulse w-[40%]" />
                                    <div className="h-[1.3vw] bg-gray-300 rounded animate-pulse w-[30%]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[2vw] bg-[#E87E2F] rounded-full -translate-x-1/2 hidden lg:block"></div>
                        <div className="grid grid-cols-2 gap-x-[15vw] gap-y-[1.5vw]">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-[#E87E2F] rounded-[1.5vw] p-[1.5vw] shadow-md flex flex-col gap-[1vw]">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-[0.3vw]">
                                            <div className="h-[1.5vw] bg-white/30 rounded animate-pulse w-[10vw]" />
                                            <div className="h-[1.2vw] bg-white/30 rounded animate-pulse w-[6vw]" />
                                        </div>
                                        <div className="space-y-[0.3vw]">
                                            <div className="h-[1.5vw] bg-white/30 rounded animate-pulse w-[4vw]" />
                                            <div className="h-[1.2vw] bg-white/30 rounded animate-pulse w-[5vw]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-[1vw]">
                                        {[1, 2, 3, 4, 5, 6].map((j) => (
                                            <div key={j} className="bg-[#FFF3E0] rounded-[1vw] py-[0.5vw] flex flex-col items-center justify-center h-[4vw]">
                                                <div className="h-[1.2vw] bg-gray-300 rounded animate-pulse w-[50%] mb-[0.2vw]" />
                                                <div className="h-[1vw] bg-gray-300 rounded animate-pulse w-[60%]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- UI ERROR ---
    if (error || !menuData) {
        return (
            <div className="flex flex-col gap-[3vw] w-full min-h-screen bg-white items-center justify-center px-[3vw]">
                <div className="flex flex-col items-center gap-[2vw] max-w-[50vw]">
                    <div className="w-[10vw] h-[10vw] rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[6vw] h-[6vw] text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    
                    <div className="flex flex-col items-center gap-[1vw] text-center">
                        <h2 className="satoshiBold text-[2.5vw] text-gray-800">Gagal Memuat Data</h2>
                        <p className="satoshiMedium text-[1.3vw] text-gray-600">
                            {error || "Data nutrisi tidak ditemukan atau terjadi kesalahan pada server."}
                        </p>
                    </div>

                    <div className="flex gap-[1vw] mt-[1vw]">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#E87E2F] text-white rounded-[1vw] px-[2.5vw] py-[0.8vw] satoshiBold text-[1.3vw] shadow-md hover:bg-[#d06b1f] transition-all cursor-pointer flex items-center gap-[0.5vw]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.5vw] h-[1.5vw]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Muat Ulang
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-200 text-gray-700 rounded-[1vw] px-[2.5vw] py-[0.8vw] satoshiBold text-[1.3vw] shadow-md hover:bg-gray-300 transition-all cursor-pointer"
                        >
                            Kembali ke Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- DATA PREPARATION (SAFE ACCESS WITH DEFAULT VALUES) ---
    // Ini bagian penting untuk mencegah crash pada data yang tidak lengkap
    const chartData = menuData?.info_nutrisi?.donut_chart || {};
    const karbo = chartData.karbohidrat?.persentase || 0;
    const protein = chartData.protein?.persentase || 0;
    const lemak = chartData.lemak?.persentase || 0;
    const lainnya = chartData.lainnya?.persentase || 0;

    const colors = ['#E87E2F', '#FF8A34', '#FFA15D', '#FFC9A2'];
    const p1 = karbo;
    const p2 = karbo + protein;
    const p3 = karbo + protein + lemak;

    const chartGradient = `conic-gradient(
        ${colors[0]} 0% ${p1}%, 
        ${colors[1]} ${p1}% ${p2}%, 
        ${colors[2]} ${p2}% ${p3}%, 
        ${colors[3]} ${p3}% 100%
    )`;

    const labelRadius = 63;
    const posKarbo = getLabelPosition(0, p1 * 3.6, labelRadius);
    const posProtein = getLabelPosition(p1 * 3.6, p2 * 3.6, labelRadius);
    const posLemak = getLabelPosition(p2 * 3.6, p3 * 3.6, labelRadius);
    const posLainnya = getLabelPosition(p3 * 3.6, 360, labelRadius);

    const infoAkg = menuData?.informasi_akg || {};
    const tetapanAkg = infoAkg.tetapan_akg || {};

    const tetapanAkgList = [
        `Energi ${tetapanAkg.energi || '-'}`,
        `Lemak ${tetapanAkg.lemak || '-'}`,
        `Karbo ${tetapanAkg.karbohidrat || '-'}`,
        `Serat ${tetapanAkg.serat || '-'}`,
        `Protein ${tetapanAkg.protein || '-'}`,
        `Sodium ${tetapanAkg.sodium || '-'}`
    ];

    const persentase = menuData?.persentase_akg || {};
    const persentaseAkgList = [
        persentase.karbohidrat || { label: 'Karbohidrat', nilai: '0%' },
        persentase.protein || { label: 'Protein', nilai: '0%' },
        persentase.lemak || { label: 'Lemak', nilai: '0%' },
        persentase.serat || { label: 'Serat', nilai: '0%' },
        persentase.gula || { label: 'Gula', nilai: '0%' },
        persentase.sodium || { label: 'Sodium', nilai: '0%' },
    ];

    const komponenDetail = menuData?.komponen_detail || [];

    return (
        <div className="flex flex-col gap-[5vw] w-full min-h-screen bg-white pb-[1vw] font-sans relative">

            {isPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[3vw]">
                    <div className="bg-white w-[50vw] rounded-[2vw] p-[3vw] shadow-2xl relative flex flex-col gap-[1.5vw] animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsPopupOpen(false)}
                            className="absolute top-[1.5vw] right-[1.5vw] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[2vw] h-[2vw]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div><h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Pengertian</h3><p className="satoshiMedium text-[1.1vw] text-black text-justify leading-relaxed">{infoAkg.pengertian || "Tidak ada data."}</p></div>
                        <div><h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Fungsi</h3><p className="satoshiMedium text-[1.1vw] text-black text-justify leading-relaxed">{infoAkg.fungsi || "Tidak ada data."}</p></div>
                        <div><h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Tetapan AKG</h3><ul className="grid grid-cols-2 gap-x-[2vw] gap-y-[0.5vw] list-disc list-inside satoshiMedium text-[1.1vw] text-black">{tetapanAkgList.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>
                    </div>
                </div>
            )}

            <div className="w-full relative">
                <h1 className="satoshiBold text-[3vw] text-white w-full p-[2vw] px-[3vw] bg-[#E87E2F] rounded-b-[2vw]"
                    style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                >
                    Informasi Nutrisi
                </h1>
            </div>

            <div className="px-[3vw] flex flex-col gap-[3vw]">

                {/* --- CHART & DESKRIPSI --- */}
                <div className="flex flex-row gap-[2vw] items-center">
                    <div className="w-full flex items-center justify-center relative">
                        <div className="w-[25vw] h-[25vw] rounded-full relative"
                            style={{ background: chartGradient, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div className="absolute inset-[5vw] bg-white rounded-full flex flex-col items-center justify-center shadow-inner z-20">
                                <span className="satoshiBold text-[3.5vw] text-black leading-none">{menuData?.info_nutrisi?.total_kalori || 0}</span>
                                <span className="satoshiMedium text-[1.2vw] text-gray-500">kalori</span>
                            </div>
                            
                            {karbo > 0 && <LabelChart x={posKarbo.x} y={posKarbo.y} label="Karbohidrat" value={karbo} color={colors[0]} />}
                            {protein > 0 && <LabelChart x={posProtein.x} y={posProtein.y} label="Protein" value={protein} color={colors[1]} />}
                            {lemak > 0 && <LabelChart x={posLemak.x} y={posLemak.y} label="Lemak" value={lemak} color={colors[2]} />}
                            {lainnya > 0 && <LabelChart x={posLainnya.x} y={posLainnya.y} label="Lainnya" value={lainnya} color={colors[3]} />}
                        </div>
                    </div>

                    <div className="w-full bg-[#E87E2F] rounded-[2vw] gap-[1vw] p-[2vw] text-white flex flex-col shadow-md">
                        <div><h2 className="satoshiBold text-[3vw]">{menuData?.nama_menu || "Menu"}</h2></div>
                        <div className="flex flex-row gap-[1vw] items-center">
                            <p className="satoshiMedium text-[1.1vw] w-full text-justify">{menuData?.deskripsi || "Deskripsi tidak tersedia."}</p>
                            <div className='w-[40%] flex flex-col p-[1vw] rounded-[1vw] gap-[1vw] items-center bg-[#FFF3EB] text-[#D7762E] shrink-0'>
                                <p className="satoshiMedium text-[2vw]">Total Porsi</p>
                                <p className="satoshiBold text-[2.5vw] leading-tight text-center">{menuData?.info_nutrisi?.total_porsi || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PERSENTASE AKG --- */}
                <div className="w-full flex flex-col gap-[1vw]">
                    <div className="flex justify-between items-end">
                        <div className='flex flex-row items-center gap-[1vw]'>
                            <h3 className="satoshiBold text-[2vw] text-black">Persentase AKG</h3>
                            <button onClick={() => setIsPopupOpen(true)} className="hover:opacity-80 transition-opacity focus:outline-none">
                                <Image src={detailCircle} alt="detail icon" className="w-[2.5vw] h-[2.5vw] cursor-pointer" />
                            </button>
                        </div>
                        <span className="text-[#D98848] satoshiMedium text-[1.2vw]">
                            {persentase.kalori?.label || "Kalori"} {persentase.kalori?.nilai || "-"}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[1.5vw]">
                        {persentaseAkgList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-[0.2vw] border-[#E87E2F] bg-[#FFF3EB] rounded-[1vw] px-[1.5vw] py-[0.8vw]">
                                <span className="text-[#D7762E] satoshiBold text-[1.3vw]">{item?.label || "-"}</span>
                                <span className="text-[#D7762E] satoshiMedium text-[1.3vw]">{item?.nilai || "0%"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- KOMPONEN DETAIL --- */}
                <div className="w-full relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2vw] bg-[#E87E2F] rounded-full -translate-x-1/2 hidden lg:block"></div>
                    <div className="grid grid-cols-2 gap-x-[15vw] gap-y-[1.5vw]"> 
                        {komponenDetail.map((comp, idx) => (
                            <div key={idx} className="bg-[#E87E2F] rounded-[1.5vw] p-[1.5vw] text-white shadow-md flex flex-col gap-[1vw]">
                                <div className="flex justify-between items-start">
                                    <div><h4 className="satoshiBold text-[1.5vw]">{comp.nama}</h4><span className="text-[1.2vw] opacity-90">{comp.berat}</span></div>
                                    <div className="text-right"><span className="block satoshiBold text-[1.5vw]">{comp.kalori}</span><span className="text-[1.2vw] opacity-90">{comp.satuan_kalori}</span></div>
                                </div>
                                <div className="grid grid-cols-3 gap-[1vw]">
                                    <NutrientBox label={comp.nutrisi?.karbohidrat?.label} value={comp.nutrisi?.karbohidrat?.nilai} />
                                    <NutrientBox label={comp.nutrisi?.protein?.label} value={comp.nutrisi?.protein?.nilai} />
                                    <NutrientBox label={comp.nutrisi?.lemak?.label} value={comp.nutrisi?.lemak?.nilai} />
                                    <NutrientBox label={comp.nutrisi?.gula?.label} value={comp.nutrisi?.gula?.nilai} />
                                    <NutrientBox label={comp.nutrisi?.serat?.label} value={comp.nutrisi?.serat?.nilai} />
                                    <NutrientBox label={comp.nutrisi?.sodium?.label} value={comp.nutrisi?.sodium?.nilai} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => router.back()}
                    className="bg-[#D7762E] text-white rounded-[2vw] w-fit flex ml-auto px-[4vw] py-[0.8vw] satoshiBold text-[1.5vw] shadow-md hover:bg-[#b56225] transition-all cursor-pointer"
                >
                    Kembali
                </button>
            </div>
        </div>
    );
}

const LabelChart = ({ x, y, label, value, color }: { x: string, y: string, label: string, value: number, color: string }) => (
    <div className="absolute z-10 flex flex-col items-center text-center" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
        <p className="text-[1vw] text-gray-600 mb-[-0.2vw]">{label}</p>
        <p className="text-[1.3vw] satoshiBold" style={{ color }}>{value}%</p>
    </div>
);

const NutrientBox = ({ label, value }: { label?: string, value?: string }) => (
    <div className="bg-[#FFF3E0] rounded-[1vw] py-[0.5vw] flex flex-col items-center justify-center text-center h-full">
        <span className="satoshiBold text-[#8C4C1D] text-[1.2vw] leading-tight break-all">{value || "-"}</span>
        <span className="text-[#8C4C1D] opacity-90 satoshiMedium text-[1vw] mt-[0.2vw]">{label || ""}</span>
    </div>
);

export default AkgMenu;