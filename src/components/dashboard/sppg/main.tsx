'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuth } from '@/src/lib/api';
import CardMenu from "../sekolah/CardMenu";
import CardPelaporan from "./CardPelaporan";
import information from "../../../assets/dashboard/sekolah/information.png";
import menuImg from "../../../assets/dashboard/sekolah/menu.png";
import logoOrange from "../../../assets/logo-orange.png";

interface MenuItem {
    id: string;
    day: string;
    date: string;
    menu: string;
}

interface ReportItem {
    id: string;       // ID Laporan (untuk Key)
    schoolId: string; // ID Sekolah (Untuk Link URL) -> INI YANG BARU
    sekolah: string;
    pelaporan: string;
}

interface SchoolItem {
    id: string;
    nama_sekolah: string;
}

const MainDashboardSppg = () => {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [schools, setSchools] = useState<SchoolItem[]>([]);
    const [alertMsg, setAlertMsg] = useState("Memuat informasi validasi gizi...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [menuRes, reportRes, schoolRes] = await Promise.all([
                    fetchWithAuth('/sppg/menus', { method: 'GET' }),
                    fetchWithAuth('/sppg/reports', { method: 'GET' }), 
                    fetchWithAuth('/sppg/schools', { method: 'GET' })  
                ]);

                const menuResult = await menuRes.json();
                const reportResult = await reportRes.json();
                const schoolResult = await schoolRes.json();

                // --- 1. PROSES MENU ---
                if (menuResult.status === 'success' && Array.isArray(menuResult.data)) {
                    const validMenus = menuResult.data.filter((item: any) => item.menu_id);
                    
                    const formattedMenus = validMenus.map((item: any) => {
                        const dayName = item.tanggal ? item.tanggal.split(',')[0].trim().toLowerCase() : 'senin';
                        return {
                            id: item.menu_id,
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

                    // Fetch detail menu untuk alert gizi
                    if (targetMenus.length > 0) {
                        const detailPromises = targetMenus.map((menu: MenuItem) => {
                            if (!menu.id) return Promise.resolve(null);
                            return fetchWithAuth(`/sppg/menus/${menu.id}`, { method: 'GET' })
                                .then(res => res.json())
                                .catch(() => null);
                        });

                        const detailsResults = await Promise.all(detailPromises);
                        let foundImportantNote: string | null = null;
                        let totalSafetyScore = 0;
                        let maxScore = 0;

                        detailsResults.forEach((res: any) => {
                            if (res && res.status === 'success' && res.data) {
                                maxScore += 2;
                                const data = res.data;
                                if (!foundImportantNote && data.catatan_tambahan) {
                                    foundImportantNote = `Catatan ${data.nama_menu}: ${data.catatan_tambahan}`;
                                }
                                if (data.status_keamanan === 'aman') totalSafetyScore += 2;
                                else if (data.status_keamanan === 'perlu_perhatian') totalSafetyScore += 1;
                            }
                        });

                        if (foundImportantNote) {
                            setAlertMsg(foundImportantNote);
                        } else if (maxScore > 0) {
                            const riskPercentage = Math.round(((maxScore - totalSafetyScore) / maxScore) * 100);
                            if (riskPercentage > 50) {
                                setAlertMsg("Peringatan: Beberapa menu minggu ini memerlukan perhatian gizi.");
                            } else {
                                setAlertMsg("Menu minggu ini terpantau aman dan sesuai standar.");
                            }
                        } else {
                             setAlertMsg("Data detail menu belum tersedia.");
                        }
                    } else {
                        setAlertMsg("Belum ada data menu untuk divalidasi.");
                    }
                } else {
                    setMenus([]);
                    setAlertMsg("Belum ada data menu.");
                }

                // --- 2. PROSES DATA SEKOLAH (Disimpan dulu untuk lookup) ---
                let rawSchools: any[] = [];
                if (schoolResult.success && Array.isArray(schoolResult.data)) {
                    rawSchools = schoolResult.data;
                    const validSchools = rawSchools.filter((item: any) => item.id);
                    const formattedSchools = validSchools.map((item: any) => ({
                        id: item.id,
                        nama_sekolah: item.nama_sekolah || "Nama Sekolah Tidak Tersedia"
                    }));
                    setSchools(formattedSchools);
                }

                // --- 3. PROSES DATA PELAPORAN (MATCHING SCHOOL ID) ---
                if (reportResult.success) { 
                    const rawData = reportResult.data;
                    const reportsArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                    const validReports = reportsArray.filter((item: any) => item.id);

                    const formattedReports = validReports.slice(0, 3).map((item: any) => {
                        // LOGIC PENTING: Cari ID Sekolah berdasarkan nama sekolah di laporan
                        // Ini diperlukan karena endpoint laporan tidak return school_id, cuma school_name
                        const matchedSchool = rawSchools.find((s: any) => 
                            s.nama_sekolah === item.school_name || s.school_name === item.school_name
                        );

                        return {
                            id: item.id,
                            // Gunakan ID dari sekolah yang cocok, jika tidak ada fallback ke null
                            schoolId: matchedSchool ? matchedSchool.id : null, 
                            sekolah: item.school_name || item.sekolah?.nama_sekolah || "Sekolah Tidak Diketahui",
                            pelaporan: `${item.menu_name || item.menu?.nama_menu || "Menu"} - Status: ${item.status || "Pending"}`
                        };
                    });
                    setReports(formattedReports);
                }

            } catch (error) {
                console.error("Error loading dashboard data:", error);
                setAlertMsg("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className="pb-[1vw] flex flex-col">
            <div className="grid-cols-7 grid ">
                <div className="col-span-5 p-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                    
                    <div className="bg-[#D7762E] w-full rounded-full px-[1vw] py-[0.5vw] satoshiMedium text-white text-[1vw] items-center flex flex-row "
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <Image src={information} alt="information" className="mr-[0.5vw] w-[1.5vw] " />
                        <span className="truncate w-full">
                            {loading ? (
                                <div className="h-[1.2vw] bg-white/30 rounded w-1/2 animate-pulse"></div>
                            ) : (
                                alertMsg
                            )}
                        </span>
                    </div>

                    <div className="bg-[#E87E2F] w-full rounded-[2vw] pl-[2vw]  flex flex-row  items-center "
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <div className="flex flex-col w-[55%]">
                            <h1 className="satoshiBold text-[2.5vw] text-white">Validasi Gizi Cerdas untuk Siswa Sekolah Inklusif</h1>
                            <p className="satoshiMedium text-[1.3vw] text-white">Memastikan setiap menu MBG aman, sesuai, dan ramah untuk anak disabilitas.</p>
                        </div>
                        <Image src={menuImg} alt="menu image" className="w-[55%] " />
                    </div>

                    <h2 className="satoshiBold text-[2vw]">Menu Minggu Depan</h2>
                    <div className="bg-[#F5DDCA] p-[2vw] rounded-[2vw] flex flex-row gap-[1vw] items-start pt-[4vw] min-h-[15vw]"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="flex-1 bg-white rounded-[1vw] h-[10vw] animate-pulse flex flex-col p-[1vw] gap-[0.5vw] opacity-70">
                                    <div className="h-[1.5vw] w-[60%] bg-gray-200 rounded"></div>
                                    <div className="h-[3vw] w-full bg-gray-200 rounded mt-auto"></div>
                                </div>
                            ))
                        ) : menus.length > 0 ? (
                            menus.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/sppg/menu-mbg/weekly-menu/${item.id}`} 
                                    className="flex-1 min-w-0 hover:scale-105 transition-transform duration-200"
                                >
                                    <CardMenu
                                        day={item.day}
                                        menu={item.menu}
                                    />
                                </Link>
                            ))
                        ) : (
                            <div className="w-full text-center py-[2vw] satoshiBold text-[#E87E2F] text-[1.5vw]">Belum ada jadwal menu.</div>
                        )}
                    </div>
                </div>

                <div className="col-span-2 pr-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                    <div className="w-full text-[4vw] satoshiBold flex flex-row items-center">
                        <Image src={logoOrange} alt="logo" className="w-[5vw] mr-[1vw] " />
                        <h1 className="text-[#E87E2F] satoshiBold tracking-wider">INKLUZI</h1>
                    </div>                    
                    
                    <div className="bg-[#F5DDCA] rounded-[2vw] flex flex-col items-center h-[38.7vw] overflow-hidden"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <h1 className="bg-[#E87E2F] w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[0.5vw] text-[1.8vw] satoshiBold shrink-0 z-10">Daftar Sekolah</h1>
                        
                        <div className="w-full overflow-y-auto p-[1vw] flex flex-col gap-[1vw]">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full bg-white p-[0.8vw] rounded-[0.8vw] shadow-sm flex items-center animate-pulse opacity-80">
                                        <div className="w-[2vw] h-[2vw] bg-gray-200 rounded-full mr-[0.8vw]"></div>
                                        <div className="h-[1vw] w-[60%] bg-gray-200 rounded"></div>
                                    </div>
                                ))
                            ) : schools.length > 0 ? (
                                schools.map((school, i) => (
                                    <div key={school.id} className="w-full  flex items-center">
                                        <div className=" bg-[#E87E2F] rounded-full mr-[0.8vw] w-[5vw] h-[5vw] flex flex-col justify-center items-center text-white text-[3.5vw] satoshiMedium">{i + 1}</div>
                                        <h2 className="satoshiBold text-[1.5vw] text-[#8C4C1D]  text-black">{school.nama_sekolah}</h2>
                                        
                                    </div>
                                ))
                            ) : (
                                <div className="text-center satoshiMedium text-gray-500 mt-[2vw]">Tidak ada sekolah terdaftar.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-col flex gap-[1vw] mt-[1vw]">
                <h2 className="satoshiBold text-[2vw] mx-[1vw] leadding-none">Pelaporan Terbaru</h2>

                <div className="bg-[#F5DDCA] p-[1vw] rounded-[1vw] flex flex-row gap-[1vw] items-start mx-[1vw] min-h-[8vw]"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                             <div key={i} className="flex-1 bg-white rounded-[1vw] h-[6vw] animate-pulse flex flex-col justify-center px-[1.5vw] gap-[0.5vw] opacity-70">
                                <div className="h-[1.2vw] w-[40%] bg-gray-200 rounded"></div>
                                <div className="h-[1vw] w-[70%] bg-gray-200 rounded"></div>
                            </div>
                        ))
                    ) : reports.length > 0 ? (
                        reports.map((item) => (
                            <Link 
                                key={item.id}
                                // PERBAIKAN: Menggunakan item.schoolId, BUKAN item.id
                                // Jika schoolId tidak ketemu, fallback ke '#' atau halaman 404
                                href={item.schoolId ? `/sppg/pelaporan/${item.schoolId}` : '#'} 
                                className="flex-1 min-w-0 hover:scale-105 transition-transform duration-200"
                            >
                                <CardPelaporan
                                    sekolah={item.sekolah}
                                    pelaporan={item.pelaporan}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="w-full text-center py-[1vw] satoshiBold text-[#E87E2F]">Belum ada pelaporan baru.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default MainDashboardSppg;