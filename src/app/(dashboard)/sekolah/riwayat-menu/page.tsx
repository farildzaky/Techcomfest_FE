'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';

// --- Types ---
interface MenuData {
    id: string;
    tanggal: string; 
    nama_menu: string;
    komponen_menu: string[];
    risiko_umum_ringkas: string[];
    ringkasan_gizi: {
        kalori: string;
        protein: string;
        lemak: string;
        serat: string;
    };
    status_keamanan: string;
    nama_sppg: string;
}

interface CustomDropdownProps {
    label: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
}

const monthsList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// --- Skeleton Component (Responsive) ---
const RiwayatMenuSkeleton = () => {
    return (
        <div className="min-h-screen p-4 md:p-8 lg:p-[3vw] animate-pulse">
            {/* Title */}
            <div className="h-8 md:h-10 lg:h-[3vw] w-1/2 lg:w-[20%] bg-gray-300 rounded mb-6 lg:mb-[2vw]"></div>

            {/* Filters */}
            <div className="flex flex-col items-start mb-6 lg:mb-[2vw]">
                <div className="flex flex-wrap gap-3 lg:gap-[1.5vw] w-full sm:w-auto">
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 lg:w-[12vw] bg-gray-300 rounded"></div>
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 lg:w-[12vw] bg-gray-300 rounded"></div>
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 lg:w-[12vw] bg-gray-300 rounded"></div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F]">
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

const RiwayatMenuPage = () => {
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Dynamic Items Per Page Logic ---
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default

    useEffect(() => {
        const handleResize = () => {
            // Mobile (< 640px): 5 items, Lainnya: 10 items
            if (window.innerWidth < 640) {
                setItemsPerPage(5);
            } else {
                setItemsPerPage(10);
            }
        };

        handleResize(); // Set initial
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
        const fetchMenus = async () => {
            setLoading(true);
            try {
                const response = await fetchWithAuth('/school/menus', { method: 'GET' });
                
                if (response.ok) {
                    const result = await response.json();
                    setMenus(result.data || []);
                } else {
                    console.error("Gagal mengambil data menu");
                }
            } catch (error) {
                console.error("Error fetching menus:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, []);

    const filteredData = menus.filter(item => {
        const parts = item.tanggal.split(' '); 
        if (parts.length < 4) return true; 

        const day = parts[1];      
        const month = parts[2];    
        const year = parts[3];     

        const matchDate = selectedDate === "Tanggal" || day === selectedDate;
        const matchMonth = selectedMonth === "Bulan" || month === selectedMonth;
        const matchYear = selectedYear === "Tahun" || year === selectedYear;

        return matchDate && matchMonth && matchYear;
    });

    const isFilterActive = selectedDate !== "Tanggal" || selectedMonth !== "Bulan" || selectedYear !== "Tahun";
    
    const handleClearFilter = () => {
        setSelectedDate("Tanggal"); 
        setSelectedMonth("Bulan"); 
        setSelectedYear("Tahun");
        setCurrentPage(1); 
        setOpenDropdown(null);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    if (loading) return <RiwayatMenuSkeleton />;

    return (
        <div className="min-h-screen" onClick={() => setOpenDropdown(null)}>
            
            {/* Main Padding: Responsive px/rem for mobile, vw for desktop */}
            <div className="p-4 md:p-8 lg:p-[3vw]">

                {/* Title */}
                <h1 className="satoshiBold text-2xl md:text-3xl lg:text-[2.5vw] text-black mb-6 lg:mb-[2vw]">
                    Riwayat Menu
                </h1>

                {/* Filter Section */}
                <div className="flex flex-col items-start relative z-20" onClick={(e) => e.stopPropagation()}>
                    {/* Wraps on mobile */}
                    <div className="flex flex-wrap gap-3 lg:gap-[1.5vw] mb-4 lg:mb-[2vw] items-center w-full">
                        <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    </div>

                    {isFilterActive && (
                        <button onClick={handleClearFilter} className="bg-white mb-6 lg:mb-[2vw] w-fit text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] py-2 px-4 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[1vw] flex items-center gap-2 lg:gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white transition-colors"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                        >
                            <span>Hapus Filter</span>
                        </button>
                    )}
                </div>

                {/* Table Container - Horizontal Scroll Enabled */}
                <div className="w-full bg-white rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F] relative z-10 shadow-lg">
                    
                    <div className="overflow-x-auto">
                        {/* Min-width ensures table structure stays intact (700px min width) */}
                        <div className="min-w-[700px] lg:min-w-full">
                            
                            {/* Table Header */}
                            <div className="flex bg-[#E87E2F] text-white">
                                <div className="w-[10%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-sm md:text-base lg:text-[1.5vw]">No</div>
                                <div className="w-[35%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-sm md:text-base lg:text-[1.5vw]">Tanggal Diberikan</div>
                                <div className="w-[35%] py-3 lg:py-[1vw] flex justify-center items-center border-r border-white satoshiBold text-sm md:text-base lg:text-[1.5vw]">Menu</div>
                                <div className="w-[20%] py-3 lg:py-[1vw] flex justify-center items-center satoshiBold text-sm md:text-base lg:text-[1.5vw]">Detail</div>
                            </div>

                            {/* Table Body */}
                            <div className="flex flex-col bg-white">
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, index) => (
                                        <div key={item.id} className={`flex border-b border-[#E87E2F] last:border-b-0 ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'} hover:bg-orange-50 transition-colors`}>

                                            <div className="w-[10%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                                {indexOfFirstItem + index + 1}
                                            </div>

                                            <div className="w-[35%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                                {item.tanggal}
                                            </div>

                                            <div className="w-[35%] py-4 lg:py-[1.5vw] px-2 lg:px-[1vw] flex justify-center items-center text-center border-r border-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                                {item.nama_menu}
                                            </div>

                                            <div className="w-[20%] py-4 lg:py-[1.5vw] flex justify-center items-center">
                                                <Link
                                                    href={`/sekolah/menu-mbg/${item.id}`}
                                                    className="text-[#E87E2F] underline satoshiMedium text-sm lg:text-[1.2vw] hover:text-[#b06a33] cursor-pointer whitespace-nowrap"
                                                >
                                                    Lihat Detail
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 lg:p-[2vw] text-center satoshiBold text-sm lg:text-[1.5vw] text-gray-500">
                                        Belum ada riwayat menu.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex justify-end mt-4 lg:mt-[1vw] mb-6 lg:mb-[2vw]">
                        <div className="flex items-center gap-4 lg:gap-[1vw]">
                            <span className="text-[#E87E2F] satoshiMedium text-sm lg:text-[1.2vw]">Halaman {currentPage} dari {totalPages}</span>
                            <div className="flex gap-2 lg:gap-[0.5vw]">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}>&lt;</button>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}>&gt;</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// --- Responsive Dropdown ---
const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (

        <div className="relative relative w-[140px] md:w-[160px] lg:w-[12vw]">
            <button 
                onClick={onToggle} 
                className="w-full cursor-pointer bg-[#E87E2F] text-white satoshiBold text-xs sm:text-sm lg:text-[1.2vw] py-2 lg:py-[0.8vw] px-2 sm:px-4 lg:px-[1.5vw] rounded-lg lg:rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]" 
                style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
                <span className="truncate mr-1">{label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-[1.2vw] lg:h-[1.2vw] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 lg:mt-[0.5vw] w-full bg-white rounded-lg lg:rounded-[0.5vw] shadow-lg max-h-48 lg:max-h-[15vw] overflow-y-auto border border-gray-200 z-30">
                    {options.map((opt, idx) => (
                        <div key={idx} onClick={() => onSelect(opt)} className="px-3 lg:px-[1.5vw] py-2 lg:py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-xs sm:text-sm lg:text-[1vw] text-gray-700 border-b border-gray-100 last:border-0 truncate">
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiwayatMenuPage;