'use client';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link"; 
import { fetchWithAuth } from '@/src/lib/api'; 

interface ReportData {
    id: string;
    menu_name: string;
    school_name: string;
    status: string;
    created_at: string;
}

interface ReportDetailData {
    menu: string;
    catatan: string[]; 
    foto_report: string | null;
}

const monthsList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const CustomDropdown = ({ 
    label, 
    options, 
    isOpen, 
    onToggle, 
    onSelect 
}: { 
    label: string | number;
    options: (string | number)[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string | number) => void;
}) => {
    return (
        <div className="relative w-full">
            <button 
                type="button"
                onClick={onToggle} 
                // RESPONSIF: py-2 px-3 text-sm (Mobile) -> py-[0.8vw] text-[1.2vw] (Desktop)
                className={`w-full text-white satoshiBold text-sm lg:text-[1.2vw] py-2 px-3 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[0.5vw] flex justify-between items-center shadow-sm transition-all cursor-pointer border border-transparent
                ${isOpen ? 'bg-[#b06a33]' : 'bg-[#E87E2F] hover:bg-[#d6732a]'}`}
                style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
                <span className="truncate mr-2 lg:mr-[0.5vw]">{label}</span>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={3} 
                    stroke="currentColor" 
                    // RESPONSIF: Ukuran Icon
                    className={`w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] min-w-4 lg:min-w-[1.2vw] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                // RESPONSIF: max-h-60 (Mobile) -> max-h-[15vw] (Desktop)
                <div className="absolute top-[110%] lg:top-[120%] left-0 w-full bg-white rounded-lg lg:rounded-[0.5vw] shadow-xl max-h-60 lg:max-h-[15vw] overflow-y-auto border border-orange-200 z-[100] animate-in fade-in zoom-in-95 duration-100 custom-scrollbar">
                    {options.map((opt, idx) => (
                        <div 
                            key={idx} 
                            onMouseDown={() => onSelect(opt)} 
                            className="px-4 py-2 lg:px-[1.5vw] lg:py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-sm lg:text-[1vw] text-gray-700 border-b border-gray-100 last:border-0 hover:text-[#E87E2F] transition-colors"
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DataLaporanSppg = () => {
    const [allReports, setAllReports] = useState<ReportData[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; 

    const [selectedDate, setSelectedDate] = useState<string | number>("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState<string | number>("Bulan");
    const [selectedYear, setSelectedYear] = useState<string | number>("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [selectedDetail, setSelectedDetail] = useState<ReportDetailData | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const filterContainerRef = useRef<HTMLDivElement>(null);

    const dates = Array.from({ length: 31 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);

    const isFilterActive = selectedDate !== "Tanggal" || selectedMonth !== "Bulan" || selectedYear !== "Tahun";

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                status: 'completed',
                limit: '1000' 
            });

            const response = await fetchWithAuth(`/sppg/reports?${queryParams.toString()}`, {
                method: 'GET'
            });

            if (!response.ok) throw new Error("Gagal mengambil data");

            const result = await response.json();
            const data = result.data?.data || result.data || [];
            setAllReports(data);

        } catch (err: any) {
            console.error(err);
            setError("Gagal memuat data laporan.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredReports = useMemo(() => {
        return allReports.filter(item => {
            const dateObj = new Date(item.created_at);
            const day = dateObj.getDate();
            const monthIndex = dateObj.getMonth();
            const year = dateObj.getFullYear();

            if (selectedDate !== "Tanggal" && day !== Number(selectedDate)) return false;

            if (selectedMonth !== "Bulan") {
                const selectedMonthIndex = monthsList.indexOf(selectedMonth as string);
                if (monthIndex !== selectedMonthIndex) return false;
            }

            if (selectedYear !== "Tahun" && year !== Number(selectedYear)) return false;

            return true;
        });
    }, [allReports, selectedDate, selectedMonth, selectedYear]);

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReports.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReports, currentPage]);

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

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            }).format(new Date(dateString));
        } catch { return dateString; }
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterContainerRef.current && filterContainerRef.current.contains(event.target as Node)) {
                return;
            }
            setOpenDropdown(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClearFilter = () => {
        setSelectedDate("Tanggal");
        setSelectedMonth("Bulan");
        setSelectedYear("Tahun");
        setCurrentPage(1);
        setOpenDropdown(null);
    };

    const handleSetFilter = (setter: any, val: any) => {
        setter(val);
        setCurrentPage(1);
        setOpenDropdown(null);
    }

    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    return (
        // Container Utama: p-6 (mobile) -> p-[3vw] (desktop)
        <div className="w-full min-h-screen py-6 px-4 lg:py-[2vw] lg:px-[3vw] flex flex-col font-sans relative"> 
            
            <div className="mb-6 lg:mb-[2vw]">
                {/* Title Responsif */}
                <h1 className='satoshiBold text-2xl lg:text-[3vw] text-white'>Rekap Pelaporan</h1>
                <p className="text-white text-sm lg:text-[1.2vw] opacity-80 satoshiMedium mt-2 lg:mt-[0.5vw]">
                   Data Riwayat penerimaan pelaporan yang telah selesai dilakukan.
                </p>
            </div>

            <div ref={filterContainerRef} className="flex flex-col items-start relative z-0 mb-6 lg:mb-[2vw]">
                {/* Filter Wraps on Mobile */}
                <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-[1.5vw] mb-4 lg:mb-[1.5vw] items-center w-full">
                    <div className="w-[30%] lg:w-full">
                        <CustomDropdown 
                            label={selectedDate} 
                            options={dates} 
                            isOpen={openDropdown === 'date'} 
                            onToggle={() => toggleDropdown('date')} 
                            onSelect={(val) => handleSetFilter(setSelectedDate, val)} 
                        />
                    </div>
                    <div className="w-[30%] lg:w-full">
                        <CustomDropdown 
                            label={selectedMonth} 
                            options={monthsList} 
                            isOpen={openDropdown === 'month'} 
                            onToggle={() => toggleDropdown('month')} 
                            onSelect={(val) => handleSetFilter(setSelectedMonth, val)} 
                        />
                    </div>
                    <div className="w-[30%] lg:w-full">
                        <CustomDropdown 
                            label={selectedYear} 
                            options={years} 
                            isOpen={openDropdown === 'year'} 
                            onToggle={() => toggleDropdown('year')} 
                            onSelect={(val) => handleSetFilter(setSelectedYear, val)} 
                        />
                    </div>
                </div>
                
                {isFilterActive && (
                    <button 
                        onClick={handleClearFilter} 
                        // Button Hapus Filter Responsif
                        className="bg-white w-fit text-[#E87E2F] cursor-pointer satoshiMedium text-sm lg:text-[1.2vw] py-2 px-4 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[1vw] flex items-center gap-2 lg:gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white transition-all"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <span>Hapus Filter</span>
                    </button>
                )}
            </div>

            {/* Table Container Responsif */}
            <div className='w-full bg-white rounded-xl lg:rounded-[1vw] overflow-hidden border-2 lg:border-[0.3vw] border-[#E87E2F] shadow-lg relative z-30 overflow-x-auto'>
                {/* Min-width digunakan agar tabel tidak hancur di HP, user scroll ke samping */}
                <div className="min-w-[600px] w-full">
                    <div className='flex w-full bg-[#FFF3EB] border-b-2 lg:border-b-[0.2vw] border-[#E87E2F]'>
                        <div className='w-[10%] py-3 lg:py-[1.2vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                            <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>No</span>
                        </div>
                        <div className='w-[35%] py-3 lg:py-[1.2vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                            <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Tanggal Lapor</span>
                        </div>
                        <div className='w-[35%] py-3 lg:py-[1.2vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                            <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Menu</span>
                        </div>
                        <div className='w-[20%] py-3 lg:py-[1.2vw] flex items-center justify-center'>
                            <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Detail</span>
                        </div>
                    </div>

                    <div className='flex flex-col bg-white '>
                        {loading ? (
                            <div className="w-full bg-white animate-pulse">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex w-full border-b lg:border-b-[0.2vw] border-[#E87E2F] last:border-b-0">
                                        <div className="w-[10%] py-4 lg:py-[2vw] border-r lg:border-r-[0.2vw] border-[#E87E2F] flex justify-center items-center">
                                            <div className="w-4 h-4 lg:w-[2vw] lg:h-[1.5vw] bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-[35%] py-4 lg:py-[2vw] border-r lg:border-r-[0.2vw] border-[#E87E2F] px-4 lg:px-[1vw] flex justify-center items-center">
                                            <div className="w-24 h-4 lg:w-[10vw] lg:h-[1.5vw] bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-[35%] py-4 lg:py-[2vw] border-r lg:border-r-[0.2vw] border-[#E87E2F] px-4 lg:px-[1vw] flex justify-center items-center">
                                            <div className="w-32 h-4 lg:w-[15vw] lg:h-[1.5vw] bg-gray-200 rounded"></div>
                                        </div>
                                        <div className="w-[20%] py-4 lg:py-[2vw] px-4 lg:px-[1vw] flex justify-center items-center">
                                            <div className="w-12 h-4 lg:w-[5vw] lg:h-[1.5vw] bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-8 lg:py-[4vw] text-center text-[#E87E2F] satoshiBold text-base lg:text-[1.5vw]">{error}</div>
                        ) : filteredReports.length === 0 ? (
                            <div className='flex-1 flex flex-col items-center justify-center text-center py-10 lg:py-[5vw] gap-4 lg:gap-[1vw]'>
                                <span className='text-4xl lg:text-[3vw]'>📄</span>
                                <span className='text-gray-400 satoshiBold text-base lg:text-[1.5vw]'>
                                    {isFilterActive 
                                        ? "Tidak ada laporan ditemukan dengan filter ini."
                                        : "Belum ada laporan selesai."
                                    }
                                </span>
                            </div>
                        ) : (
                            paginatedReports.map((item, index) => {
                                const displayIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                
                                return (
                                    <div key={item.id} className='flex w-full border-b lg:border-b-[0.2vw] border-[#E87E2F] last:border-b-0 hover:bg-orange-50 transition-colors'>
                                        <div className='w-[10%] py-3 lg:py-[1.2vw] flex items-center justify-center border-r lg:border-r-[0.2vw] border-[#E87E2F]'>
                                            <span className='satoshiMedium text-sm lg:text-[1.3vw] text-black'>{displayIndex}</span>
                                        </div>
                                        <div className='w-[35%] py-3 lg:py-[1.2vw] flex items-center justify-center border-r lg:border-r-[0.2vw] border-[#E87E2F]'>
                                            <span className='satoshiMedium text-sm lg:text-[1.3vw] text-black text-center'>{formatDate(item.created_at)}</span>
                                        </div>
                                        <div className='w-[35%] py-3 lg:py-[1.2vw] flex items-center px-4 lg:px-[2vw] border-r lg:border-r-[0.2vw] border-[#E87E2F]'>
                                            <span className='satoshiBold text-sm lg:text-[1.3vw] text-[#8B5E3C] w-full truncate text-center'>{item.menu_name}</span>
                                        </div>
                                        <div className='w-[20%] py-3 lg:py-[1.2vw] flex items-center justify-center'>
                                            <button 
                                                onClick={() => handleViewDetail(item.id)} 
                                                className='text-[#E87E2F] underline decoration-2 underline-offset-4 hover:text-[#b06a33] satoshiBold text-sm lg:text-[1.2vw] whitespace-nowrap cursor-pointer'
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {!loading && !error && filteredReports.length > 0 && (
                <div className="flex justify-center items-center gap-4 lg:gap-[2vw] mt-6 lg:mt-[2vw]">
                    <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 lg:px-[2vw] lg:py-[0.6vw] rounded-full text-sm lg:text-[1.2vw] satoshiBold ${currentPage === 1 ? 'bg-black/20 text-white/50 cursor-not-allowed' : 'bg-[#FFF3EB] text-[#E87E2F] hover:scale-105 shadow-md'}`}>Sebelumnya</button>
                    <span className="text-white satoshiBold text-sm lg:text-[1.2vw] drop-shadow-md">Halaman {currentPage} dari {totalPages}</span>
                    <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 lg:px-[2vw] lg:py-[0.6vw] rounded-full text-sm lg:text-[1.2vw] satoshiBold ${currentPage === totalPages ? 'bg-black/20 text-white/50 cursor-not-allowed' : 'bg-[#FFF3EB] text-[#E87E2F] hover:scale-105 shadow-md'}`}>Selanjutnya</button>
                </div>
            )}

            {/* Modal Detail Responsif */}
            {selectedDetail && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-[3vw]">
                    <div className="bg-[#E87E2F] w-full max-w-lg lg:max-w-none lg:w-[50vw] max-h-[90vh] overflow-y-auto rounded-xl lg:rounded-[2vw] p-6 lg:p-[3vw] shadow-2xl relative flex flex-col gap-4 lg:gap-[1.5vw] animate-in fade-in zoom-in-95 duration-200">
                        {loadingDetail ? (
                            <div className="text-white text-center satoshiBold text-lg lg:text-[1.5vw]">Mengambil Data Detail...</div>
                        ) : (
                            <>
                                <h2 className="text-white satoshiBold text-xl lg:text-[2vw] text-center">{selectedDetail.menu}</h2>
                                {selectedDetail.foto_report && (
                                    <div className="w-full h-48 lg:h-[20vw] bg-white rounded-lg lg:rounded-[1vw] overflow-hidden mb-2 lg:mb-[1vw] flex items-center justify-center">
                                        <img src={selectedDetail.foto_report} alt="Bukti Laporan" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-white satoshiMedium text-sm lg:text-[1.2vw]">Catatan & Komponen:</p>
                                <div className="bg-white rounded-lg lg:rounded-[1.5vw] p-4 lg:p-[2vw] min-h-[8rem] lg:min-h-[10vw]">
                                    <ul className="list-none flex flex-col gap-2 lg:gap-[0.8vw]">
                                        {selectedDetail.catatan.map((line, idx) => (
                                            <li key={idx} className="text-[#8B4513] satoshiMedium text-sm lg:text-[1.2vw] leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        <button 
                            onClick={() => setSelectedDetail(null)} 
                            className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[2vw] text-white hover:text-gray-200 cursor-pointer transition-transform hover:scale-110"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataLaporanSppg;