'use client'
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import CardFormMenuMbg, { MenuData } from "./CardForm";
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';
import bg from "../../../../assets/bg.png";
import loadingSpinner from "../../../../assets/loading.png";

const MainMenuMbg = () => {
    const router = useRouter();
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const [weeklyMenuData, setWeeklyMenuData] = useState<Record<string, MenuData>>({});
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [resetKey, setResetKey] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleUpdateMenu = useCallback((hari: string, data: MenuData) => {
        setWeeklyMenuData(prev => {
            // Cek sederhana agar tidak update jika data sama persis (opsional, tapi bagus untuk performa)
            if (JSON.stringify(prev[hari]) === JSON.stringify(data)) {
                return prev;
            }
            return {
                ...prev,
                [hari]: data
            };
        });
    }, []);

    const handleSuccessConfirm = () => {
        setSuccessMessage(null);
        setWeeklyMenuData({});
        setResetKey(prev => prev + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const filledDaysEntries = Object.entries(weeklyMenuData).filter(
                ([_, item]) => item.tanggal && item.nama_menu && item.komponen_menu.length > 0
            );

            if (filledDaysEntries.length === 0) {
                alert("Mohon isi minimal satu menu harian dengan lengkap.");
                setLoading(false);
                return;
            }

            const results = await Promise.all(filledDaysEntries.map(async ([hari, menuData]) => {
                try {
                    const res = await fetchWithAuth("/sppg/menus", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(menuData)
                    });

                    const responseJson = await res.json();

                    if (!res.ok) {
                        return {
                            success: false,
                            hari,
                            message: responseJson.message || "Gagal menyimpan data."
                        };
                    }

                    return { success: true, hari, message: "Berhasil" };

                } catch (err) {
                    return { success: false, hari, message: "Terjadi kesalahan jaringan." };
                }
            }));

            const failures = results.filter(r => !r.success);
            const successes = results.filter(r => r.success);

            if (failures.length > 0) {
                const errorMsg = failures.map(f => `• ${f.hari}: ${f.message}`).join("\n");
                alert(`Beberapa menu gagal disimpan:\n${errorMsg}\n\nSilakan periksa kembali tanggal atau formatnya.`);
            } else {
                setSuccessMessage(`Berhasil! ${successes.length} menu harian telah disimpan.`);
            }

        } catch (error) {
            console.error("Error submitting menu:", error);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // Mobile: flex-col, Desktop (lg): grid-cols-7 (Sesuai kode asli)
        <div className="w-full h-screen flex flex-col lg:grid lg:grid-cols-7 bg-white relative">
            
            {/* Mobile: w-full, Desktop (lg): col-span-5 */}
            <div className="w-full lg:col-span-5 h-full flex flex-col gap-4 lg:gap-[2vw]">
                
                {/* Header Fixed */}
                <div className="flex flex-col bg-white w-full z-10 fixed px-4 py-4 lg:px-[2vw] lg:py-0 shadow-sm lg:shadow-none">
                    <div className="flex items-start gap-4 lg:gap-[1vw] mt-0 lg:mt-[2vw]">
                        {/* Tombol Back */}
                        <button onClick={() => router.back()} className="hover:scale-105 transition-transform lg:translate-y-[1vw]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-6 h-6 lg:w-[3vw] lg:h-[3vw] text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        
                        {/* Judul & Subjudul */}
                        <div className="flex flex-col">
                            <h1 className="satoshiBold text-2xl lg:text-[3vw]">Menu MBG</h1>
                            <h3 className="satoshiMedium text-sm lg:text-[1.5vw] ml-0 lg:ml-[0.5vw] text-gray-500 lg:text-black">Menu MBG untuk seluruh sekolah</h3>
                        </div>
                    </div>
                </div>

                {/* Konten Scrollable */}
                {/* Mobile: mt-24 (biar gak ketutup header), padding kiri kanan standar. Desktop: mt-[12vw], ml-[6vw] sesuai asli */}
                <div className="flex flex-col gap-6 lg:gap-[3vw] overflow-y-auto mt-28 px-4 pb-24 lg:mt-[12vw] lg:ml-[6vw] lg:px-0 lg:pb-0">
                    {pageLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="w-full bg-white rounded-xl lg:rounded-[1.5vw] p-4 lg:p-[2vw] border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4 lg:gap-[1.5vw]">
                                <div className="h-6 lg:h-[2vw] w-[30%] lg:w-[20%] bg-gray-200 rounded"></div>
                                <div className="flex gap-4 lg:gap-[2vw]">
                                    <div className="flex-1 h-10 lg:h-[3vw] bg-gray-200 rounded"></div>
                                    <div className="flex-1 h-10 lg:h-[3vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-24 lg:h-[8vw] w-full bg-gray-200 rounded"></div>
                                <div className="flex justify-end mt-2 lg:mt-[1vw]">
                                    <div className="h-8 lg:h-[3vw] w-[20%] lg:w-[15%] bg-gray-200 rounded-lg lg:rounded-[1vw]"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        days.map((hari) => (
                            <CardFormMenuMbg
                                key={`${hari}-${resetKey}`}
                                hari={hari}
                                onUpdate={(data) => handleUpdateMenu(hari, data)}
                            />
                        ))
                    )}
                </div>

                {/* Tombol Simpan */}
                {/* Mobile: Fixed bottom agar mudah dijangkau. Desktop: Relative di bawah konten sesuai asli */}
                <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t lg:border-none lg:static lg:bg-transparent lg:w-auto lg:p-0 flex justify-end z-30 lg:pb-[2vw] lg:pr-[2vw]">
                    {pageLoading ? (
                        <div className="h-12 lg:h-[4vw] w-full lg:w-[20vw] bg-gray-200 rounded-lg lg:rounded-[1vw] animate-pulse"></div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full lg:w-auto text-white satoshiBold text-lg lg:text-[1.5vw] py-3 lg:py-[1vw] px-8 lg:px-[4vw] rounded-lg lg:rounded-[1vw] shadow-md transition-colors
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D7762E] hover:bg-[#b56225]'}
                            `}
                        >
                            {loading ? "Menyimpan..." : "Simpan Menu Mingguan"}
                        </button>
                    )}
                </div>
            </div>

            {/* Bagian Kanan (Hanya Desktop) */}
            <div className="hidden lg:block lg:col-span-2 h-screen relative z-20">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                </div>
            </div>

            {/* Loading Modal */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 lg:px-0">
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-xs lg:w-[35vw] lg:max-w-none shadow-2xl flex flex-col items-center text-center">
                        <div className="relative w-20 h-20 lg:w-[12vw] lg:h-[12vw] flex items-center justify-center">
                            <Image
                                src={bg}
                                alt="Background Shape"
                                layout="fill"
                                objectFit="contain"
                            />
                            <Image
                                src={loadingSpinner}
                                alt="Spinner"
                                className="w-8 h-8 lg:w-[5vw] lg:h-[5vw] object-contain absolute translate-y-1 lg:translate-y-[0.4vw] translate-x-1 lg:translate-x-[0.4vw] animate-spin"
                            />
                        </div>
                        <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                        <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                            Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                        </p>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 lg:px-0">
                    <div className="relative bg-white rounded-2xl lg:rounded-[1.5vw] p-6 lg:p-[3vw] w-full max-w-xs lg:w-[28vw] lg:max-w-none shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[2vw]">
                        <div className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 lg:w-[3vw] lg:h-[3vw] text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 className="satoshiBold text-lg lg:text-[1.8vw] text-gray-800">{successMessage}</h3>
                        <button
                            onClick={handleSuccessConfirm}
                            className="py-2 lg:py-[0.8vw] px-6 lg:px-[3vw] rounded-lg lg:rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                        >
                            OKE
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainMenuMbg;