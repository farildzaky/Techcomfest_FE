'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuth } from '@/src/lib/api';

// Komponen CardMenu yang sama dengan Sekolah
import CardMenu from "../sekolah/CardMenu";
// Komponen CardPelaporan
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
    user_id: string; // [FIX] Tambahkan user_id
    nama_sekolah: string;
    photo_url?: string;
}

// Detail Sekolah sesuai API
interface DisabilityType {
    jenis_disabilitas: string;
    jumlah_siswa: number;
}

interface SchoolDetail {
    id: string;
    email: string;
    status: string;
    nama_sekolah: string;
    npsn: string;
    jenis_sekolah: string;
    alamat: string;
    total_siswa: number;
    penanggung_jawab: string;
    nomor_kontak: string;
    photo_url: string;
    disability_types: DisabilityType[];
    created_at: string;
}

// --- Skeleton Loading ---
const DashboardSkeleton = () => {
    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 pb-8 lg:pb-[1vw] animate-pulse gap-6 lg:gap-0 min-h-screen">
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-6 lg:gap-[2vw] flex flex-col">
                <div className="w-full h-10 lg:h-[2.5vw] bg-gray-300 rounded-full" />
                <div className="w-full aspect-[2.5/1] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
                <div className="w-48 lg:w-[15vw] h-8 lg:h-[2.5vw] bg-gray-300 rounded-md" />
                <div className="w-full aspect-[3.5/1] bg-gray-300 rounded-2xl lg:rounded-[2vw]" />
            </div>
            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">
                <div className="w-full h-12 lg:h-[4vw] bg-gray-300 rounded-md" />
                <div className="bg-gray-300 rounded-2xl lg:rounded-[2vw] p-4 aspect-[1/1.2] lg:h-[30vw]" />
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<SchoolDetail | null>(null);
    const [detailError, setDetailError] = useState("");

    // --- FETCH DATA ---
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

                // 1. DATA MENU
                if (menuResult.status === 'success' && Array.isArray(menuResult.data)) {
                    const validMenus = menuResult.data.filter((item: any) => item.menu_id);
                    const formattedMenus = validMenus.map((item: any) => ({
                        id: item.menu_id,
                        day: item.tanggal ? item.tanggal.split(',')[0].trim().toLowerCase() : 'senin',
                        date: item.tanggal,
                        menu: item.nama_menu
                    }));

                    const dayOrder: { [key: string]: number } = { "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6, "minggu": 7 };
                    formattedMenus.sort((a: MenuItem, b: MenuItem) => (dayOrder[a.day] || 8) - (dayOrder[b.day] || 8));
                    setMenus(formattedMenus.slice(0, 5));
                    setAlertMsg(formattedMenus.length > 0 ? "Menu minggu ini telah divalidasi." : "Belum ada jadwal menu.");
                } else {
                    setMenus([]);
                    setAlertMsg("Belum ada data menu.");
                }

                // 2. DATA SEKOLAH (Fix: Handle Object vs Array & Map user_id)
                if (schoolResult.success) {
                    let rawDataSchools = [];
                    if (Array.isArray(schoolResult.data)) {
                        rawDataSchools = schoolResult.data;
                    } else if (schoolResult.data && typeof schoolResult.data === 'object') {
                        rawDataSchools = [schoolResult.data];
                    }

                    const formattedSchools = rawDataSchools
                        .filter((item: any) => item.id)
                        .map((item: any) => ({
                            id: item.id,
                            user_id: item.user_id, // [FIX] Ambil user_id dari API
                            nama_sekolah: item.nama_sekolah || "Nama Sekolah Tidak Tersedia",
                            photo_url: item.photo_url
                        }));
                    setSchools(formattedSchools);
                }

                // 3. DATA LAPORAN
                if (reportResult.success) {
                    const rawData = reportResult.data;
                    const reportsArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                    const formattedReports = reportsArray
                        .filter((item: any) => item.id)
                        .slice(0, 3)
                        .map((item: any) => {
                            const rawSchoolList = Array.isArray(schoolResult.data) ? schoolResult.data : (schoolResult.data ? [schoolResult.data] : []);
                            // Pencocokan sekolah
                            const matchedSchool = rawSchoolList.find((s: any) =>
                                s.nama_sekolah === item.school_name || s.school_name === item.school_name
                            );

                            // Gunakan user_id jika ada, jika tidak fallback ke id biasa
                            const targetId = matchedSchool ? (matchedSchool.user_id || matchedSchool.id) : null;

                            return {
                                id: item.id,
                                schoolId: targetId,
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

    // --- FETCH DETAIL SEKOLAH (Gunakan user_id) ---
    const handleSchoolClick = async (targetId: string) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setSelectedSchool(null);
        setDetailError("");

        try {
            // [FIX] Menggunakan ID yang dikirim (sekarang user_id)
            const res = await fetchWithAuth(`/sppg/schools/${targetId}`, { method: 'GET' });

            if (!res.ok) {
                if (res.status === 404) throw new Error("Data sekolah tidak ditemukan (404).");
                throw new Error(`Gagal memuat data (Status: ${res.status})`);
            }

            const json = await res.json();

            if (json.success) {
                setSelectedSchool(json.data);
            } else {
                throw new Error(json.message || "Gagal mengambil detail sekolah");
            }
        } catch (error: any) {
            console.error("Error detail:", error);
            setDetailError(error.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSchool(null);
    };

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 font-sans pb-8">

            {/* --- KOLOM KIRI (UTAMA) Span 5 --- */}
            <div className="lg:col-span-5 p-4 lg:p-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col">
                {/* Alert Bar */}
                <div className="bg-[#D7762E] w-full rounded-full px-4 lg:px-[1vw] py-2 lg:py-[0.5vw] satoshiMedium text-white text-sm lg:text-[1vw] items-center flex flex-row shadow-md" style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                    <Image src={information} alt="information" width={24} height={24} className="mr-2 lg:mr-[0.5vw] w-5 lg:w-[1.5vw] h-5 lg:h-[1.5vw]" />
                    <span className="truncate">{alertMsg}</span>
                </div>

                {/* Hero */}
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
                <h2 className="satoshiBold text-[4.5vw] md:text-[3vw] lg:text-[2vw] mt-2 lg:mt-0">
                    Menu Minggu Depan
                </h2>
                <div className="bg-[#F5DDCA] p-4 lg:p-[2vw] rounded-2xl lg:rounded-[2vw] flex flex-row gap-4 lg:gap-[1vw] items-start pt-8 lg:pt-[4vw] min-h-[15vw] w-full shadow-md overflow-x-auto lg:overflow-visible no-scrollbar scroll-smooth" style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                    {menus.length > 0 ? (
                        menus.map((item) => (
                            <Link key={item.id} href={`/sppg/menu-mbg/weekly-menu/${item.id}`} className="w-[30%] md:w-[22%] flex-shrink-0 lg:w-auto lg:flex-1 min-w-0 hover:scale-105 transition-transform duration-200">
                                <CardMenu day={item.day} menu={item.menu} />
                            </Link>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 satoshiBold text-[#E87E2F] text-lg lg:text-[2.5vw]">
                            Belum ada jadwal menu.
                        </div>
                    )}
                </div>
            </div>

            {/* --- KOLOM KANAN (SIDEBAR) Span 2 --- */}
            <div className="lg:col-span-2 px-4 lg:pr-[1vw] pt-4 lg:pt-[1vw] gap-4 lg:gap-[1vw] flex flex-col mb-8 lg:mb-0">
                <div className="w-full text-2xl lg:text-[4vw] satoshiBold lg:flex lg:flex-row hidden items-center justify-center lg:justify-start ">
                    <Image src={logoOrange} alt="logo" width={80} height={80} className="w-12 lg:w-[5vw] mr-2 lg:mr-[0.5vw]" />
                    <h1 className="text-[#E87E2F] satoshiBold tracking-wider">INKLUZI</h1>
                </div>

                {/* DAFTAR SEKOLAH */}
                <div className="bg-[#F5DDCA] rounded-2xl lg:rounded-[2vw] relative flex flex-col items-center max-h-[40vw] lg:pb-[1vw] shadow-md h-full overflow-hidden border border-[#F5DDCA]" style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                    <h1 className="bg-[#E87E2F] w-full z-20 text-center flex relative items-center justify-center text-white rounded-xl lg:rounded-[1.5vw] py-2 lg:py-[0.8vw] text-lg lg:text-[1.8vw] satoshiBold shrink-0 z-10">
                        Daftar Sekolah
                    </h1>
                    <div className="w-full flex-1 relative overflow-y-auto lg:p-[0vw] flex flex-col gap-3 lg:gap-[0.5vw] custom-scrollbar">
                        {schools.length > 0 ? (
                            schools.map((school, index) => (
                                <div
                                    key={school.id}
                                    // [FIX] Mengirim user_id, bukan id biasa
                                    onClick={() => handleSchoolClick(school.user_id)}
                                    className="w-full p-2 lg:p-[0.8vw] rounded-xl lg:rounded-[1vw] flex items-center gap-3 lg:gap-[0.8vw] cursor-pointer hover:bg-orange-100/50 transition-colors"
                                >
                                    <div className="w-16 h-16 lg:w-[4vw] lg:h-[4vw] relative shrink-0">
                                        {school.photo_url ? (
                                            <Image src={school.photo_url} alt={school.nama_sekolah} fill sizes="(max-width: 1024px) 64px, 4vw" className="rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#E87E2F] rounded-full flex items-center justify-center text-white satoshiBold text-[5vw] lg:text-[2.5vw]">
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="satoshiBold text-[3vw] lg:text-[1.3vw] text-[#5A3E2B] line-clamp-2 leading-tight">
                                        {school.nama_sekolah}
                                    </h2>
                                </div>
                            ))
                        ) : (
                            <div className="text-center satoshiBold  text-[#E87E2F] flex flex-col items-center justify-center h-full text-lg lg:text-[1.5vw] mt-4 lg:mt-[2vw]">
                                Tidak ada sekolah terdaftar.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PELAPORAN TERBARU --- */}
            <div className='w-full lg:col-span-7 px-4 lg:px-[1vw] mb-4'>
                <h2 className="satoshiBold text-[4.5vw] md:text-[3vw] lg:text-[2vw] mb-[1.5vw] mt-4 lg:mt-0">
                    Pelaporan Terbaru
                </h2>
                <div className="bg-[#F5DDCA] p-4 lg:p-[1.5vw] rounded-2xl lg:rounded-[2vw] shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-[1.5vw]" style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                    {reports.length > 0 ? (
                        reports.map((item) => (
                            <Link key={item.id} href={item.schoolId ? `/sppg/pelaporan/${item.schoolId}` : '#'} className="hover:scale-[1.02] transition-transform duration-200 h-full block">
                                <CardPelaporan sekolah={item.sekolah} pelaporan={item.pelaporan} />
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full w-full text-center py-6 text-[#E87E2F] satoshiBold lg:text-[2vw]">
                            Belum ada laporan masuk.
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL DETAIL SEKOLAH --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeModal} />
                    <div className="relative bg-white w-full max-w-2xl lg:max-w-[50vw] rounded-2xl lg:rounded-[2vw] shadow-2xl  flex flex-col gap-4 lg:gap-[1.5vw] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 lg:w-[1.5vw] lg:h-[1.5vw]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {isModalLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 lg:py-[10vw]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#E87E2F] mb-4"></div>
                                <p className="text-[#E87E2F] satoshiBold">Memuat detail sekolah...</p>
                            </div>
                        ) : detailError ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-red-500 satoshiBold text-lg mb-2">Terjadi Kesalahan</p>
                                <p className="text-gray-500">{detailError}</p>
                                <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg text-sm">Tutup</button>
                            </div>
                        ) : selectedSchool ? (
                            < div className='flex flex-col  p-6 lg:p-[2vw]'>
                                <div className="flex flex-col items-center gap-3 lg:gap-[1vw]">
                                    <div className="relative w-24 h-24 lg:w-[6vw] lg:h-[6vw] shrink-0">
                                        {selectedSchool.photo_url ? (
                                            <Image src={selectedSchool.photo_url} alt={selectedSchool.nama_sekolah} fill sizes="(max-width: 1024px) 96px, 6vw" className="rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#E87E2F] rounded-full flex items-center justify-center text-white satoshiBold text-3xl">
                                                {selectedSchool.nama_sekolah.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="satoshiBold text-2xl lg:text-[2vw] text-[#E87E2F] text-center">{selectedSchool.nama_sekolah}</h2>
                                    <span className="bg-orange-100 text-[#E87E2F] px-3 py-1 rounded-full text-sm lg:text-[0.9vw] satoshiBold">{selectedSchool.jenis_sekolah}</span>
                                </div>
                                <div className="border-t border-gray-100 my-2" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-[1.5vw]">
                                    <div className="bg-[#FFF5EB] p-4 lg:p-[1vw] rounded-xl"><p className="text-gray-500 text-xs lg:text-[0.8vw] satoshiMedium mb-1">Penanggung Jawab</p><p className="text-[#5A3E2B] satoshiBold text-sm lg:text-[1vw]">{selectedSchool.penanggung_jawab}</p></div>
                                    <div className="bg-[#FFF5EB] p-4 lg:p-[1vw] rounded-xl"><p className="text-gray-500 text-xs lg:text-[0.8vw] satoshiMedium mb-1">Nomor Kontak</p><p className="text-[#5A3E2B] satoshiBold text-sm lg:text-[1vw]">{selectedSchool.nomor_kontak}</p></div>
                                    <div className="bg-[#FFF5EB] p-4 lg:p-[1vw] rounded-xl"><p className="text-gray-500 text-xs lg:text-[0.8vw] satoshiMedium mb-1">Alamat</p><p className="text-[#5A3E2B] satoshiBold text-sm lg:text-[1vw]">{selectedSchool.alamat}</p></div>
                                    <div className="bg-[#FFF5EB] p-4 lg:p-[1vw] rounded-xl"><p className="text-gray-500 text-xs lg:text-[0.8vw] satoshiMedium mb-1">Total Siswa</p><p className="text-[#5A3E2B] satoshiBold text-sm lg:text-[1vw]">{selectedSchool.total_siswa} Siswa</p></div>
                                </div>
                                <div>
                                    <h3 className="satoshiBold text-[#5A3E2B] text-lg lg:text-[1.2vw] mb-3 lg:mb-[0.5vw]">Distribusi Siswa Disabilitas</h3>
                                    {selectedSchool.disability_types?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 lg:gap-[0.5vw]">
                                            {selectedSchool.disability_types.map((d, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm"><span className="w-2 h-2 rounded-full bg-[#E87E2F]"></span><span className="text-gray-700 satoshiMedium text-sm lg:text-[1vw]">{d.jenis_disabilitas}: <span className="satoshiBold">{d.jumlah_siswa}</span></span></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm italic">Data disabilitas tidak tersedia.</p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
export default MainDashboardSppg;