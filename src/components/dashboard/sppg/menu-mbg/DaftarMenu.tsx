'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import CardDetailSppg from "./CardDetail"; 
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image'; 
import bg from "../../../../assets/bg.png" 
import loadingSpinner from "../../../../assets/loading.png" 

interface Komponen {
    nama: string;
    porsi: string;
}

interface GiziItem {
    komponen: string;
    jumlah: string;
}

interface MenuDetailAPI {
    menu_id: string;
    tanggal: string; 
    nama_menu: string;
    hari?: string;
    status_keamanan: string;
    komponen_menu: Komponen[];
    kandungan_gizi: GiziItem[];
    deteksi_risiko: {
        alergi: string[];
        tekstur: string[];
        porsi_gizi: string[];
    };
}

const DaftarMenu = () => {
    const [menus, setMenus] = useState<MenuDetailAPI[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
    
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const parseIndonesianDate = (dateStr: string) => {
        if (!dateStr) return new Date(0); 

        const monthMap: { [key: string]: string } = {
            'Januari': 'Jan', 'Februari': 'Feb', 'Maret': 'Mar', 'April': 'Apr', 'Mei': 'May', 'Juni': 'Jun',
            'Juli': 'Jul', 'Agustus': 'Aug', 'September': 'Sep', 'Oktober': 'Oct', 'November': 'Nov', 'Desember': 'Dec'
        };

        const cleanStr = dateStr.replace(/,/g, ''); 
        const parts = cleanStr.split(' ');

        let day, monthIndo, year;

        if (parts.length === 4) {
            day = parts[1];
            monthIndo = parts[2];
            year = parts[3];
        } else if (parts.length === 3) {
            day = parts[0];
            monthIndo = parts[1];
            year = parts[2];
        } else {
            return new Date(0); 
        }

        const monthEn = monthMap[monthIndo] || monthIndo;
        return new Date(`${day} ${monthEn} ${year}`);
    };

    useEffect(() => {
        const fetchAllMenuDetails = async () => {
            try {
                const listResponse = await fetchWithAuth('https://api.inkluzi.my.id/api/v1/sppg/menus', {
                    method: 'GET'
                });

                const listResult = await listResponse.json();

                if (!listResponse.ok) {
                    throw new Error(listResult.message || "Gagal mengambil daftar menu");
                }

                const listData = Array.isArray(listResult.data) ? listResult.data : [listResult.data];
                
                const sortedListDesc = listData.sort((a: any, b: any) => {
                    return parseIndonesianDate(b.tanggal).getTime() - parseIndonesianDate(a.tanggal).getTime();
                });

                const targetMenus = sortedListDesc.slice(0, 5);
                
                const detailedMenus: MenuDetailAPI[] = [];
                for (const item of targetMenus) {
                    try {
                        const detailResponse = await fetchWithAuth(`/sppg/menus/${item.menu_id}`, {
                            method: 'GET'
                        });
                        
                        if (detailResponse.status === 429) {
                            console.warn("Rate limit hit, skipping:", item.menu_id);
                            continue;
                        }

                        const detailJson = await detailResponse.json();
                        if (detailJson.data) {
                            detailedMenus.push(detailJson.data);
                        }
                    } catch (err) {
                        console.error("Gagal fetch ID:", item.menu_id);
                    }
                }

                setMenus(detailedMenus);

            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError("Gagal memuat data menu.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllMenuDetails();
    }, []);

    const handleUpdateMenu = async (id: string, updatedComponents: Komponen[]) => {
        setIsUpdatingId(id); 
        try {
            const response = await fetchWithAuth(`https://api.inkluzi.my.id/api/v1/sppg/menus/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ komponen_menu: updatedComponents }),
            });

            if (response.ok) {
                setMenus(prev => prev.map(item => item.menu_id === id ? { ...item, komponen_menu: updatedComponents } : item));
                setSuccessMessage("Menu berhasil diperbarui!"); 
            } else {
                alert(`Gagal update`); 
            }
        } catch (error) {
            console.error("Error updating:", error);
        } finally {
            setIsUpdatingId(null); 
        }
    };

    const renderContent = () => {
        if (loading) return <div className="text-gray-500 italic p-4">Sedang memuat data menu...</div>;
        if (error) return <div className="text-red-500 font-bold p-4">Error: {error}</div>;
        if (menus.length === 0) return <div className="text-gray-500 p-4">Belum ada data menu tersedia.</div>;

        const sortedDisplayMenus = [...menus].sort((a, b) => {
            return parseIndonesianDate(a.tanggal).getTime() - parseIndonesianDate(b.tanggal).getTime();
        });

        return sortedDisplayMenus.map((item) => {
            
            const risiko = item.deteksi_risiko || {}; 

            const riskList = [
                ...(risiko.alergi || []),
                ...(risiko.tekstur || []),
                ...(risiko.porsi_gizi || [])
            ];

            const nutritionList = item.kandungan_gizi ? item.kandungan_gizi.map(gizi => ({
                label: gizi.komponen, value: gizi.jumlah
            })) : [];

            const displayDay = item.hari || item.tanggal.split(',')[0]; 

            return (
                <Link
                    href={`/sppg/menu-mbg/weekly-menu/${item.menu_id}`}
                    key={item.menu_id}
                    className="block transition-transform hover:scale-[1.01]"
                >
                    <CardDetailSppg
                        menu={item.nama_menu}
                        date={item.tanggal}
                        day={displayDay}
                        status={item.status_keamanan?.replace('_', ' ') || 'Aman'}
                        components={item.komponen_menu || []}
                        risk={riskList}
                        nutrition={nutritionList}
                        onSave={(updated) => handleUpdateMenu(item.menu_id, updated)}
                    />
                </Link>
            );
        });
    };

    return (
        <div className="w-full h-full grid grid-cols-7 bg-white overflow-hidden">
            <div className="col-span-5 h-full overflow-y-auto p-[2vw] flex flex-col gap-[2vw]">
                {renderContent()}
            </div>

            <div className="col-span-2 h-screen relative">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                </div>
            </div>

            {isUpdatingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[2vw] p-[3vw] w-[35vw] shadow-2xl flex flex-col items-center text-center">
                        
                        <div className="relative w-[12vw] h-[12vw] flex items-center justify-center">
                            
                            <Image 
                                src={bg} 
                                alt="Background Shape" 
                                layout="fill"
                                objectFit="contain"
                            />
                            <Image 
                                src={loadingSpinner} 
                                alt="Spinner" 
                                className="w-[5vw] h-[5vw] object-contain absolute translate-y-[0.4vw] translate-x-[0.4vw] animate-spin"
                            />
                        </div>
                        
                        <h3 className="satoshiBold text-[2.5vw] text-[#E87E2F] mt-[2vw]">Sedang Diproses</h3>
                        <p className="satoshiMedium text-[1.2vw] text-gray-500 mt-[0.5vw]">
                            Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                        </p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[1.5vw] p-[3vw] w-[28vw] shadow-2xl flex flex-col items-center text-center gap-[2vw]">
                        
                        <div className="w-[5vw] h-[5vw] rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[3vw] h-[3vw] text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        
                        <h3 className="satoshiBold text-[1.8vw] text-gray-800">{successMessage}</h3>
                        
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="py-[0.8vw] px-[3vw] rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                        >
                            OKE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DaftarMenu;