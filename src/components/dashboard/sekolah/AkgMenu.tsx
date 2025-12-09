'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import detailCircle from "../../../assets/dashboard/sekolah/detail-circle.png";

// --- INTERFACES SESUAI JSON API ---
interface ChartItem {
    label: string;
    persentase: number;
}

interface DonutChart {
    lemak: ChartItem;
    lainnya: ChartItem;
    protein: ChartItem;
    karbohidrat: ChartItem;
}

interface NutrisiVal {
    label: string;
    nilai: string;
}

interface TetapanAkg {
    lemak: string;
    serat: string;
    energi: string;
    sodium: string;
    protein: string;
    karbohidrat: string;
}

interface InformasiAkg {
    fungsi: string;
    pengertian: string;
    tetapan_akg: TetapanAkg;
}

interface PersentaseAkg {
    gula: NutrisiVal;
    lemak: NutrisiVal;
    serat: NutrisiVal;
    kalori: NutrisiVal;
    sodium: NutrisiVal;
    protein: NutrisiVal;
    karbohidrat: NutrisiVal;
}

interface KomponenDetail {
    nama: string;
    berat: string;
    kalori: number;
    satuan_kalori: string;
    nutrisi: {
        gula: NutrisiVal;
        lemak: NutrisiVal;
        serat: NutrisiVal;
        sodium: NutrisiVal;
        protein: NutrisiVal;
        karbohidrat: NutrisiVal;
    };
}

interface MenuNutritionResponse {
    menu_id: string;
    nama_menu: string;
    deskripsi: string;
    info_nutrisi: {
        donut_chart: DonutChart;
        total_porsi: string;
        total_kalori: number;
    };
    informasi_akg: InformasiAkg;
    persentase_akg: PersentaseAkg;
    komponen_detail: KomponenDetail[];
}

// --- FUNGSI HELPER TRIGONOMETRI ---
const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const middleAngle = startAngle + (endAngle - startAngle) / 2;
    const radian = (middleAngle - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(radian);
    const y = 50 + radius * Math.sin(radian);
    return { x: `${x}%`, y: `${y}%` };
};

const AkgMenu = () => {
    const params = useParams();
    const id = params?.id as string;
    
    // --- STATE ---
    const [menuData, setMenuData] = useState<MenuNutritionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Endpoint: /nutrition/menus/{menu_id}
                const response = await fetchWithAuth(`https://api.inkluzi.my.id/api/v1/nutrition/menus/${id}`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error("Gagal mengambil data nutrisi");

                const result = await response.json();
                
                // PERBAIKAN DISINI: 
                // Cek apakah data ada di result.data (wrapper) atau langsung di result
                if (result.data) {
                    setMenuData(result.data);
                } else {
                    // Jika JSON langsung mengembalikan objek menu tanpa wrapper "data"
                    setMenuData(result);
                }

            } catch (error) {
                console.error("Error fetching nutrition detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><span className="satoshiBold text-[#E87E2F] text-[1.5vw]">Memuat Data Nutrisi...</span></div>;
    }

    if (!menuData) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><span className="satoshiBold text-gray-500 text-[1.5vw]">Data tidak ditemukan.</span></div>;
    }

    // --- PERSIAPAN DATA CHART ---
    const chartData = menuData.info_nutrisi.donut_chart;
    // Gunakan optional chaining (?.) atau nilai default 0 untuk keamanan jika data 0/null
    const karbo = chartData.karbohidrat?.persentase || 0;
    const protein = chartData.protein?.persentase || 0;
    const lemak = chartData.lemak?.persentase || 0;
    const lainnya = chartData.lainnya?.persentase || 0;

    const colors = ['#E87E2F', '#FF8A34', '#FFA15D', '#FFC9A2'];
    
    // Hitung Cumulative Percentage untuk Conic Gradient
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

    // Helper Array untuk Render
    const tetapanAkgList = [
        `Energi ${menuData.informasi_akg.tetapan_akg.energi}`,
        `Lemak ${menuData.informasi_akg.tetapan_akg.lemak}`,
        `Karbo ${menuData.informasi_akg.tetapan_akg.karbohidrat}`,
        `Serat ${menuData.informasi_akg.tetapan_akg.serat}`,
        `Protein ${menuData.informasi_akg.tetapan_akg.protein}`,
        `Sodium ${menuData.informasi_akg.tetapan_akg.sodium}`,
    ];

    const persentaseAkgList = [
        menuData.persentase_akg.karbohidrat,
        menuData.persentase_akg.protein,
        menuData.persentase_akg.lemak,
        menuData.persentase_akg.serat,
        menuData.persentase_akg.gula,
        menuData.persentase_akg.sodium,
    ];

    return (
        <div className="flex flex-col gap-[5vw] w-full min-h-screen bg-white pb-[5vw] font-sans relative">

            {/* --- POPUP INFORMASI AKG --- */}
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
                        
                        <div>
                            <h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Pengertian</h3>
                            <p className="satoshiMedium text-[1.1vw] text-black text-justify leading-relaxed">
                                {menuData.informasi_akg.pengertian}
                            </p>
                        </div>

                        <div>
                            <h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Fungsi</h3>
                            <p className="satoshiMedium text-[1.1vw] text-black text-justify leading-relaxed">
                                {menuData.informasi_akg.fungsi}
                            </p>
                        </div>

                        <div>
                            <h3 className="satoshiBold text-[1.5vw] text-black mb-[0.5vw]">Tetapan AKG</h3>
                            <ul className="grid grid-cols-2 gap-x-[2vw] gap-y-[0.5vw] list-disc list-inside satoshiMedium text-[1.1vw] text-black">
                                {tetapanAkgList.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
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

                {/* --- BAGIAN 1: DIAGRAM & DESKRIPSI --- */}
                <div className="flex flex-row gap-[2vw] items-center">
                    {/* KIRI: Diagram Lingkaran */}
                    <div className="w-full flex items-center justify-center relative">
                        <div className="w-[25vw] h-[25vw] rounded-full relative"
                            style={{ background: chartGradient, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div className="absolute inset-[5vw] bg-white rounded-full flex flex-col items-center justify-center shadow-inner z-20">
                                <span className="satoshiBold text-[3.5vw] text-black leading-none">{menuData.info_nutrisi.total_kalori}</span>
                                <span className="satoshiMedium text-[1.2vw] text-gray-500">kalori</span>
                            </div>
                            
                            {/* Label Chart */}
                            {karbo > 0 && (
                                <div className="absolute z-10 flex flex-col items-center text-center"
                                    style={{ left: posKarbo.x, top: posKarbo.y, transform: 'translate(-50%, -50%)' }}>
                                    <p className="text-[1vw] text-gray-600 mb-[-0.2vw]">Karbohidrat</p>
                                    <p className="text-[1.3vw] satoshiBold" style={{ color: colors[0] }}>{karbo}%</p>
                                </div>
                            )}
                            {protein > 0 && (
                                <div className="absolute z-10 flex flex-col items-center text-center"
                                    style={{ left: posProtein.x, top: posProtein.y, transform: 'translate(-50%, -50%)' }}>
                                    <p className="text-[1vw] text-gray-600 mb-[-0.2vw]">Protein</p>
                                    <p className="text-[1.3vw] satoshiBold" style={{ color: colors[1] }}>{protein}%</p>
                                </div>
                            )}
                            {lemak > 0 && (
                                <div className="absolute z-10 flex flex-col items-center text-center"
                                    style={{ left: posLemak.x, top: posLemak.y, transform: 'translate(-50%, -50%)' }}>
                                    <p className="text-[1vw] text-gray-600 mb-[-0.2vw]">Lemak</p>
                                    <p className="text-[1.3vw] satoshiBold" style={{ color: colors[2] }}>{lemak}%</p>
                                </div>
                            )}
                            {lainnya > 0 && (
                                <div className="absolute z-10 flex flex-col items-center text-center"
                                    style={{ left: posLainnya.x, top: posLainnya.y, transform: 'translate(-50%, -50%)' }}>
                                    <p className="text-[1vw] text-gray-600 mb-[-0.2vw]">Lainnya</p>
                                    <p className="text-[1.3vw] satoshiBold" style={{ color: colors[3] }}>{lainnya}%</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KANAN: Deskripsi Makanan */}
                    <div className="w-full bg-[#E87E2F] rounded-[2vw] gap-[1vw] p-[2vw] text-white flex flex-col"
                        style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                    >
                        <div>
                            <h2 className="satoshiBold text-[3vw]">{menuData.nama_menu}</h2>
                        </div>
                        <div className="flex flex-row gap-[1vw] items-center">
                            <p className="satoshiMedium text-[1.1vw] w-full text-justify">
                                {menuData.deskripsi}
                            </p>
                            <div className='w-[40%] flex flex-col p-[1vw] rounded-[1vw] gap-[1vw] items-center bg-[#FFF3EB] text-[#D7762E] shrink-0'>
                                <p className="satoshiMedium text-[2vw]">Total Porsi</p>
                                <p className="satoshiBold text-[2.5vw] leading-tight text-center">{menuData.info_nutrisi.total_porsi}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN 2: Persentase AKG --- */}
                <div className="w-full flex flex-col gap-[1vw]">
                    <div className="flex justify-between items-end">
                        <div className='flex flex-row items-center gap-[1vw]'>
                            <h3 className="satoshiBold text-[2vw] text-black">Persentase AKG</h3>
                            <button 
                                onClick={() => setIsPopupOpen(true)}
                                className="hover:opacity-80 transition-opacity focus:outline-none"
                            >
                                <Image src={detailCircle} alt="detail icon" className="w-[2.5vw] h-[2.5vw] cursor-pointer" />
                            </button>
                        </div>
                        <span className="text-[#D98848] satoshiMedium text-[1.2vw]">
                            {menuData.persentase_akg.kalori.label} {menuData.persentase_akg.kalori.nilai}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-[3vw] gap-y-[1.5vw]">
                        {persentaseAkgList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-[0.2vw] border-[#E87E2F] bg-[#FFF3EB] rounded-[1vw] px-[1.5vw] py-[0.8vw]">
                                <span className="text-[#D7762E] satoshiBold text-[1.3vw]">{item.label}</span>
                                <span className="text-[#D7762E] satoshiMedium text-[1.3vw]">{item.nilai}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- BAGIAN 3: Detail Komponen --- */}
                <div className="w-full relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2vw] bg-[#E87E2F] rounded-full -translate-x-1/2 hidden lg:block"></div>
                    <div className="grid grid-cols-2 gap-x-[15vw] gap-y-[1.5vw]"> 
                        {menuData.komponen_detail.map((comp, idx) => (
                            <div key={idx} className="bg-[#E87E2F] rounded-[1.5vw] p-[1.5vw] text-white shadow-md flex flex-col gap-[1vw]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="satoshiBold text-[1.5vw]">{comp.nama}</h4>
                                        <span className="text-[1.2vw] opacity-90">{comp.berat}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block satoshiBold text-[1.5vw]">{comp.kalori}</span>
                                        <span className="text-[1.2vw] opacity-90">{comp.satuan_kalori}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-[1vw]">
                                    <NutrientBox label={comp.nutrisi.karbohidrat.label} value={comp.nutrisi.karbohidrat.nilai} />
                                    <NutrientBox label={comp.nutrisi.protein.label} value={comp.nutrisi.protein.nilai} />
                                    <NutrientBox label={comp.nutrisi.lemak.label} value={comp.nutrisi.lemak.nilai} />
                                    <NutrientBox label={comp.nutrisi.gula.label} value={comp.nutrisi.gula.nilai} />
                                    <NutrientBox label={comp.nutrisi.serat.label} value={comp.nutrisi.serat.nilai} />
                                    <NutrientBox label={comp.nutrisi.sodium.label} value={comp.nutrisi.sodium.nilai} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const NutrientBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-[#FFF3E0] rounded-[1vw] py-[0.5vw] flex flex-col items-center justify-center text-center h-full">
        <span className="satoshiBold text-[#8C4C1D] text-[1.2vw] leading-tight break-all">{value}</span>
        <span className="text-[#8C4C1D] opacity-90 satoshiMedium text-[1vw] mt-[0.2vw]">{label}</span>
    </div>
);

export default AkgMenu;