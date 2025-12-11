'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';

// --- Types ---
interface ReportListItem {
    id: string;
    no: number;
    tanggal: string;
    bulan: string;
    tahun: string;
    menu: string;
    status: string;
}

interface ReportDetail {
    menu: string;
    catatan: string[];
    foto_report: string | null;
}

interface CustomDropdownProps {
    label: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
}

const monthsList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// --- Skeleton Component ---
const MainPelaporanSekolahSkeleton = () => {
    return (
        <div className="w-full min-h-screen p-4 md:p-6 lg:p-[3vw] flex flex-col font-sans relative animate-pulse">
            <div className="h-8 md:h-10 lg:h-[3vw] w-1/2 lg:w-[30%] bg-gray-300 rounded mb-6 lg:mb-[2vw]"></div>

            <div className="flex gap-3 lg:gap-[1.5vw] mb-6 lg:mb-[2vw]">
                <div className="h-10 lg:h-[3vw] w-28 lg:w-[12vw] bg-gray-300 rounded"></div>
                <div className="h-10 lg:h-[3vw] w-28 lg:w-[12vw] bg-gray-300 rounded"></div>
                <div className="h-10 lg:h-[3vw] w-28 lg:w-[12vw] bg-gray-300 rounded"></div>
            </div>

            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F] relative z-10">
                <div className="h-12 lg:h-[4vw] bg-[#E87E2F]"></div>
                <div className="flex flex-col bg-white gap-2 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 lg:h-[5vw] bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MainPelaporanSekolah = () => {
    const router = useRouter();

    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ReportDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // --- Dynamic Items Per Page Logic ---
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default for desktop

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(5); // Mobile: 5 items
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(7); // Tablet: 7 items
            } else {
                setItemsPerPage(10); // Desktop: 10 items
            }
        };

        // Set initial value
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // ------------------------------------

    const [currentPage, setCurrentPage] = useState(1);
    
    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = ["2025", "2026", "2027"];

    useEffect(() => {
        const fetchReports = async () => {
            setLoadingList(true);
            try {
                const response = await fetchWithAuth('/school/reports', { method: 'GET' });

                if (response.ok) {
                    const result = await response.json();
                    const rawData = result.data || [];

                    const formattedData = rawData.map((item: any, index: number) => {
                        const dateObj = new Date(item.created_at);
                        return {
                            id: item.id,
                            no: index + 1,
                            tanggal: dateObj.getDate().toString(),
                            bulan: monthsList[dateObj.getMonth()],
                            tahun: dateObj.getFullYear().toString(),
                            menu: item.menu_name || "Menu Tidak Dikenal",
                            status: item.status || "processing"
                        };
                    });
                    setReports(formattedData);
                }
            } catch (error) {
                console.error("Error fetching list:", error);
            } finally {
                setLoadingList(false);
            }
        };
        fetchReports();
    }, []);

    const handleViewDetail = async (id: string) => {
        setLoadingDetail(true);
        setSelectedItem({ menu: "Memuat...", catatan: [], foto_report: null });

        try {
            const response = await fetchWithAuth(`/school/reports/${id}`, { method: 'GET' });
            if (response.ok) {
                const json = await response.json();
                const data = json.data;
                const detailData: ReportDetail = {
                    menu: data.menu?.nama_menu || "Menu Tidak Dikenal",
                    catatan: data.laporan?.catatan
                        ? data.laporan.catatan.split(/\r?\n/).filter((line: string) => line.trim() !== '')
                        : ["Tidak ada catatan."],
                    foto_report: data.laporan?.photo_url || null
                };
                setSelectedItem(detailData);
            } else {
                alert("Gagal mengambil detail laporan.");
                setSelectedItem(null);
            }
        } catch (error) {
            console.error("Error fetching detail:", error);
            setSelectedItem(null);
        } finally {
            setLoadingDetail(false);
        }
    };

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
        if (s === 'completed' || s === 'selesai') return "bg-[#4CAF50]";
        if (s === 'processing' || s === 'pending') return "bg-[#F2C94C]";
        return "bg-gray-400";
    };

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    if (loadingList) return <MainPelaporanSekolahSkeleton />;

    return (
        // Wrapper: Changed padding to px/rem on mobile/tablet, keeping vw on lg
        <div className="w-full min-h-screen p-4 md:p-8 lg:p-[3vw] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>

            <h1 className="satoshiBold text-2xl md:text-3xl lg:text-[2.5vw] text-black mb-6 lg:mb-[2vw]">Lacak Pelaporan</h1>

            {/* Filter Section: Stacked on mobile, row on desktop */}
            <div className="flex flex-wrap gap-3 lg:gap-[1.5vw] mb-6 lg:mb-[2vw] relative z-20 items-center" onClick={(e) => e.stopPropagation()}>
                <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                
                {isFilterActive && (
                    <button onClick={handleClearFilter} className="bg-white text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] py-2 px-4 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[1vw] flex items-center gap-2 lg:gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white transition-colors"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <span>Hapus Filter</span>
                    </button>
                )}
            </div>

            {/* Table Container: Enabled horizontal scroll (overflow-x-auto) so table stays wide */}
            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F] relative z-10 shadow-lg">
                
                <div className="overflow-x-auto">
                    {/* Minimum width set to 800px to ensure columns don't squish on mobile */}
                    <div className="min-w-[800px] lg:min-w-full">
                        
                        {/* Table Header */}
                        <div className="flex bg-[#E87E2F] text-white">
                            <div className="w-[10%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-base lg:text-[1.5vw]">No</div>
                            <div className="w-[25%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-base lg:text-[1.5vw]">Tanggal Lapor</div>
                            <div className="w-[30%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-base lg:text-[1.5vw]">Menu</div>
                            <div className="w-[20%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-base lg:text-[1.5vw]">Status</div>
                            <div className="w-[15%] py-3 lg:py-[1vw] flex justify-center items-center satoshiBold text-base lg:text-[1.5vw]">Detail</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col bg-white">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <div key={item.id} className={`flex border-b border-[#E87E2F] last:border-b-0 transition-colors ${(indexOfFirstItem + index) % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}`}>
                                        <div className="w-[10%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                            {indexOfFirstItem + index + 1}
                                        </div>
                                        <div className="w-[25%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                            {item.tanggal} {item.bulan} {item.tahun}
                                        </div>
                                        <div className="w-[30%] py-4 lg:py-[1.5vw] px-2 lg:px-[1vw] flex justify-center items-center text-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                            {item.menu}
                                        </div>
                                        <div className="w-[20%] px-4 lg:px-[2vw] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F]">
                                            <span className={`${getStatusColor(item.status)} text-white satoshiBold text-xs lg:text-[1vw] px-4 lg:px-[2vw] py-1.5 lg:py-[0.5vw] rounded-full lg:rounded-[1vw] shadow-sm w-full text-center capitalize`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="w-[15%] py-4 lg:py-[1.5vw] flex justify-center items-center">
                                            <button
                                                onClick={() => handleViewDetail(item.id)}
                                                className="text-[#D98848] underline satoshiMedium text-sm lg:text-[1.2vw] hover:text-[#b06a33] cursor-pointer whitespace-nowrap"
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 lg:p-[4vw] text-center satoshiMedium text-base lg:text-[1.2vw] text-gray-500">Data tidak ditemukan.</div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex justify-end mt-4 lg:mt-[1vw] mb-6 lg:mb-[2vw]">
                    <div className="flex items-center gap-2 lg:gap-[1vw]">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`cursor-pointer w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}>&lt;</button>
                        <span className="text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw]">Halaman {currentPage} dari {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`cursor-pointer w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}>&gt;</button>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="mt-2 lg:mt-[2vw]">
                <button onClick={() => router.push('/sekolah/pelaporan/form-pelaporan')} className="w-full bg-[#E87E2F] text-white satoshiBold text-lg md:text-xl lg:text-[1.8vw] py-3 lg:py-[1.2vw] rounded-xl lg:rounded-[1.5vw] shadow-md hover:bg-[#b06a33] transition-transform active:scale-[0.99]">
                    Laporkan Menu ke Sppg
                </button>
            </div>

            {/* Modal Detail */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:p-[3vw]" onClick={() => setSelectedItem(null)}>
                    <div className="bg-[#E87E2F] w-full max-w-lg lg:max-w-[50vw] max-h-[90vh] overflow-y-auto rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] shadow-2xl relative flex flex-col gap-4 lg:gap-[1.5vw]" onClick={(e) => e.stopPropagation()}>
                        {loadingDetail ? (
                            <div className="text-white text-center satoshiBold text-lg lg:text-[1.5vw]">Mengambil Data Detail...</div>
                        ) : (
                            <>
                                <h2 className="text-white satoshiBold text-xl lg:text-[2vw] text-center">{selectedItem.menu}</h2>
                                {selectedItem.foto_report && (
                                    <div className="w-full h-48 md:h-64 lg:h-[20vw] bg-white rounded-lg lg:rounded-[1vw] overflow-hidden mb-2 lg:mb-[1vw] flex items-center justify-center">
                                        <img src={selectedItem.foto_report} alt="Bukti Laporan" className="w-full h-full object-contain bg-gray-100" />
                                    </div>
                                )}
                                <p className="text-white satoshiMedium text-base lg:text-[1.2vw]">Catatan & Komponen:</p>
                                <div className="bg-white rounded-xl lg:rounded-[1.5vw] p-4 lg:p-[2vw] min-h-[100px] lg:min-h-[10vw]">
                                    <ul className="list-none flex flex-col gap-2 lg:gap-[0.8vw]">
                                        {selectedItem.catatan.map((line, idx) => (
                                            <li key={idx} className="text-[#8B4513] satoshiMedium text-sm md:text-base lg:text-[1.2vw] leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[2vw] text-white hover:text-gray-200 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2.5vw] lg:h-[2.5vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Responsive Dropdown ---
const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[140px] md:w-[160px] lg:w-[12vw]">
            <button onClick={onToggle} className="cursor-pointer w-full bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] py-2 lg:py-[0.8vw] px-3 lg:px-[1.5vw] rounded-lg lg:rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]">
                <span className="truncate">{label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] flex-shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 lg:mt-[0.5vw] w-full bg-white rounded-lg lg:rounded-[0.5vw] shadow-lg max-h-48 lg:max-h-[15vw] overflow-y-auto border border-gray-200 z-30">
                    {options.map((opt, idx) => (
                        <div key={idx} onClick={() => onSelect(opt)} className="px-3 lg:px-[1.5vw] py-2 lg:py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-sm lg:text-[1vw] text-gray-700 border-b border-gray-100 last:border-0">{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MainPelaporanSekolah;