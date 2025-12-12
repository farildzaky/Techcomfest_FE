'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';
import detailCircle from "../../../assets/dashboard/sekolah/detail-circle.png";

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
    nutrisi?: KomponenNutrisi;
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

    const [labelRadius, setLabelRadius] = useState(63);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setLabelRadius(60);
            } else {
                setLabelRadius(63);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                const data = result.data || result;
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

    if (loading) {
        return (
            <div className="flex flex-col gap-6 lg:gap-[5vw] w-full min-h-screen bg-white pb-8 lg:pb-[5vw] font-sans relative">
                <div className="w-full relative">
                    <div className="w-full p-6 lg:p-[2vw] px-4 lg:px-[3vw] bg-[#E87E2F] rounded-b-3xl lg:rounded-b-[2vw] flex shadow-md">
                        <div className="h-8 lg:h-[3vw] bg-white/30 rounded animate-pulse w-1/2 lg:w-[40%]" />
                    </div>
                </div>

                <div className="px-4 lg:px-[3vw] flex flex-col gap-8 lg:gap-[3vw]">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-[2vw] items-center">
                        <div className="w-full flex items-center justify-center relative">
                            <div className="w-64 h-64 lg:w-[25vw] lg:h-[25vw] rounded-full relative bg-gray-300 animate-pulse"></div>
                        </div>

                        <div className="w-full bg-[#E87E2F] rounded-2xl lg:rounded-[2vw] gap-4 lg:gap-[1vw] p-6 lg:p-[2vw] flex flex-col shadow-md">
                            <div className="h-8 lg:h-[3vw] bg-white/30 rounded animate-pulse w-[70%]" />
                            <div className="flex flex-col lg:flex-row gap-4 lg:gap-[1vw] items-center">
                                <div className="w-full space-y-2 lg:space-y-[0.5vw]">
                                    {[1, 2, 3].map(i => <div key={i} className="h-4 lg:h-[1.1vw] bg-white/30 rounded animate-pulse w-full" />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[2vw]">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 lg:h-[3vw] bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !menuData) {
        return (
            <div className="flex flex-col gap-6 w-full min-h-screen bg-white items-center justify-center px-4">
                <div className="bg-red-50 p-6 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="satoshiBold text-2xl lg:text-[2.5vw] text-gray-800 text-center">Gagal Memuat Data</h2>
                <p className="satoshiMedium text-base lg:text-[1.3vw] text-gray-600 text-center max-w-md">
                    {error || "Data nutrisi tidak ditemukan."}
                </p>
                <div className="flex gap-4 mt-4">
                    <button onClick={() => window.location.reload()} className="bg-[#E87E2F] text-white rounded-full px-8 py-3 satoshiBold text-base hover:bg-[#d06b1f] shadow-md transition-transform active:scale-95">Muat Ulang</button>
                    <button onClick={() => router.back()} className="bg-gray-100 text-gray-700 rounded-full px-8 py-3 satoshiBold text-base hover:bg-gray-200 shadow-md transition-transform active:scale-95">Kembali</button>
                </div>
            </div>
        );
    }

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
    ].filter(item => item.label);

    const komponenDetail = menuData?.komponen_detail || [];

    return (
        <div className="flex flex-col gap-8 lg:gap-[5vw] w-full min-h-screen bg-white pb-8 lg:pb-[1vw] font-sans relative overflow-x-hidden">

            {isPopupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-[3vw]">
                    <div className="bg-white w-full max-w-lg lg:w-[50vw] rounded-3xl lg:rounded-[2vw] p-6 lg:p-[3vw] shadow-2xl relative flex flex-col gap-4 lg:gap-[1.5vw] animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[1.5vw] text-gray-400 hover:text-gray-600 transition-colors p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 lg:w-[2vw] lg:h-[2vw]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div>
                            <h3 className="satoshiBold text-lg lg:text-[1.5vw] text-black mb-2 lg:mb-[0.5vw]">Pengertian</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.1vw] text-gray-700 text-justify leading-relaxed">
                                {infoAkg.pengertian || "Tidak ada data."}
                            </p>
                        </div>

                        <div>
                            <h3 className="satoshiBold text-lg lg:text-[1.5vw] text-black mb-2 lg:mb-[0.5vw]">Fungsi</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.1vw] text-gray-700 text-justify leading-relaxed">
                                {infoAkg.fungsi || "Tidak ada data."}
                            </p>
                        </div>

                        <div>
                            <h3 className="satoshiBold text-lg lg:text-[1.5vw] text-black mb-2 lg:mb-[0.5vw]">Tetapan AKG</h3>
                            <ul className="grid grid-cols-2 gap-x-4 lg:gap-x-[2vw] gap-y-2 lg:gap-y-[0.5vw] list-disc list-inside satoshiMedium text-sm lg:text-[1.1vw] text-gray-700">
                                {tetapanAkgList.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full relative">
                <h1 className="satoshiBold text-2xl lg:text-[3vw] text-white w-full p-6 lg:p-[2vw] px-4 lg:px-[3vw] bg-[#E87E2F] rounded-b-3xl lg:rounded-b-[2vw] shadow-md text-center lg:text-left">
                    Informasi Nutrisi
                </h1>
            </div>

            <div className="px-4 lg:px-[3vw] flex flex-col gap-8 lg:gap-[3vw]">

                <div className="flex flex-col lg:flex-row gap-8  lg:gap-[2vw] items-center">

                    <div className="w-full lg:w-1/2 lg:mb-0  flex items-center justify-center relative my-8 lg:my-0">
                        <div className="w-64 h-64 lg:w-[25vw] lg:h-[25vw] rounded-full relative shadow-md shrink-0"
                            style={{ background: chartGradient }}
                        >
                            <div className="absolute inset-12 lg:inset-[5vw] bg-white rounded-full flex flex-col items-center justify-center shadow-inner z-20">
                                <span className="satoshiBold text-4xl lg:text-[3.5vw] text-black leading-none tracking-tight">
                                    {menuData?.info_nutrisi?.total_kalori || 0}
                                </span>
                                <span className="satoshiMedium text-base lg:text-[1.2vw] text-gray-500 mt-1">kalori</span>
                            </div>

                            {karbo > 0 && <LabelChart x={posKarbo.x} y={posKarbo.y} label="Karbohidrat" value={karbo} color={colors[0]} />}
                            {protein > 0 && <LabelChart x={posProtein.x} y={posProtein.y} label="Protein" value={protein} color={colors[1]} />}
                            {lemak > 0 && <LabelChart x={posLemak.x} y={posLemak.y} label="Lemak" value={lemak} color={colors[2]} />}
                            {lainnya > 0 && <LabelChart x={posLainnya.x} y={posLainnya.y} label="Lainnya" value={lainnya} color={colors[3]} />}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 bg-[#E87E2F] rounded-3xl lg:rounded-[2vw] gap-6 lg:gap-[1vw] p-6 lg:p-[2vw] text-white flex flex-col shadow-lg h-fit">
                        <div>
                            <h2 className="satoshiBold text-2xl lg:text-[3vw] text-center lg:text-left leading-tight">
                                {menuData?.nama_menu || "Nama Menu"}
                            </h2>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[1vw] items-stretch lg:items-center">
                            <p className="satoshiMedium text-sm lg:text-[1.1vw] w-full text-justify leading-relaxed opacity-90">
                                {menuData?.deskripsi || "Deskripsi menu tidak tersedia."}
                            </p>

                            <div className='w-full lg:w-[40%] flex flex-col p-4 lg:p-[1vw] rounded-2xl lg:rounded-[1vw] gap-1 lg:gap-[0.5vw] items-center justify-center bg-[#FFF3EB] text-[#D7762E] shrink-0 shadow-sm'>
                                <p className="satoshiMedium text-sm lg:text-[1.2vw]">Total Porsi</p>
                                <p className="satoshiBold text-xl lg:text-[2.2vw] leading-tight text-center break-words w-full">
                                    {menuData?.info_nutrisi?.total_porsi || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4 lg:gap-[1vw]">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                        <div className='flex flex-row items-center gap-2 lg:gap-[1vw]'>
                            <h3 className="satoshiBold text-xl lg:text-[2vw] text-black">Persentase AKG</h3>
                            <button onClick={() => setIsPopupOpen(true)} className="hover:opacity-70 transition-opacity focus:outline-none" aria-label="Detail AKG">
                                <Image src={detailCircle} alt="info" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw] cursor-pointer" />
                            </button>
                        </div>
                        <span className="text-[#D98848] satoshiMedium text-sm lg:text-[1.2vw]">
                            {persentase.kalori?.label || "Kalori"} {persentase.kalori?.nilai || "-"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-x-[3vw] lg:gap-y-[1.5vw]">
                        {persentaseAkgList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border lg:border-[0.2vw] border-[#E87E2F] bg-[#FFF3EB] rounded-xl lg:rounded-[1vw] px-4 lg:px-[1.5vw] py-3 lg:py-[0.8vw] shadow-sm">
                                <span className="text-[#D7762E] satoshiBold text-base lg:text-[1.3vw]">{item?.label}</span>
                                <span className="text-[#D7762E] satoshiMedium text-base lg:text-[1.3vw]">{item?.nilai}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] lg:w-[0.2vw] bg-[#E87E2F]/20 -translate-x-1/2 hidden lg:block"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-[5vw] lg:gap-y-[2vw]">
                        {komponenDetail.map((comp, idx) => (
                            <div key={idx} className="bg-[#E87E2F] rounded-3xl lg:rounded-[1.5vw] p-5 lg:p-[1.5vw] text-white shadow-md flex flex-col gap-4 lg:gap-[1vw]">
                                <div className="flex justify-between items-start border-b border-white/20 pb-3 lg:pb-[0.8vw]">
                                    <div>
                                        <h4 className="satoshiBold text-lg lg:text-[1.5vw]">{comp.nama}</h4>
                                        <span className="text-sm lg:text-[1.2vw] opacity-90 block mt-1">{comp.berat}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block satoshiBold text-xl lg:text-[1.8vw]">{comp.kalori}</span>
                                        <span className="text-sm lg:text-[1.2vw] opacity-90">{comp.satuan_kalori}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 lg:gap-[1vw]">
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

                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => router.back()}
                        className="bg-[#D7762E] text-white rounded-full lg:rounded-[2vw] w-full lg:w-auto px-8 lg:px-[4vw] py-3 lg:py-[0.8vw] satoshiBold text-lg lg:text-[1.5vw] shadow-lg hover:bg-[#b56225] transition-all cursor-pointer active:scale-95 text-center"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        </div>
    );
}

const LabelChart = ({ x, y, label, value, color }: { x: string, y: string, label: string, value: number, color: string }) => (
    <div
        className="absolute z-10 flex flex-col items-center text-center w-24 lg:w-auto transition-all duration-300 ease-out"
        style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
        <p className="text-[10px] lg:text-[1vw] text-gray-600 mb-0 lg:mb-[-0.2vw] leading-none font-medium whitespace-nowrap">{label}</p>
        <p className="text-sm lg:text-[1.3vw] satoshiBold leading-tight" style={{ color }}>{value}%</p>
    </div>
);

const NutrientBox = ({ label, value }: { label?: string, value?: string }) => (
    <div className="bg-[#FFF3E0] rounded-xl lg:rounded-[1vw] py-2 lg:py-[0.5vw] px-1 flex flex-col items-center justify-center text-center h-full min-h-[60px] lg:min-h-0 shadow-sm">
        <span className="satoshiBold text-[#8C4C1D] text-sm lg:text-[1.2vw] leading-tight break-all">{value || "-"}</span>
        <span className="text-[#8C4C1D] opacity-80 satoshiMedium text-[10px] lg:text-[1vw] mt-1 lg:mt-[0.2vw] truncate w-full px-1">{label || ""}</span>
    </div>
);

export default AkgMenu;