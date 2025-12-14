'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';

// Import Assets
import bg from "../../../../assets/bg.png";
import loadingIcon from "../../../../assets/loading.png";
import alertIcon from "../../../../assets/alert.png";

// ... (Interfaces TETAP SAMA) ...
interface ReportListItem {
    id: string;
    no: number;
    tanggal: string;
    bulan: string;
    tahun: string;
    menu: string;
    status: string;
    school_name: string;
}

interface ReportDetailData {
    menu: string;
    catatan: string[];
    foto_report: string | null;
}

interface SchoolData {
    id: string;
    nama_sekolah: string;
}

interface CustomDropdownProps {
    label: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
}

const monthsList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DetailPelaporanSekolahSppg = () => {
    const router = useRouter();
    const params = useParams();
    const targetSchoolId = params?.id as string;

    // State Data
    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [schoolName, setSchoolName] = useState("Memuat Nama Sekolah...");
    const [loading, setLoading] = useState(true);

    // State Detail & Update
    const [selectedDetail, setSelectedDetail] = useState<ReportDetailData | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [itemToUpdate, setItemToUpdate] = useState<ReportListItem | null>(null);
    const [responseText, setResponseText] = useState("");

    // --- MODAL STATES ---
    const [isProcessing, setIsProcessing] = useState(false); // Modal Loading
    const [errorData, setErrorData] = useState<string | null>(null); // HANYA UNTUK ERROR

    // State Filter & Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = ["2025", "2026", "2027"];

    // Fetch Data (TETAP SAMA)
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const responseSchools = await fetchWithAuth('/sppg/schools', { method: 'GET' });
                let currentSchoolName = "Sekolah Tidak Ditemukan";

                if (responseSchools.ok) {
                    const resultSchools = await responseSchools.json();
                    const schoolsList: SchoolData[] = resultSchools.data || [];
                    const foundSchool = schoolsList.find(s => s.id === targetSchoolId);
                    if (foundSchool) currentSchoolName = foundSchool.nama_sekolah;
                }
                setSchoolName(currentSchoolName);

                const responseReports = await fetchWithAuth('/sppg/reports', { method: 'GET' });

                if (responseReports.ok) {
                    const resultReports = await responseReports.json();
                    const rawReports = resultReports.data || [];

                    const filteredBySchool = rawReports.filter((item: any) =>
                        item.school_name === currentSchoolName
                    );

                    const formattedData = filteredBySchool.map((item: any, index: number) => {
                        const dateObj = new Date(item.created_at);
                        return {
                            id: item.id,
                            no: index + 1,
                            tanggal: dateObj.getDate().toString(),
                            bulan: monthsList[dateObj.getMonth()],
                            tahun: dateObj.getFullYear().toString(),
                            menu: item.menu_name || "Menu Tidak Dikenal",
                            status: item.status || "processing",
                            school_name: item.school_name
                        };
                    });
                    setReports(formattedData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (targetSchoolId) fetchAllData();
    }, [targetSchoolId]);

    const handleViewDetail = async (id: string) => {
        setLoadingDetail(true);
        setSelectedDetail({ menu: "Memuat...", catatan: [], foto_report: null });

        try {
            const response = await fetchWithAuth(`/sppg/reports/${id}`, { method: 'GET' });

            if (response.ok) {
                const json = await response.json();
                const data = json.data;

                const catatanRaw = data.laporan?.catatan || "";
                const catatanList = catatanRaw.split(/\r?\n/).filter((line: string) => line.trim() !== '');

                setSelectedDetail({
                    menu: data.menu?.nama_menu || "Menu Tidak Dikenal",
                    catatan: catatanList.length > 0 ? catatanList : ["Tidak ada catatan."],
                    foto_report: data.laporan?.foto_menu || null
                });
            } else {
                alert("Gagal mengambil detail laporan.");
                setSelectedDetail(null);
            }
        } catch (error) {
            console.error("Error fetching detail:", error);
            setSelectedDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleStatusClick = (item: ReportListItem) => {
        if (item.status.toLowerCase() === 'completed' || item.status.toLowerCase() === 'selesai') {
            return;
        }
        setResponseText("");
        setItemToUpdate(item);
    };

    // --- LOGIKA BARU: LOADING -> SUKSES (TUTUP) / ERROR (MODAL) ---
    const handleConfirmUpdate = async () => {
        if (!itemToUpdate) return;

        if (!responseText.trim()) {
            alert("Mohon isi tanggapan terlebih dahulu.");
            return;
        }

        // 1. Tutup modal input & Buka Loading
        setItemToUpdate(null);
        setIsProcessing(true);
        setErrorData(null); // Reset error sebelumnya

        try {
            const response = await fetchWithAuth(`/sppg/reports/${itemToUpdate.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    sppg_response: responseText
                })
            });

            if (response.ok) {
                // SUKSES: Update data lokal & Tutup Loading langsung
                setReports(prev => prev.map(item =>
                    item.id === itemToUpdate.id ? { ...item, status: "completed" } : item
                ));
                // Tidak ada setSuccessData, langsung tutup
            } else {
                // ERROR: Ambil pesan error
                const errJson = await response.json();
                setErrorData(errJson.message || "Gagal mengirim tanggapan.");
            }
        } catch (error) {
            setErrorData("Terjadi kesalahan koneksi.");
        } finally {
            // Tutup loading
            setIsProcessing(false);
        }
    };

    // ... (Logic Filter & Pagination TETAP SAMA)
    const filteredData = reports.filter(item => {
        const matchDate = selectedDate === "Tanggal" || item.tanggal === selectedDate;
        const matchMonth = selectedMonth === "Bulan" || item.bulan === selectedMonth;
        const matchYear = selectedYear === "Tahun" || item.tahun === selectedYear;
        return matchDate && matchMonth && matchYear;
    });

    const isFilterActive = selectedDate !== "Tanggal" || selectedMonth !== "Bulan" || selectedYear !== "Tahun";

    const handleClearFilter = () => {
        setSelectedDate("Tanggal"); setSelectedMonth("Bulan"); setSelectedYear("Tahun");
        setCurrentPage(1); setOpenDropdown(null);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'completed' || s === 'selesai') return "bg-[#4CAF50] cursor-default";
        if (s === 'processing' || s === 'proses' || s === 'pending') return "bg-[#F2C94C] cursor-pointer hover:bg-[#e0b840]";
        return "bg-gray-400 cursor-pointer";
    };

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    return (
        <div className="flex-1 w-full min-h-screen p-4 lg:p-[3vw] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>

            {/* Header Title (TETAP SAMA) */}
            <div className="mb-6 lg:mb-[2vw]">
                {/* Tombol Back Mobile */}
                <button onClick={() => router.back()} className="lg:hidden mb-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <h1 className="satoshiBold text-2xl lg:text-[2.5vw] text-black">Pelaporan Sekolah</h1>
                <h2 className="satoshiMedium text-base lg:text-[1.5vw] text-gray-600 mt-1 lg:mt-0">
                    {loading ? (
                        <div className="h-6 w-48 lg:h-[2vw] lg:w-[25vw] bg-gray-200 rounded animate-pulse mt-1 lg:mt-[0.5vw]"></div>
                    ) : (
                        schoolName
                    )}
                </h2>
            </div>

            {/* Filter Dropdowns (TETAP SAMA) */}
            <div className="flex flex-col items-start relative z-20 w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-2 lg:gap-[1.5vw] mb-4 lg:mb-[2vw] items-center w-full">
                    <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                </div>
                {isFilterActive && (
                    <button
                        onClick={handleClearFilter}
                        className="bg-white cursor-pointer mb-4 lg:mb-[2vw] w-fit text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] py-2 px-4 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[1vw] flex items-center gap-2 lg:gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white transition-colors"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <span>Hapus Filter</span>
                    </button>
                )}
            </div>

            {/* Table Container (TETAP SAMA) */}
            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F] relative z-10 overflow-x-auto">
                <div className="min-w-[800px] w-full">
                    <div className="flex bg-[#E87E2F] text-white">
                        <div className="w-[10%] py-4 lg:py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-base lg:text-[1.5vw]">No</div>
                        <div className="w-[25%] py-4 lg:py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-base lg:text-[1.5vw]">Tanggal Lapor</div>
                        <div className="w-[30%] py-4 lg:py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-base lg:text-[1.5vw]">Menu</div>
                        <div className="w-[20%] py-4 lg:py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-base lg:text-[1.5vw]">Status</div>
                        <div className="w-[15%] py-4 lg:py-[1vw] flex justify-center items-center satoshiBold text-base lg:text-[1.5vw]">Detail</div>
                    </div>

                    <div className="flex flex-col bg-white">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="flex border-b border-[#E87E2F] lg:border-b-[0.15vw] bg-white animate-pulse">
                                    <div className="w-[10%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw]"><div className="w-4 h-4 lg:w-[1.5vw] lg:h-[1.5vw] bg-gray-200 rounded"></div></div>
                                    <div className="w-[25%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw]"><div className="w-24 h-4 lg:w-[10vw] lg:h-[1.2vw] bg-gray-200 rounded"></div></div>
                                    <div className="w-[30%] py-4 lg:py-[1.5vw] px-2 lg:px-[1vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw]"><div className="w-32 h-4 lg:w-[15vw] lg:h-[1.2vw] bg-gray-200 rounded"></div></div>
                                    <div className="w-[20%] px-4 lg:px-[2vw] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw]"><div className="w-full h-8 lg:h-[2vw] bg-gray-200 rounded-full lg:rounded-[1vw]"></div></div>
                                    <div className="w-[15%] py-4 lg:py-[1.5vw] flex justify-center items-center"><div className="w-12 h-4 lg:w-[5vw] lg:h-[1.2vw] bg-gray-200 rounded"></div></div>
                                </div>
                            ))
                        ) : currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <div key={item.id} className={`flex border-b border-[#E87E2F] lg:border-b-[0.15vw] last:border-b-0 transition-colors ${(indexOfFirstItem + index) % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'} hover:bg-orange-50 lg:hover:opacity-95`}>
                                    <div className="w-[10%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black">{indexOfFirstItem + index + 1}</div>
                                    <div className="w-[25%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black">{item.tanggal} {item.bulan} {item.tahun}</div>
                                    <div className="w-[30%] py-4 lg:py-[1.5vw] px-2 lg:px-[1vw] flex justify-center items-center text-center border-r border-[#E87E2F] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black">{item.menu}</div>
                                    <div className="w-[20%] px-2 lg:px-[2vw] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] lg:border-r-[0.15vw]">
                                        <button
                                            onClick={() => handleStatusClick(item)}
                                            className={`${getStatusColor(item.status)} text-white satoshiBold text-xs lg:text-[1vw] px-3 py-1 lg:px-[2vw] lg:py-[0.5vw] rounded-lg lg:rounded-[1vw] shadow-sm w-full text-center capitalize transition-colors`}
                                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                                            title={item.status === 'processing' ? "Klik untuk selesaikan" : "Sudah selesai"}
                                        >
                                            {item.status}
                                        </button>
                                    </div>
                                    <div className="w-[15%] py-4 lg:py-[1.5vw] flex justify-center items-center">
                                        <button onClick={() => handleViewDetail(item.id)} className="text-[#E87E2F] underline satoshiMedium text-sm lg:text-[1.2vw] hover:text-[#b06a33] cursor-pointer">Lihat Detail</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 lg:p-[2vw] text-center satoshiMedium text-sm lg:text-[1.2vw] text-gray-500">Data tidak ditemukan.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination & Back Button (TETAP SAMA) */}
            <div className="flex justify-between items-center mt-4 lg:mt-[2vw] mb-8 lg:mb-[3vw]">
                <div className="flex-1"></div>
                {totalPages > 0 && (
                    <div className="flex items-center gap-4 lg:gap-[1vw]">
                        <span className="text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw]">Halaman {currentPage} dari {totalPages}</span>
                        <div className="flex gap-2 lg:gap-[0.5vw]">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&lt;</button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&gt;</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pb-8 lg:pb-[2vw]">
                <button
                    onClick={() => router.back()}
                    className="bg-white border-2 border-[#E87E2F] text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white transition-colors satoshiBold text-sm lg:text-[1.2vw] px-6 py-2 lg:px-[2vw] lg:py-[0.8vw] rounded-xl lg:rounded-[1vw] shadow-md flex items-center gap-2 lg:gap-[0.5vw]"
                >
                    Kembali
                </button>
            </div>

            {/* MODAL DETAIL (TETAP SAMA) */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-[3vw]">
                    <div className="bg-[#E87E2F] w-full max-w-lg lg:w-[50vw] lg:max-w-none max-h-[90vh] overflow-y-auto rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] shadow-2xl relative flex flex-col gap-4 lg:gap-[1.5vw]">
                        {loadingDetail ? (
                            <div className="text-white text-center satoshiBold text-lg lg:text-[1.5vw]">Mengambil Data Detail...</div>
                        ) : (
                            <>
                                <h2 className="text-white satoshiBold text-xl lg:text-[2vw] text-center">{selectedDetail.menu}</h2>
                                {selectedDetail.foto_report && (
                                    <div className="w-full h-48 lg:h-[20vw] bg-white rounded-xl lg:rounded-[1vw] overflow-hidden mb-2 lg:mb-[1vw] flex items-center justify-center shadow-md">
                                        <img src={selectedDetail.foto_report} alt="Bukti Laporan" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-white satoshiMedium text-sm lg:text-[1.2vw]">Catatan & Komponen:</p>
                                <div className="bg-white rounded-xl lg:rounded-[1.5vw] p-4 lg:p-[2vw] min-h-[100px] lg:min-h-[10vw] shadow-inner">
                                    <ul className="list-none flex flex-col gap-2 lg:gap-[0.8vw]">
                                        {selectedDetail.catatan.map((line, idx) => (
                                            <li key={idx} className="text-[#8B4513] satoshiMedium text-sm lg:text-[1.2vw] leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        <button onClick={() => setSelectedDetail(null)} className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[2vw] text-white hover:text-gray-200 cursor-pointer p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL INPUT TANGGAPAN (TETAP SAMA) */}
            {itemToUpdate && !isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-[3vw]">
                    <div className="bg-white w-full max-w-md lg:w-[40vw] lg:max-w-none rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] shadow-2xl relative flex flex-col gap-4 lg:gap-[1.5vw] text-center">
                        <h2 className="text-[#D7762E] satoshiBold text-xl lg:text-[2.5vw]">Tanggapi Laporan</h2>
                        <p className="text-gray-500 satoshiMedium text-sm lg:text-[1.2vw] text-left">
                            Silakan masukkan tanggapan atau catatan untuk sekolah terkait menu ini sebelum menyelesaikan laporan.
                        </p>
                        <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Tulis tanggapan Anda di sini..."
                            className="w-full h-32 lg:h-[10vw] p-3 lg:p-[1vw] border-[0.15vw] border-[#E87E2F] rounded-xl lg:rounded-[1vw] text-black satoshiMedium text-sm lg:text-[1.2vw] focus:outline-none focus:ring-2 focus:ring-[#E87E2F] resize-none"
                        />
                        <div className="flex gap-4 lg:gap-[1vw] justify-end mt-2 lg:mt-[1vw]">
                            <button
                                onClick={() => { setItemToUpdate(null); setResponseText(""); }}
                                className="bg-white text-[#E87E2F] border-2 lg:border-[0.15vw] border-[#E87E2F] px-6 lg:px-[2vw] py-2 lg:py-[0.8vw] rounded-xl lg:rounded-[1.5vw] satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#FFF3EB] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmUpdate}
                                className="text-white bg-[#E87E2F] hover:bg-[#E87E2FCC] px-6 lg:px-[2vw] py-2 lg:py-[0.8vw] rounded-xl lg:rounded-[1.5vw] satoshiBold text-sm lg:text-[1.2vw] transition-all shadow-md"
                            >
                                Kirim & Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL LOADING (HANYA MUNCUL SAAT PROSES) --- */}
            {isProcessing && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                            <Image src={loadingIcon} alt="Loading" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                Mohon tunggu sebentar...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ERROR (HANYA MUNCUL JIKA GAGAL) --- */}
            {errorData && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                            <Image src={alertIcon} alt="Error" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-lg lg:text-[2vw] text-red-500">Gagal</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">{errorData}</p>
                        </div>

                        <div className="flex w-full gap-4 lg:gap-[1.5vw] mt-2 lg:mt-[1vw]">
                            <button
                                onClick={() => setErrorData(null)}
                                className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ... (Component Dropdown TETAP SAMA) ...
const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[30%] lg:w-[12vw]">
            <button onClick={onToggle} className="w-full bg-[#E87E2F] cursor-pointer text-white satoshiBold text-sm lg:text-[1.2vw] py-2 lg:py-[0.8vw] px-3 lg:px-[1.5vw] rounded-lg lg:rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]">
                <span className="truncate mr-1">{label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 lg:mt-[0.5vw] w-full bg-white rounded-lg lg:rounded-[0.5vw] shadow-lg max-h-48 lg:max-h-[15vw] overflow-y-auto border border-gray-200 z-30">
                    {options.map((opt, idx) => (
                        <div key={idx} onClick={() => onSelect(opt)} className="px-3 lg:px-[1.5vw] py-2 lg:py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-sm lg:text-[1vw] text-gray-700 border-b border-gray-100 last:border-0">{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DetailPelaporanSekolahSppg;