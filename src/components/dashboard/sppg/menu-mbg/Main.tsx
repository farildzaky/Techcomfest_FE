'use client'
import React, { useState, useEffect } from "react";
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

    const handleUpdateMenu = (hari: string, data: MenuData) => {
        setWeeklyMenuData(prev => ({
            ...prev,
            [hari]: data
        }));
    };

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
        <div className="w-full h-screen grid grid-cols-7 bg-white relative">
            <div className="col-span-5 h-full flex flex-col gap-[2vw]">
                <div className="flex flex-col bg-white w-full z-10 fixed px-[2vw]">
                    <div className="flex items-start gap-[1vw] mt-[2vw]">
                        <button onClick={() => router.back()} className="hover:scale-105 transition-transform translate-y-[1vw]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-[3vw] h-[3vw] text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="satoshiBold text-[3vw]">Menu MBG</h1>
                            <h3 className="satoshiMedium text-[1.5vw] ml-[0.5vw]">Menu MBG untuk seluruh sekolah</h3>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-[3vw] overflow-y-auto mt-[12vw] p-[2vw]">
                    {pageLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="w-full bg-white rounded-[1.5vw] p-[2vw] border border-gray-100 shadow-sm animate-pulse flex flex-col gap-[1.5vw]">
                                <div className="h-[2vw] w-[20%] bg-gray-200 rounded"></div>
                                <div className="flex gap-[2vw]">
                                    <div className="flex-1 h-[3vw] bg-gray-200 rounded"></div>
                                    <div className="flex-1 h-[3vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-[8vw] w-full bg-gray-200 rounded"></div>
                                <div className="flex justify-end mt-[1vw]">
                                    <div className="h-[3vw] w-[15%] bg-gray-200 rounded-[1vw]"></div>
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

                <div className="flex justify-end z-30 pb-[2vw] pr-[2vw]">
                    {pageLoading ? (
                        <div className="h-[4vw] w-[20vw] bg-gray-200 rounded-[1vw] animate-pulse"></div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`text-white satoshiBold text-[1.5vw] py-[1vw] px-[4vw] rounded-[1vw] shadow-md transition-colors
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D7762E] hover:bg-[#b56225]'}
                            `}
                        >
                            {loading ? "Menyimpan..." : "Simpan Menu Mingguan"}
                        </button>
                    )}
                </div>
            </div>

            <div className="col-span-2 h-screen relative z-20">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]">
                </div>
            </div>

            {loading && (
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
                            onClick={handleSuccessConfirm}
                            className="py-[0.8vw] px-[3vw] rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
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