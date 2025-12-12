'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';
import information from "../../../assets/dashboard/sekolah/information.png";
import menuImg from "../../../assets/dashboard/sekolah/menu.webp";
import CardMenu from "./CardMenu";
import report from "../../../assets/dashboard/sekolah/report.png";
import scan from "../../../assets/dashboard/sekolah/scan.png";
import logoOrange from "../../../assets/logo-orange.png";

interface MenuItem {
    id: number | string;
    day: string;
    date: string;
    menu: string;
}

interface RiskCategory {
    category: string;
    items: string[];
}

const DashboardSkeleton = () => {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 pb-8 lg:pb-[1vw] animate-pulse gap-6 lg:gap-0">
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-6 lg:gap-[2vw] flex flex-col">
                <div className="w-full h-10 lg:h-[3vw] bg-gray-300 rounded-full" />
                <div className="w-full h-48 lg:h-[15vw] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
                <div className="w-48 lg:w-[15vw] h-8 lg:h-[3vw] bg-gray-300 rounded-md" />

                <div className="flex flex-row overflow-hidden gap-4 lg:gap-[1vw]">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[30%] lg:flex-1 h-32 lg:h-[11vw] bg-gray-300 rounded-xl lg:rounded-[1vw]" />
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-[1vw]">
                    <div className="w-full lg:w-[80%] h-24 lg:h-[10vw] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
                    <div className="w-full lg:w-[80%] h-24 lg:h-[10vw] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
                </div>
            </div>

            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">
                <div className="w-full h-12 lg:h-[4vw] bg-gray-300 rounded-md" />
                <div className="bg-[#F5DDCA]/50 rounded-2xl lg:rounded-[2vw] p-4 h-48 lg:h-[15vw]" />
                <div className="bg-[#E87E2F]/50 rounded-2xl lg:rounded-[2vw] p-4 h-24 lg:h-[8vw]" />
                <div className="bg-[#F5DDCA]/50 rounded-2xl lg:rounded-[2vw] p-4 h-64 lg:h-[20vw]" />
            </div>
        </div>
    );
};

const MainDashboardSekolah = () => {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [previousMenus, setPreviousMenus] = useState<MenuItem[]>([]);
    const [riskyMenus, setRiskyMenus] = useState<RiskCategory[]>([
        { category: "Alergen Tinggi", items: [] },
        { category: "Tekstur Tidak Sesuai", items: [] },
        { category: "Gizi Kurang", items: [] },
    ]);
    const [loading, setLoading] = useState(true);
    const [riskPercentage, setRiskPercentage] = useState(0);
    const [alertMsg, setAlertMsg] = useState("Memuat informasi peringatan...");

    const parseDate = (dateStr: string) => {
        const monthMap: { [key: string]: number } = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };
        try {
            const parts = dateStr.replace(',', '').split(' ');
            if (parts.length < 4) return new Date();

            const day = parseInt(parts[1], 10);
            const month = monthMap[parts[2]];
            const year = parseInt(parts[3], 10);

            return new Date(year, month, day);
        } catch (e) {
            return new Date();
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const listResponse = await fetchWithAuth("/school/menus", { method: "GET" });
                const listResult = await listResponse.json();

                if (listResult.status === "success" && Array.isArray(listResult.data)) {

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const allMenus = listResult.data.map((item: any) => ({
                        id: item.id,
                        day: item.tanggal.split(',')[0].trim().toLowerCase(),
                        date: item.tanggal,
                        menu: item.nama_menu,
                        dateObj: parseDate(item.tanggal)
                    }));

                    const upcoming = allMenus.filter((m: any) => m.dateObj >= today);
                    const past = allMenus.filter((m: any) => m.dateObj < today);

                    upcoming.sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
                    past.sort((a: any, b: any) => b.dateObj.getTime() - a.dateObj.getTime());

                    const targetMenus = upcoming.slice(0, 5);
                    const previousMenusData = past.slice(0, 3);

                    setMenus(targetMenus);
                    setPreviousMenus(previousMenusData);

                    if (targetMenus.length > 0) {
                        const detailPromises = targetMenus.map((menu: any) =>
                            fetchWithAuth(`/school/menus/${menu.id}`, { method: "GET" })
                                .then(res => res.json())
                                .catch(() => null)
                        );

                        const detailsResults = await Promise.all(detailPromises);

                        const newRiskyMenus = [
                            { category: "Alergen Tinggi", items: [] as string[] },
                            { category: "Tekstur Tidak Sesuai", items: [] as string[] },
                            { category: "Gizi Kurang", items: [] as string[] },
                        ];

                        let totalSafetyScore = 0;
                        let maxScore = 0;
                        let foundImportantNote: string | null = null;

                        detailsResults.forEach((res: any) => {
                            if (res && res.status === "success" && res.data) {
                                maxScore += 2;
                                const data = res.data;
                                const menuName = data.nama_menu;
                                const risks = data.deteksi_risiko || {};
                                const status = data.status_keamanan;

                                if (!foundImportantNote && data.catatan_tambahan) {
                                    foundImportantNote = `Catatan ${menuName}: ${data.catatan_tambahan}`;
                                }

                                if (status === 'aman') totalSafetyScore += 2;
                                else if (status === 'perlu_perhatian') totalSafetyScore += 1;

                                if (risks.alergi?.some((n: string) => n.toLowerCase().includes("mengandung") || n.toLowerCase().includes("alergi"))) {
                                    newRiskyMenus[0].items.push(menuName);
                                }
                                if (risks.tekstur?.some((n: string) => n.toLowerCase().includes("keras") || n.toLowerCase().includes("sulit"))) {
                                    newRiskyMenus[1].items.push(menuName);
                                }
                                if (risks.porsi_gizi?.some((n: string) => n.toLowerCase().includes("rendah") || n.toLowerCase().includes("kurang"))) {
                                    newRiskyMenus[2].items.push(menuName);
                                }
                            }
                        });

                        const calculatedRisk = maxScore > 0 ? Math.round(((maxScore - totalSafetyScore) / maxScore) * 100) : 0;

                        if (foundImportantNote) setAlertMsg(foundImportantNote);
                        else if (calculatedRisk > 50) setAlertMsg("Peringatan: Banyak menu minggu ini memiliki risiko tinggi.");
                        else setAlertMsg("Menu minggu ini terpantau aman dan sesuai standar gizi.");

                        setRiskyMenus(newRiskyMenus);
                        setRiskPercentage(calculatedRisk);
                    } else {
                        setAlertMsg("Belum ada menu untuk minggu depan.");
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setAlertMsg("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 pb-4 lg:pb-[1vw] overflow-hidden">
            {/* Bagian Kiri (Konten Utama) */}
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">
                {/* Alert Bar */}
                <div className="bg-[#D7762E] w-full rounded-full px-4 lg:px-[1vw] py-2 lg:py-[0.5vw] satoshiMedium text-white text-sm lg:text-[1vw] items-center flex flex-row shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <Image src={information} alt="information" className="mr-2 lg:mr-[0.5vw] w-5 lg:w-[1.5vw] h-5 lg:h-[1.5vw]" />
                    <span className="truncate">{alertMsg}</span>
                </div>

                {/* Hero Section */}
                <div className="bg-[#E87E2F] w-full rounded-2xl lg:rounded-[2vw] pl-4 lg:pl-[2vw] flex flex-row items-center shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <div className="flex flex-col w-[55%] py-4 lg:py-0">
                        <h1 className="satoshiBold text-[4.5vw] lg:text-[2.5vw] text-white leading-tight mb-2 lg:mb-0">Validasi Gizi Cerdas untuk Siswa Sekolah Inklusif</h1>
                        <p className="satoshiMedium text-[3vw] lg:text-[1.3vw] text-white">Memastikan setiap menu MBG aman, sesuai, dan ramah untuk anak disabilitas.</p>
                    </div>
                    <div className="w-[45%] relative h-auto">
                        <Image src={menuImg} alt="menu image" className="object-contain w-full h-full" />
                    </div>
                </div>

                {/* Menu Minggu Depan */}
                <h2 className="satoshiBold text-[4.5vw] md:text-[3vw] lg:text-[2vw] mt-2 lg:mt-0">Menu Minggu Depan</h2>
                <div className="bg-[#F5DDCA] p-4 lg:p-[2vw] rounded-2xl lg:rounded-[2vw]
flex flex-row gap-4 lg:gap-[1vw]
items-start pt-8 lg:pt-[4vw] min-h-[15vw] w-full
shadow-md lg:shadow-none
overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth" // Scroll smooth & hidden scrollbar
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    {menus.length > 0 ? (
                        menus.map((item) => (
                            <Link
                                key={item.id}
                                href={`/sekolah/menu-mbg/${item.id}`}
                                className="w-[30%] md:w-[22%] flex-shrink-0 lg:w-auto lg:flex-1 min-w-0 hover:scale-105 transition-transform duration-200"
                            >
                                <CardMenu
                                    day={item.day}
                                    menu={item.menu}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 satoshiBold text-[#E87E2F] text-lg lg:text-[2vw]">
                            Belum Ada Menu Minggu Depan
                        </div>
                    )}
                </div>

                {/* Tombol Aksi (Scan & Lapor) */}
                <div className="flex flex-col md:flex-row justify-center items-center w-full gap-4 lg:gap-[1vw] mt-2 lg:mt-[1vw]">
                    <Link
                        href="/sekolah/scan-nutrisi"
                        className="bg-[#F5DDCA] relative rounded-2xl lg:rounded-[2vw] flex flex-row items-center w-[90%] md:w-[80%] h-[23vw] md:h-[15vw] lg:h-[10vw] justify-end gap-4 lg:gap-[3vw] ml-[5vw] lg:ml-[4vw] pr-4 lg:pr-[1vw] cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-md lg:shadow-none"
                    >
                        <div className="w-[24vw] h-[24vw]   md:w-[16vw] md:h-[16vw] lg:w-[10vw] lg:h-[10vw] bg-[#E87E2F] rounded-full mr-0 lg:mr-[1vw] absolute left-[-7vw] md:left-[-5vw] lg:left-[-3vw] flex justify-center items-center shadow-md lg:shadow-none top-1/2 -translate-y-1/2 lg:translate-y-0 lg:top-0">
                            <Image src={scan} alt="scan icon" className="w-[10vw] h-[10vw] lg:w-[5vw] lg:h-[5vw]" />
                        </div>
                        <div className="w-[70%] lg:w-[15vw] items-start">
                            <h1 className="satoshiBold text-[4.5vw] md:text-[2.5vw] lg:text-[1.5vw]">Scan Nutrisi</h1>
                            <p className="satoshiMedium text-[3vw] md:text-[1.5vw] lg:text-[1vw] ">Unggah foto menu makanan untuk cek gizi, tekstur, dan potensi alergi secara otomatis.</p>
                        </div>
                    </Link>

                    <Link
                        href="/sekolah/pelaporan"
                        className="bg-[#F5DDCA] relative rounded-2xl lg:rounded-[2vw] flex flex-row items-center w-[90%] md:w-[80%] h-[23vw] md:h-[15vw] lg:h-[10vw] justify-end gap-4 lg:gap-[3vw] ml-[5vw] lg:ml-[4vw] pr-4 lg:pr-[1vw] cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-md lg:shadow-none"
                    >
                        <div className="w-[24vw] h-[24vw] md:w-[16vw] md:h-[16vw] lg:w-[10vw] lg:h-[10vw] bg-[#E87E2F] rounded-full mr-0 lg:mr-[1vw] absolute left-[-7vw] md:left-[-5vw] lg:left-[-3vw] flex justify-center items-center shadow-md lg:shadow-none top-1/2 -translate-y-1/2 lg:translate-y-0 lg:top-0">
                            <Image src={report} alt="report icon" className="w-[10vw] h-[10vw] lg:w-[5vw] lg:h-[5vw]" />
                        </div>
                        <div className="w-[70%] lg:w-[15vw] items-start ">
                            <h1 className="satoshiBold text-[4.5vw] lg:text-[1.5vw] md:text-[2.5vw]">Pelaporan</h1>
                            <p className="satoshiMedium text-[3vw] lg:text-[1vw] md:text-[1.5vw] ">Laporkan menu yang tidak sesuai dengan kebutuhan siswa secara cepat ke pihak SPPG.</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Bagian Kanan (Sidebar Info) */}
            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col mb-8 lg:mb-0">
                <div className="w-full text-2xl lg:text-[4vw] satoshiBold lg:flex lg:flex-row hidden items-center justify-center lg:justify-start ">
                    <Image src={logoOrange} alt="logo" className="w-12 lg:w-[5vw] mr-2 lg:mr-[0.5vw]" />
                    <h1 className="text-[#E87E2F] satoshiBold ">INKLUZI</h1>
                </div>

                <div className="bg-[#F5DDCA] rounded-2xl lg:rounded-[2vw] flex flex-col items-center pb-4 lg:pb-[1vw] shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="bg-[#E87E2F] w-full text-center flex items-center justify-center text-white rounded-xl lg:rounded-[1.5vw] py-2 lg:py-[0.5vw] text-lg lg:text-[1.8vw] satoshiBold">Risiko Menu Minggu Ini</h1>

                    {riskyMenus.map((risk, index) => (
                        <div key={index} className="w-full px-4 lg:px-[1.5vw] py-2 lg:py-[0.5vw]">
                            <h2 className="satoshiBold text-base lg:text-[1.4vw] text-[#D7762E]">
                                {risk.category}
                            </h2>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-black leading-tight">
                                {risk.items.length > 0 ? risk.items.join(", ") : "-"}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-[#E87E2F] rounded-2xl lg:rounded-[2vw] p-4 gap-[0.5vw] lg:p-[1vw] flex flex-col items-center shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="text-white satoshiBold text-3xl lg:text-[3vw]">{riskPercentage}%</h1>
                    <h2 className="text-white satoshiBold text-base lg:text-[1.5vw] text-center">Siswa Memiliki Risiko Menu</h2>
                </div>

                <div className="bg-[#F5DDCA] rounded-2xl lg:rounded-[2vw] flex flex-col items-center shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="bg-[#E87E2F] w-full text-center flex items-center justify-center text-white rounded-xl lg:rounded-[1.5vw] py-2 lg:py-[1vw] text-lg lg:text-[1.8vw] satoshiBold">Menu Sebelumnya</h1>

                    {previousMenus.length > 0 ? (
                        previousMenus.map((item, index) => (
                            <div key={item.id} className="w-full flex items-center gap-4 lg:gap-[1vw] p-4 lg:p-[1vw]">
                                <div className="w-10 h-10 lg:w-[4vw] lg:h-[4vw] rounded-full bg-[#E87E2F] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white satoshiBold text-lg lg:text-[2vw]">{index + 1}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="satoshiBold text-base lg:text-[1.4vw] text-black mb-1 lg:mb-[0.2vw]">
                                        {item.date}
                                    </h2>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-black leading-tight">
                                        {item.menu}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 lg:py-[1vw] satoshiBold text-black/60 text-center text-sm lg:text-lg">
                            Belum ada menu sebelumnya.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default MainDashboardSekolah;