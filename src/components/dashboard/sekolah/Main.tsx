'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';
import information from "../../../assets/dashboard/sekolah/information.png";
import menuImg from "../../../assets/dashboard/sekolah/menu.png";
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
        <div className="grid-cols-7 grid pb-[1vw] animate-pulse">
            <div className="col-span-5 p-[1vw] pt-[1vw] gap-[2vw] flex flex-col">
                <div className="w-full h-[3vw] bg-gray-300 rounded-full" />
                <div className="w-full h-[15vw] bg-gray-300 rounded-[2vw]" />
                <div className="w-[15vw] h-[3vw] bg-gray-300 rounded-md" />
                <div className="bg-[#F5DDCA]/50 p-[2vw] rounded-[2vw] flex flex-row gap-[1vw] pt-[4vw] min-h-[15vw] w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1 h-[11vw] bg-gray-300 rounded-[1vw]" />
                    ))}
                </div>
                <div className="flex flex-row gap-[1vw]">
                    <div className="w-[80%] h-[10vw] bg-gray-300 rounded-[2vw] ml-[4vw]" />
                    <div className="w-[80%] h-[10vw] bg-gray-300 rounded-[2vw] ml-[4vw]" />
                </div>
            </div>
            <div className="col-span-2 pr-[1vw] pt-[1vw] gap-[1vw] flex flex-col">
                <div className="w-full h-[4vw] bg-gray-300 rounded-md" />
                <div className="bg-[#F5DDCA]/50 rounded-[2vw] p-[1vw] h-[15vw] flex flex-col gap-2">
                     <div className="w-full h-[3vw] bg-gray-400 rounded-full mb-2" />
                     <div className="w-full h-[2vw] bg-gray-300 rounded-md" />
                     <div className="w-full h-[2vw] bg-gray-300 rounded-md" />
                </div>
                <div className="bg-[#E87E2F]/50 rounded-[2vw] p-[1.5vw] h-[8vw] flex flex-col items-center justify-center gap-2">
                    <div className="w-[4vw] h-[3vw] bg-white/50 rounded-md" />
                    <div className="w-[10vw] h-[1.5vw] bg-white/50 rounded-md" />
                </div>
                <div className="bg-[#F5DDCA]/50 rounded-[2vw] p-[1vw] h-[20vw] flex flex-col gap-4">
                    <div className="w-full h-[3vw] bg-gray-400 rounded-full" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <div className="w-[4vw] h-[4vw] bg-gray-300 rounded-full shrink-0" />
                            <div className="w-full h-[1.5vw] bg-gray-300 rounded-md" />
                        </div>
                    ))}
                </div>
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

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const listResponse = await fetchWithAuth("/school/menus", { method: "GET" });
                const listResult = await listResponse.json();

                if (listResult.status === "success" && Array.isArray(listResult.data)) {

                    const formattedMenus = listResult.data.map((item: any) => {
                        const dayName = item.tanggal.split(',')[0].trim().toLowerCase();
                        return {
                            id: item.id,
                            day: dayName,
                            date: item.tanggal,
                            menu: item.nama_menu
                        };
                    });

                    const dayOrder: { [key: string]: number } = {
                        "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6, "minggu": 7
                    };
                    formattedMenus.sort((a: MenuItem, b: MenuItem) => (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8));

                    const targetMenus = formattedMenus.slice(0, 5);
                    setMenus(targetMenus);

                    const pastMenus = formattedMenus.slice(5, 8);
                    setPreviousMenus(pastMenus);

                    const detailPromises = targetMenus.map((menu: MenuItem) =>
                        fetchWithAuth(`/school/menus/${menu.id}`, { method: "GET" })
                            .then(res => res.json())
                    );

                    const detailsResults = await Promise.all(detailPromises);

                    const newRiskyMenus = [
                        { category: "Alergen Tinggi", items: [] as string[] },
                        { category: "Tekstur Tidak Sesuai", items: [] as string[] },
                        { category: "Gizi Kurang", items: [] as string[] },
                    ];

                    let totalSafetyScore = 0;
                    let maxScore = detailsResults.length * 2;
                    let foundImportantNote: string | null = null;

                    detailsResults.forEach((res: any) => {
                        if (res.status === "success" && res.data) {
                            const data = res.data;
                            const menuName = data.nama_menu;
                            const risks = data.deteksi_risiko || {};
                            const status = data.status_keamanan;

                            if (!foundImportantNote && data.catatan_tambahan) {
                                foundImportantNote = `Catatan ${menuName}: ${data.catatan_tambahan}`;
                            }

                            if (status === 'aman') {
                                totalSafetyScore += 2;
                            } else if (status === 'perlu_perhatian') {
                                totalSafetyScore += 1;
                            }

                            if (risks.alergi && risks.alergi.length > 0) {
                                const hasAllergyWarning = risks.alergi.some((note: string) =>
                                    note.toLowerCase().includes("mengandung") ||
                                    note.toLowerCase().includes("alergi")
                                );
                                if (hasAllergyWarning) newRiskyMenus[0].items.push(menuName);
                            }

                            if (risks.tekstur && risks.tekstur.length > 0) {
                                const hasTextureWarning = risks.tekstur.some((note: string) =>
                                    note.toLowerCase().includes("keras") ||
                                    note.toLowerCase().includes("sulit") ||
                                    note.toLowerCase().includes("tersedak") ||
                                    note.toLowerCase().includes("tidak sesuai")
                                );
                                if (hasTextureWarning) newRiskyMenus[1].items.push(menuName);
                            }

                            if (risks.porsi_gizi && risks.porsi_gizi.length > 0) {
                                const hasNutritionWarning = risks.porsi_gizi.some((note: string) =>
                                    note.toLowerCase().includes("rendah") ||
                                    note.toLowerCase().includes("kurang") ||
                                    note.toLowerCase().includes("di bawah standar")
                                );
                                if (hasNutritionWarning) newRiskyMenus[2].items.push(menuName);
                            }
                        }
                    });

                    const calculatedRisk = maxScore > 0
                        ? Math.round(((maxScore - totalSafetyScore) / maxScore) * 100)
                        : 0;

                    if (foundImportantNote) {
                        setAlertMsg(foundImportantNote);
                    } else if (calculatedRisk > 50) {
                        setAlertMsg("Peringatan: Banyak menu minggu ini memiliki risiko tinggi. Mohon periksa detail.");
                    } else {
                        setAlertMsg("Menu minggu ini terpantau aman dan sesuai standar gizi.");
                    }

                    setRiskyMenus(newRiskyMenus);
                    setRiskPercentage(calculatedRisk);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setAlertMsg("Gagal memuat data peringatan.");
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
        <div className="grid-cols-7 grid pb-[1vw]">
            <div className="col-span-5 p-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                <div className="bg-[#D7762E] w-full rounded-full px-[1vw] py-[0.5vw] satoshiMedium text-white text-[1vw] items-center flex flex-row "
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <Image src={information} alt="information" className="mr-[0.5vw] w-[1.5vw]" />
                    <span>{alertMsg}</span>
                </div>

                <div className="bg-[#E87E2F] w-full rounded-[2vw] pl-[2vw] flex flex-row items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <div className="flex flex-col w-[55%]">
                        <h1 className="satoshiBold text-[2.5vw] text-white">Validasi Gizi Cerdas untuk Siswa Sekolah Inklusif</h1>
                        <p className="satoshiMedium text-[1.3vw] text-white">Memastikan setiap menu MBG aman, sesuai, dan ramah untuk anak disabilitas.</p>
                    </div>
                    <Image src={menuImg} alt="menu image" className="w-[55%]" />
                </div>

                <h2 className="satoshiBold text-[2vw]">Menu Minggu Depan</h2>
                <div className="bg-[#F5DDCA] p-[2vw] rounded-[2vw] flex flex-row gap-[1vw] items-start pt-[4vw] min-h-[15vw] w-full"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    {menus.length > 0 ? (
                        menus.map((item) => (
                            <Link
                                key={item.id}
                                href={`/sekolah/menu-mbg/${item.id}`}
                                className="flex-1 min-w-0 hover:scale-105 transition-transform duration-200"
                            >
                                <CardMenu
                                    day={item.day}
                                    menu={item.menu}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 satoshiBold text-[#E87E2F] text-[1.5vw]">
                            Tidak Ada Menu Minggu Depan
                        </div>
                    )}
                </div>

                <div className="flex flex-row justfiy-center items-center w-full gap-[1vw]">
                    <Link 
                        href="/sekolah/scan-nutrisi" 
                        className="bg-[#F5DDCA] relative rounded-[2vw] flex flex-row items-center w-[80%] h-[10vw] justify-end gap-[3vw] ml-[4vw] pr-[1vw] cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                    >
                        <div className="w-[10vw] h-[10vw] bg-[#E87E2F] rounded-full mr-[1vw] absolute left-[-3vw] flex justify-center items-center">
                            <Image src={scan} alt="scan icon" className="w-[5vw] h-[5vw]" />
                        </div>
                        <div className="w-[15vw] items-start">
                            <h1 className="satoshiBold text-[1.5vw]">Scan Nutrisi</h1>
                            <p className="satoshiMedium text-[1vw] text-justify">Unggah foto menu makanan untuk cek gizi, tekstur, dan potensi alergi secara otomatis.</p>
                        </div>
                    </Link>

                    <Link 
                        href="/sekolah/pelaporan" 
                        className="bg-[#F5DDCA] relative rounded-[2vw] flex flex-row items-center w-[80%] h-[10vw] justify-end gap-[3vw] ml-[4vw] pr-[1vw] text-justify cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                    >
                        <div className="w-[10vw] h-[10vw] bg-[#E87E2F] rounded-full mr-[1vw] absolute left-[-3vw] flex justify-center items-center">
                            <Image src={report} alt="report icon" className="w-[5vw] h-[5vw]" />
                        </div>
                        <div className="w-[15vw] items-start">
                            <h1 className="satoshiBold text-[1.5vw]">Pelaporan</h1>
                            <p className="satoshiMedium text-[1vw]">Laporkan menu yang tidak sesuai dengan kebutuhan siswa secara cepat ke pihak SPPG.</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="col-span-2 pr-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                <div className="w-full text-[4vw] satoshiBold flex flex-row items-center">
                    <Image src={logoOrange} alt="logo" className="w-[5vw] mr-[1vw]" />
                    <h1 className="text-[#E87E2F] satoshiBold tracking-wider">INKLUZI</h1>
                </div>

                <div className="bg-[#F5DDCA] rounded-[2vw] flex flex-col items-center pb-[1vw]"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="bg-[#E87E2F] w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[0.5vw] text-[1.8vw] satoshiBold">Risiko Menu Minggu Ini</h1>

                    {riskyMenus.map((risk, index) => (
                        <div key={index} className="w-full px-[1.5vw] py-[0.5vw]">
                            <h2 className="satoshiBold text-[1.4vw] text-[#D7762E]">
                                {risk.category}
                            </h2>
                            <p className="satoshiMedium text-[1.2vw] text-black leading-tight">
                                {risk.items.length > 0 ? risk.items.join(", ") : "-"}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-[#E87E2F] rounded-[2vw] p-[1.5vw] flex flex-col items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="text-white satoshiBold text-[2vw]">{riskPercentage}%</h1>
                    <h2 className="text-white satoshiBold text-[1.5vw]">Siswa Memiliki Risiko Menu</h2>
                </div>

                <div className="bg-[#F5DDCA] rounded-[2vw] flex flex-col items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="bg-[#E87E2F] w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[1vw] text-[1.8vw] satoshiBold">Menu Sebelumnya</h1>

                    {previousMenus.length > 0 ? (
                        previousMenus.map((item, index) => (
                            <div key={item.id} className="w-full flex items-center gap-[1vw] p-[1vw]">
                                <div className="w-[4vw] h-[4vw] rounded-full bg-[#E87E2F] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white satoshiBold text-[2vw]">{index + 6}</span>
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="satoshiBold text-[1.4vw] text-black mb-[0.2vw]">
                                        {item.date}
                                    </h2>
                                    <p className="satoshiMedium text-[1.2vw] text-black leading-tight">
                                        {item.menu}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-[1vw] satoshiMedium text-black/60 text-center">
                            Tidak ada data menu sebelumnya.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default MainDashboardSekolah;