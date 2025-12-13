'use client'
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import CardFormMenuMbg, { MenuData } from "./CardForm";
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';

// Import Assets
import bg from "../../../../assets/bg.png";
import loadingIcon from "../../../../assets/loading.png";
import alertIcon from "../../../../assets/alert.png";

const MainMenuMbg = () => {
    const router = useRouter();
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const [weeklyMenuData, setWeeklyMenuData] = useState<Record<string, MenuData>>({});
    const [pageLoading, setPageLoading] = useState(true);
    const [resetKey, setResetKey] = useState(0);

    // State untuk menyimpan tanggal menu yang sudah ada (Format YYYY-MM-DD)
    const [existingDates, setExistingDates] = useState<Set<string>>(new Set());

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'loading' | 'error' | 'success' | null>(null);
    const [modalMessage, setModalMessage] = useState({ title: "", desc: "" });

    // --- HELPER: KONVERSI TANGGAL API KE YYYY-MM-DD ---
    // Input: "Rabu, 21 Januari 2026" -> Output: "2026-01-21"
    const convertApiDateToStandard = (dateStr: string) => {
        try {
            if (!dateStr) return "";

            // 1. Pecah string (misal: "Rabu, 21 Januari 2026")
            // Ambil bagian setelah koma jika ada
            const cleanDate = dateStr.includes(',') ? dateStr.split(',')[1].trim() : dateStr;
            const parts = cleanDate.split(' '); // ["21", "Januari", "2026"]

            if (parts.length < 3) return "";

            const day = parts[0].padStart(2, '0'); // "21"
            const monthStr = parts[1].toLowerCase(); // "januari"
            const year = parts[2]; // "2026"

            // Mapping bulan Indo ke Angka
            const monthMap: { [key: string]: string } = {
                'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
                'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
                'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
            };

            const month = monthMap[monthStr];

            if (!month) return ""; // Jika bulan tidak valid

            return `${year}-${month}-${day}`; // Format standar YYYY-MM-DD
        } catch (e) {
            return "";
        }
    };

    // --- FETCH DATA AWAL (Cek Menu Existing) ---
    useEffect(() => {
        const initData = async () => {
            try {
                const res = await fetchWithAuth("/sppg/menus", { method: "GET" });
                const json = await res.json();

                if (res.ok && Array.isArray(json.data)) {
                    // Konversi semua tanggal dari API ke format standar YYYY-MM-DD
                    const dates = new Set<string>();
                    json.data.forEach((item: any) => {
                        const standardDate = convertApiDateToStandard(item.tanggal);
                        if (standardDate) dates.add(standardDate);
                    });

                    setExistingDates(dates);
                    console.log("Tanggal terdaftar (Formatted):", Array.from(dates));
                }
            } catch (error) {
                console.error("Gagal memuat data menu existing:", error);
            } finally {
                setTimeout(() => setPageLoading(false), 1000);
            }
        };

        initData();
    }, []);

    const handleUpdateMenu = useCallback((hari: string, data: MenuData) => {
        setWeeklyMenuData(prev => {
            if (JSON.stringify(prev[hari]) === JSON.stringify(data)) return prev;
            return { ...prev, [hari]: data };
        });
    }, []);

    // --- HELPER MODAL ---
    const showLoadingModal = () => {
        setModalType('loading');
        setIsModalOpen(true);
    };

    const showErrorModal = (title: string, message: string) => {
        setModalType('error');
        setModalMessage({ title, desc: message });
        setIsModalOpen(true);
    };

    const showSuccessModal = () => {
        setModalType('success');
        setModalMessage({ title: "Berhasil Disimpan", desc: "Menu mingguan berhasil ditambahkan." });
        setIsModalOpen(true);

        setTimeout(() => {
            router.push("/sppg/menu-mbg/weekly-menu");
        }, 1500);
    };

    const closeModal = () => {
        if (modalType === 'loading' || modalType === 'success') return;
        setIsModalOpen(false);
        setModalType(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async () => {
        // 1. Filter hari yang diisi user
        const filledDaysEntries = Object.entries(weeklyMenuData).filter(
            ([_, item]) => item.tanggal && item.nama_menu && item.komponen_menu.length > 0
        );

        if (filledDaysEntries.length === 0) {
            showErrorModal("Data Kosong", "Mohon isi minimal satu menu harian dengan lengkap.");
            return;
        }

        // 2. Validasi Tanggal Duplikat
        // Bandingkan input user (format YYYY-MM-DD) dengan data existing yang sudah dikonversi
        const duplicateEntries = filledDaysEntries.filter(([hari, item]) => {
            return existingDates.has(item.tanggal); // item.tanggal dari input type="date" biasanya sudah YYYY-MM-DD
        });

        if (duplicateEntries.length > 0) {
            const conflictDetails = duplicateEntries
                .map(([hari, item]) => `${hari} (${item.tanggal})`)
                .join(", ");

            showErrorModal(
                "Tanggal Sudah Terisi",
                `Tidak boleh mengisi di tanggal yang sama. Menu untuk tanggal berikut sudah ada di database: ${conflictDetails}. Silakan pilih tanggal lain.`
            );
            return; // STOP proses
        }

        showLoadingModal();

        try {
            const results = await Promise.all(filledDaysEntries.map(async ([hari, menuData]) => {
                try {
                    const res = await fetchWithAuth("/sppg/menus", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(menuData)
                    });

                    const responseJson = await res.json();

                    if (!res.ok) {
                        return {
                            success: false,
                            hari,
                            message: responseJson.message || "Gagal menyimpan."
                        };
                    }
                    return { success: true, hari, message: "Berhasil" };

                } catch (err) {
                    return { success: false, hari, message: "Kesalahan jaringan." };
                }
            }));

            const failures = results.filter(r => !r.success);

            if (failures.length > 0) {
                const errorMsg = failures.map(f => `${f.hari}: ${f.message}`).join(", ");
                setIsModalOpen(false);
                setTimeout(() => showErrorModal("Gagal Menyimpan", `Beberapa menu gagal disimpan: ${errorMsg}`), 100);
            } else {
                showSuccessModal();
            }

        } catch (error) {
            console.error("Error submitting menu:", error);
            setIsModalOpen(false);
            setTimeout(() => showErrorModal("Error Sistem", "Terjadi kesalahan sistem saat memproses data."), 100);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col lg:grid lg:grid-cols-7 bg-white relative">

            <div className="w-full lg:col-span-5 h-full flex flex-col gap-4 lg:gap-[2vw]">
                {/* Header Fixed */}
                <div className="flex flex-col bg-white w-full z-10 fixed px-4 py-4 lg:px-[2vw] lg:py-0 shadow-sm lg:shadow-none">
                    <div className="flex items-start gap-4 lg:gap-[1vw] mt-0 lg:mt-[2vw]">
                        <button onClick={() => router.back()} className="hover:scale-105 transition-transform lg:translate-y-[1vw]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-6 h-6 lg:w-[3vw] lg:h-[3vw] text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="satoshiBold text-2xl lg:text-[3vw]">Menu MBG</h1>
                            <h3 className="satoshiMedium text-sm lg:text-[1.5vw] ml-0 lg:ml-[0.5vw] text-gray-500 lg:text-black">Menu MBG untuk seluruh sekolah</h3>
                        </div>
                    </div>
                </div>

                {/* Konten Scrollable */}
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
                <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t lg:border-none lg:static lg:bg-transparent lg:w-auto lg:p-0 flex justify-end z-30 lg:pb-[2vw] lg:pr-[2vw]">
                    {pageLoading ? (
                        <div className="h-12 lg:h-[4vw] w-full lg:w-[20vw] bg-gray-200 rounded-lg lg:rounded-[1vw] animate-pulse"></div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={modalType === 'loading'}
                            className={`w-full lg:w-auto text-white satoshiBold text-lg lg:text-[1.5vw] py-3 lg:py-[1vw] px-8 lg:px-[4vw] rounded-lg lg:rounded-[1vw] shadow-md transition-colors
                                ${modalType === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D7762E] hover:bg-[#b56225]'}
                            `}
                        >
                            {modalType === 'loading' ? "Menyimpan..." : "Simpan Menu Mingguan"}
                        </button>
                    )}
                </div>
            </div>

            {/* Bagian Kanan (Hanya Desktop) */}
            <div className="hidden lg:block lg:col-span-2 h-screen relative z-20">
                <div className="w-full h-full fixed bg-[#F5DDCA] [clip-path:ellipse(45%_70%_at_50%_50%)]"></div>
            </div>

            {/* --- UNIVERSAL MODAL SYSTEM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-lg lg:w-[40vw] shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center gap-4 lg:gap-[1.5vw]">

                        {/* ICON SECTION */}
                        <div className="relative w-24 h-24 lg:w-[10vw] lg:h-[10vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />

                            {modalType === 'loading' && (
                                <Image src={loadingIcon} alt="Loading" className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                            )}

                            {(modalType === 'error' || modalType === 'success') && (
                                <Image src={alertIcon} alt="Alert" className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] translate-y-[-0.3vw] object-contain absolute" />
                            )}
                        </div>

                        {/* TEXT CONTENT */}
                        <div className="flex flex-col gap-2">
                            {modalType === 'loading' && (
                                <>
                                    <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                        Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                                    </p>
                                </>
                            )}

                            {modalType === 'error' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[2vw] text-[#B56225]">{modalMessage.title}</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-[#B56225] px-4">{modalMessage.desc}</p>
                                </>
                            )}

                            {modalType === 'success' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[2vw] text-[#E87E2F]">{modalMessage.title}</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">Mengalihkan ke halaman daftar menu...</p>
                                </>
                            )}
                        </div>

                        {/* BUTTON ACTION */}
                        <div className="flex w-full gap-4 lg:gap-[1.5vw] mt-2 lg:mt-[1vw]">
                            {modalType === 'error' && (
                                <button
                                    onClick={closeModal}
                                    className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                                >
                                    Mengerti
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainMenuMbg;