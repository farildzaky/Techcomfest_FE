'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CardDetail from "./CardDetail"; // Pastikan path import ini sesuai
import { fetchWithAuth } from '@/src/lib/api'; // Sesuaikan path lib API Anda

// --- Interfaces sesuai Response API (Image 3) ---
interface Gizi {
    kalori: string;
    protein: string;
    lemak: string;
    serat: string;
    // tambahkan lain jika ada
}

interface MenuData {
    id: string;
    tanggal: string; // Format: "Kamis, 15 Januari 2026"
    nama_menu: string;
    komponen_menu: string[];
    risiko_umum_ringkas: string[];
    ringkasan_gizi: Gizi;
    status_keamanan: string; // ex: "perlu_perhatian"
}

// --- Skeleton Card Component ---
const SkeletonCard = () => {
    return (
        <div className="w-full bg-[#F5DDCA] rounded-[2vw] p-[2vw] flex flex-row gap-[2vw] animate-pulse"
            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
        >
            {/* Left Section */}
            <div className="flex flex-col gap-[1vw] flex-1">
                {/* Menu Name */}
                <div className="h-[2vw] bg-gray-300 rounded w-[70%]" />
                
                {/* Date */}
                <div className="h-[1.2vw] bg-gray-300 rounded w-[40%]" />
                
                {/* Status Badge */}
                <div className="h-[2vw] bg-gray-300 rounded-full w-[30%] mt-[0.5vw]" />
                
                {/* Components Section */}
                <div className="mt-[1vw]">
                    <div className="h-[1.3vw] bg-gray-300 rounded w-[35%] mb-[0.5vw]" />
                    <div className="flex flex-wrap gap-[0.5vw]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[1.8vw] bg-gray-300 rounded-full w-[20%]" />
                        ))}
                    </div>
                </div>
                
                {/* Risk Section */}
                <div className="mt-[1vw]">
                    <div className="h-[1.3vw] bg-gray-300 rounded w-[30%] mb-[0.5vw]" />
                    <div className="space-y-[0.3vw]">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-[1.2vw] bg-gray-300 rounded w-[85%]" />
                        ))}
                    </div>
                </div>
                
                {/* Nutrition Section */}
                <div className="mt-[1vw]">
                    <div className="h-[1.3vw] bg-gray-300 rounded w-[35%] mb-[0.5vw]" />
                    <div className="grid grid-cols-2 gap-[0.5vw]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-[0.5vw]">
                                <div className="h-[1.2vw] bg-gray-300 rounded w-[40%]" />
                                <div className="h-[1.2vw] bg-gray-300 rounded w-[50%]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Right Section - Day Box */}
            <div className="w-[15%] flex items-center justify-center">
                <div className="w-[8vw] h-[8vw] bg-gray-300 rounded-[1.5vw]" />
            </div>
        </div>
    );
};

const MenuMbgSekolah = () => {
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Helper: Parsing Tanggal Indonesia ke Javascript Date ---
    const parseIndonesianDate = (dateStr: string) => {
        // Input: "Kamis, 15 Januari 2026"
        const months: { [key: string]: number } = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };

        try {
            const parts = dateStr.split(' '); // ["Kamis,", "15", "Januari", "2026"]
            if (parts.length < 4) return new Date(); // Fallback

            const day = parseInt(parts[1], 10);
            const monthStr = parts[2];
            const year = parseInt(parts[3], 10);
            
            return new Date(year, months[monthStr] || 0, day);
        } catch (e) {
            return new Date();
        }
    };

    // --- Helper: Bobot Hari untuk Sorting (Senin -> Jumat) ---
    const getDayWeight = (dateStr: string) => {
        const dayName = dateStr.split(',')[0].trim(); // Ambil "Kamis" dari "Kamis, ..."
        const days: { [key: string]: number } = {
            'Senin': 1,
            'Selasa': 2,
            'Rabu': 3,
            'Kamis': 4,
            'Jumat': 5,
            'Sabtu': 6,
            'Minggu': 7
        };
        return days[dayName] || 99;
    };

    // --- Helper: Format Status API ke UI ---
    const formatStatus = (status: string) => {
        // "perlu_perhatian" -> "Perlu Perhatian"
        if (!status) return "Aman";
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gunakan fetchWithAuth atau fetch biasa dengan header Authorization
                const response = await fetchWithAuth('/school/menus', {
                    method: 'GET'
                });
                
                if (!response.ok) throw new Error("Gagal mengambil data menu");
                
                const result = await response.json();
                let fetchedMenus: MenuData[] = result.data || [];

                // LOGIKA SORTING & FILTERING
                
                // 1. Sort berdasarkan Tanggal Terlama (Ascending)
                fetchedMenus.sort((a, b) => {
                    return parseIndonesianDate(a.tanggal).getTime() - parseIndonesianDate(b.tanggal).getTime();
                });

                // 2. Ambil 5 data teratas (5 tanggal paling tua)
                let top5Menus = fetchedMenus.slice(0, 5);

                // 3. Sort ulang 5 data tersebut berdasarkan Hari (Senin -> Jumat)
                top5Menus.sort((a, b) => {
                    return getDayWeight(a.tanggal) - getDayWeight(b.tanggal);
                });

                setMenus(top5Menus);

            } catch (error) {
                console.error("Error fetching menus:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen grid grid-cols-7 bg-white relative">
                <div className="col-span-5 p-[2vw] flex flex-col gap-[2vw]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>

                <div className="col-span-2 h-screen relative z-20">
                    <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen grid grid-cols-7 bg-white relative"> 
            
            <div className="col-span-5  p-[2vw] flex flex-col gap-[2vw]">
                {menus.length > 0 ? (
                    menus.map((item) => {
                        // Extract Hari dari string tanggal (contoh: "Senin" dari "Senin, 12 ...")
                        const dayName = item.tanggal.split(',')[0].trim();

                        return (
                            <Link href={`/sekolah/menu-mbg/${item.id}`} key={item.id} className="block transition-transform hover:scale-[1.01]">
                                <CardDetail
                                    menu={item.nama_menu}
                                    date={item.tanggal}
                                    day={dayName} // Tampilkan Hari di kotak putih kanan
                                    status={formatStatus(item.status_keamanan)}
                                    components={item.komponen_menu}
                                    risk={item.risiko_umum_ringkas}
                                    nutrition={[
                                        { label: "Kalori", value: item.ringkasan_gizi.kalori },
                                        { label: "Protein", value: item.ringkasan_gizi.protein },
                                        { label: "Lemak", value: item.ringkasan_gizi.lemak },
                                        { label: "Serat", value: item.ringkasan_gizi.serat },
                                    ]}
                                />
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-400 mt-[5vw] satoshiBold text-[1.5vw]">Tidak ada data menu tersedia.</div>
                )}
            </div>

            <div className="col-span-2 h-screen relative z-20">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                </div>
            </div>
            
        </div>
    );
}

export default MenuMbgSekolah;