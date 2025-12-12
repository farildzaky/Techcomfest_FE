'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuth } from '@/src/lib/api';

// Komponen CardMenu yang sama dengan Sekolah
import CardMenu from "../sekolah/CardMenu";
// Komponen CardPelaporan (Khusus SPPG, tapi kita styling agar senada)
import CardPelaporan from "./CardPelaporan";

import information from "../../../assets/dashboard/sekolah/information.png";
import menuImg from "../../../assets/dashboard/sekolah/menu.webp";
import logoOrange from "../../../assets/logo-orange.png";

// --- Interfaces ---
interface MenuItem {
    id: string;
    day: string;
    date: string;
    menu: string;
}

interface ReportItem {
    id: string;
    schoolId: string;
    sekolah: string;
    pelaporan: string;
}

interface SchoolItem {
    id: string;
    nama_sekolah: string;
}

// --- Skeleton Loading (Persis Sekolah) ---
const DashboardSkeleton = () => {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 pb-8 lg:pb-[1vw] animate-pulse gap-6 lg:gap-0">
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-6 lg:gap-[2vw] flex flex-col">
                <div className="w-full h-10 lg:h-[3vw] bg-gray-300 rounded-full" />
                <div className="w-full h-48 lg:h-[15vw] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
                <div className="w-48 lg:w-[15vw] h-8 lg:h-[3vw] bg-gray-300 rounded-md" />
                <div className="flex flex-row overflow-hidden gap-4 lg:gap-[1vw]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[30%] lg:flex-1 h-32 lg:h-[11vw] bg-gray-300 rounded-xl lg:rounded-[1vw]" />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">
                <div className="w-full h-12 lg:h-[4vw] bg-gray-300 rounded-md" />
                <div className="bg-gray-300 rounded-2xl lg:rounded-[2vw] p-4 h-96 lg:h-[30vw]" />
            </div>
        </div>
    );
};

const MainDashboardSppg = () => {
    // --- STATE ---
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [schools, setSchools] = useState<SchoolItem[]>([]);
    const [alertMsg, setAlertMsg] = useState("Memuat informasi...");
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Fetch data parallel
                const [menuRes, reportRes, schoolRes] = await Promise.all([
                    fetchWithAuth('/sppg/menus', { method: 'GET' }),
                    fetchWithAuth('/sppg/reports', { method: 'GET' }),
                    fetchWithAuth('/sppg/schools', { method: 'GET' })
                ]);

                const menuResult = await menuRes.json();
                const reportResult = await reportRes.json();
                const schoolResult = await schoolRes.json();

                // 1. DATA MENU
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

                    // Sorting Hari (Senin - Minggu)
                    const dayOrder: { [key: string]: number } = {
                        "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6, "minggu": 7
                    };
                    formattedMenus.sort((a: MenuItem, b: MenuItem) => (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8));

                    const targetMenus = formattedMenus.slice(0, 5);
                    setMenus(targetMenus);

                    if (targetMenus.length > 0) {
                        setAlertMsg("Menu minggu ini telah divalidasi dan siap didistribusikan.");
                    } else {
                        setAlertMsg("Belum ada jadwal menu yang dibuat.");
                    }
                } else {
                    setMenus([]);
                    setAlertMsg("Belum ada data menu.");
                }

                // 2. DATA SEKOLAH (Untuk List Kanan)
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

                // 3. DATA LAPORAN (Untuk Bagian Bawah)
                if (reportResult.success) {
                    const rawData = reportResult.data;
                    const reportsArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                    const validReports = reportsArray.filter((item: any) => item.id);

                    const formattedReports = validReports.slice(0, 3).map((item: any) => {
                        // Cari ID sekolah agar linknya valid
                        const matchedSchool = rawSchools.find((s: any) =>
                            s.nama_sekolah === item.school_name || s.school_name === item.school_name
                        );

                        return {
                            id: item.id,
                            schoolId: matchedSchool ? matchedSchool.id : null,
                            sekolah: item.school_name || "Sekolah Tidak Diketahui",
                            pelaporan: `${item.menu_name} - ${item.status || "Pending"}`
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

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 pb-4 lg:pb-[1vw] overflow-hidden font-sans">

            {/* --- KOLOM KIRI (UTAMA) --- */}
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">

                {/* 1. Alert Bar (Sama Persis Sekolah) */}
                <div className="bg-[#D7762E] w-full rounded-full px-4 lg:px-[1vw] py-2 lg:py-[0.5vw] satoshiMedium text-white text-sm lg:text-[1vw] items-center flex flex-row shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <Image src={information} alt="information" className="mr-2 lg:mr-[0.5vw] w-5 lg:w-[1.5vw] h-5 lg:h-[1.5vw]" />
                    <span className="truncate">{alertMsg}</span>
                </div>

                {/* 2. Hero Section (Sama Persis Sekolah) */}
                <div className="bg-[#E87E2F] w-full rounded-2xl lg:rounded-[2vw] pl-4 lg:pl-[2vw] flex flex-row items-center shadow-md lg:shadow-none"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <div className="flex flex-col w-[55%] py-4 lg:py-0">
                        <h1 className="satoshiBold text-[4.5vw] lg:text-[2.5vw] text-white leading-tight mb-2 lg:mb-0">
                            Validasi Gizi Cerdas untuk Siswa Sekolah Inklusif
                        </h1>
                        <p className="satoshiMedium text-[3vw] lg:text-[1.3vw] text-white">
                            Memastikan setiap menu MBG aman, sesuai, dan ramah untuk anak disabilitas.
                        </p>
                    </div>
                    <div className="w-[45%] relative h-auto">
                        <Image src={menuImg} alt="menu image" className="object-contain w-full h-full" />
                    </div>
                </div>

                {/* 3. Menu Minggu Depan (LAYOUT SAMA PERSIS SEKOLAH) */}
                <h2 className="satoshiBold text-[4.5vw] md:text-[3vw] lg:text-[2vw] mt-2 lg:mt-0">
                    Menu Minggu Depan
                </h2>

                {/* Container Beige dengan CardMenu di dalamnya (Bukan Card Putih terpisah) */}
                <div className="bg-[#F5DDCA] p-4 lg:p-[2vw] rounded-2xl lg:rounded-[2vw] flex flex-row gap-4 lg:gap-[1vw] items-start pt-8 lg:pt-[4vw] min-h-[15vw] w-full shadow-md lg:shadow-none overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    {menus.length > 0 ? (
                        menus.map((item) => (
                            <Link
                                key={item.id}
                                href={`/sppg/menu-mbg/weekly-menu/${item.id}`} // Link ke detail menu SPPG
                                className="w-[30%] md:w-[22%] flex-shrink-0 lg:w-auto lg:flex-1 min-w-0 hover:scale-105 transition-transform duration-200"
                            >
                                <CardMenu
                                    day={item.day}
                                    menu={item.menu}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 satoshiBold text-[#E87E2F] text-lg lg:text-[1.5vw]">
                            Belum ada jadwal menu.
                        </div>
                    )}
                </div>

                {/* 4. Pelaporan Terbaru (Tambahan di Bawah Menu) */}
                <h2 className="satoshiBold text-[4.5vw] md:text-[3vw] lg:text-[2vw] mt-4 lg:mt-[1vw]">
                    Pelaporan Terbaru
                </h2>
                <div className="
                    bg-[#F5DDCA] p-4 lg:p-[1.5vw] rounded-2xl lg:rounded-[2vw] 
                    shadow-md lg:shadow-none 
                    
                    grid grid-cols-3 gap-4 lg:gap-[1.5vw]
                ">
                    {reports.length > 0 ? (
                        reports.map((item) => (
                            <Link
                                key={item.id}
                                href={item.schoolId ? `/sppg/pelaporan/${item.schoolId}` : '#'}
                                className="
                                    /* Hapus min-w, biarkan grid mengatur lebar */
                                    hover:scale-[1.02] transition-transform duration-200 
                                    
                                    /* KUNCI: h-full agar Link mengisi tinggi sel grid */
                                    h-full block 
                                "
                            >
                                <CardPelaporan
                                    sekolah={item.sekolah}
                                    pelaporan={item.pelaporan}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full w-full text-center py-6 text-[#E87E2F] satoshiMedium lg:text-[1.2vw]">
                            Belum ada laporan masuk.
                        </div>
                    )}
                </div>
            </div>

            {/* --- KOLOM KANAN (SIDEBAR) --- */}
            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col mb-8 lg:mb-0">
                {/* Logo */}
                <div className="w-full text-2xl lg:text-[4vw] satoshiBold lg:flex lg:flex-row hidden items-center justify-center lg:justify-start ">
                    <Image src={logoOrange} alt="logo" className="w-12 lg:w-[5vw] mr-2 lg:mr-[0.5vw]" />
                    <h1 className="text-[#E87E2F] satoshiBold tracking-wider">INKLUZI</h1>
                </div>

                {/* DAFTAR SEKOLAH (Layout mirip "Risiko Menu" di Sekolah) */}
                <div className="bg-[#F5DDCA] rounded-2xl lg:rounded-[2vw] relative flex flex-col items-center max-h-[40vw] lg:pb-[1vw] shadow-md lg:shadow-none h-full  overflow-hidden border border-[#F5DDCA]"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    {/* Header Box (Orange) */}
                    <h1 className="bg-[#E87E2F] w-full z-20 text-center flex relative items-center justify-center text-white rounded-xl lg:rounded-[1.5vw] py-2 lg:py-[0.8vw] text-lg lg:text-[1.8vw] satoshiBold shrink-0 z-10">
                        Daftar Sekolah
                    </h1>

                    {/* List Sekolah (Scrollable) */}
                    <div className="w-full flex-1 relative overflow-y-auto lg:p-[0vw] flex flex-col gap-3 lg:gap-[0.5vw] custom-scrollbar">
                        {schools.length > 0 ? (
                            schools.map((school, index) => (
                                <div key={school.id} className="w-full p-2 lg:p-[0.8vw] rounded-xl lg:rounded-[1vw]  flex items-center gap-3 lg:gap-[0.8vw]">
                                    {/* Nomor Urut */}
                                    <div className="w-16 h-16 lg:w-[4vw] lg:h-[4vw] bg-[#E87E2F] rounded-full flex items-center justify-center text-white satoshiBold text-[5vw] lg:text-[2.5vw] shrink-0">
                                        {index + 1}
                                    </div>
                                    {/* Nama Sekolah */}
                                    <h2 className="satoshiBold text-[3vw] lg:text-[1.3vw] text-[#5A3E2B] line-clamp-2 leading-tight">
                                        {school.nama_sekolah}
                                    </h2>
                                </div>
                            ))
                        ) : (
                            <div className="text-center satoshiMedium text-gray-500 mt-4 lg:mt-[2vw]">
                                Tidak ada sekolah terdaftar.
                            </div>
                        )}
                    </div>
                </div>

                
            </div>
        </div>
    );
}
export default MainDashboardSppg;