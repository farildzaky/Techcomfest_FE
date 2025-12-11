'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CardDetail from "./CardDetail"; 
import { fetchWithAuth } from '@/src/lib/api'; 

interface Gizi {
    kalori: string;
    protein: string;
    lemak: string;
    serat: string;
}

interface MenuData {
    id: string;
    tanggal: string; 
    nama_menu: string;
    komponen_menu: string[];
    risiko_umum_ringkas: string[];
    ringkasan_gizi: Gizi;
    status_keamanan: string; 
}

const SkeletonCard = () => {
    return (
        <div className="w-full bg-[#F5DDCA] rounded-xl lg:rounded-[2vw] p-4 lg:p-[2vw] flex flex-col lg:flex-row gap-4 lg:gap-[2vw] animate-pulse shadow-md mb-4 lg:mb-0">
            <div className="flex flex-col gap-2 lg:gap-[1vw] flex-1">
                <div className="h-8 lg:h-[2vw] bg-gray-300 rounded w-[70%]" />
                <div className="h-4 lg:h-[1.2vw] bg-gray-300 rounded w-[40%]" />
                <div className="h-8 lg:h-[2vw] bg-gray-300 rounded-full w-[30%] mt-2 lg:mt-[0.5vw]" />
                
                <div className="mt-4 lg:mt-[1vw]">
                    <div className="h-5 lg:h-[1.3vw] bg-gray-300 rounded w-[35%] mb-2 lg:mb-[0.5vw]" />
                    <div className="flex flex-wrap gap-2 lg:gap-[0.5vw]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 lg:h-[1.8vw] bg-gray-300 rounded-full w-[20%]" />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="w-full lg:w-[15%] flex items-center justify-center h-24 lg:h-auto">
                <div className="w-24 lg:w-[8vw] h-24 lg:h-[8vw] bg-gray-300 rounded-lg lg:rounded-[1.5vw]" />
            </div>
        </div>
    );
};

const MenuMbgSekolah = () => {
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [loading, setLoading] = useState(true);

    const parseIndonesianDate = (dateStr: string) => {
        const months: { [key: string]: number } = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };

        try {
            const parts = dateStr.split(' '); 
            if (parts.length < 4) return new Date(); 

            const day = parseInt(parts[1], 10);
            const monthStr = parts[2];
            const year = parseInt(parts[3], 10);
            
            return new Date(year, months[monthStr] || 0, day);
        } catch (e) {
            return new Date();
        }
    };

    const getDayWeight = (dateStr: string) => {
        const dayName = dateStr.split(',')[0].trim(); 
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

    const formatStatus = (status: string) => {
        if (!status) return "Aman";
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchWithAuth('/school/menus', {
                    method: 'GET'
                });
                
                if (!response.ok) throw new Error("Gagal mengambil data menu");
                
                const result = await response.json();
                let fetchedMenus: MenuData[] = result.data || [];

                fetchedMenus.sort((a, b) => {
                    return parseIndonesianDate(a.tanggal).getTime() - parseIndonesianDate(b.tanggal).getTime();
                });

                let top5Menus = fetchedMenus.slice(0, 5);

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
            <div className="flex flex-col lg:grid lg:grid-cols-7 w-full h-full lg:h-screen bg-white relative">
                <div className="lg:col-span-5 p-4 lg:p-[2vw] flex flex-col gap-4 lg:gap-[2vw]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>

                <div className="hidden lg:block lg:col-span-2 h-screen relative z-20">
                    <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-7 w-full min-h-screen bg-white relative"> 
            
            <div className="lg:col-span-5 p-4 lg:p-[2vw] flex flex-col gap-4 lg:gap-[2vw]">
                {menus.length > 0 ? (
                    menus.map((item) => {
                        const dayName = item.tanggal.split(',')[0].trim();

                        return (
                            <Link href={`/sekolah/menu-mbg/${item.id}`} key={item.id} className="block transition-transform hover:scale-[1.01]">
                                <CardDetail
                                    menu={item.nama_menu}
                                    date={item.tanggal}
                                    day={dayName} 
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
                    <div className="text-center text-gray-400 mt-10 lg:mt-[5vw] satoshiBold text-xl lg:text-[1.5vw]">Tidak ada data menu tersedia.</div>
                )}
            </div>

            <div className="hidden lg:block lg:col-span-2 h-screen relative z-20">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                </div>
            </div>
            
        </div>
    );
}

export default MenuMbgSekolah;