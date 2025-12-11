'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';

// --- Types ---
interface ScanHistoryItem {
    id: string;
    nama_makanan: string;
    scanned_at: string;
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
const RiwayatScanSkeleton = () => {
    return (
        <div className="w-full min-h-screen bg-[#E87E2F] p-4 md:p-8 lg:p-[3vw] flex flex-col font-sans relative animate-pulse">
            <div className="h-10 lg:h-[3vw] w-1/2 lg:w-[30%] bg-white/30 rounded mb-6 lg:mb-[2vw]"></div>

            <div className="flex flex-col gap-3 lg:gap-[1.5vw] mb-6 lg:mb-[2vw]">
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 bg-white/30 rounded"></div>
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 bg-white/30 rounded"></div>
                    <div className="h-10 lg:h-[3vw] w-full sm:w-32 bg-white/30 rounded"></div>
                </div>
            </div>

            <div className="w-full bg-white rounded-xl lg:rounded-[1.5vw] overflow-hidden">
                <div className="h-12 lg:h-[4vw] bg-gray-100"></div>
                <div className="flex flex-col gap-2 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 lg:h-[5vw] bg-gray-50 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RiwayatScan = () => {
    const router = useRouter();

    const [scans, setScans] = useState<ScanHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Dynamic Items Per Page Logic ---
    const [itemsPerPage, setItemsPerPage] = useState(10); 

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(5);
            } else {
                setItemsPerPage(10);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // --- Filter States ---
    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = ["2023", "2024", "2025", "2026"];

    const formatDate = (isoString: string) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getPartsFromDate = (isoString: string) => {
        const date = new Date(isoString);
        return {
            day: date.getDate().toString(),
            monthIndex: date.getMonth(), 
            year: date.getFullYear().toString()
        };
    };

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Catatan: Idealnya filtering dilakukan di backend via query params.
                // Namun jika API belum mendukung filter tanggal, kita filter di client side (seperti di bawah).
                // Di sini saya asumsikan fetch semua (atau pagination basic) lalu filter client-side untuk demo.
                // Jika ingin server-side filtering, tambahkan param date/month/year ke URL fetch.
                
                const response = await fetchWithAuth(`/school/food-scans?page=${currentPage}&limit=${itemsPerPage}`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error("Gagal mengambil riwayat scan");

                const result = await response.json();
                
                // Jika API sudah return filtered data, pakai langsung.
                // Jika filter client side:
                let fetchedData = result.data.scans || [];
                
                // --- CLIENT SIDE FILTERING LOGIC (Jika API belum support filter params) ---
                // Jika API support pagination + filter, logic ini sebaiknya di backend.
                // Untuk sekarang saya taruh di render logic agar konsisten dengan contoh sebelumnya.
                
                setScans(fetchedData);
                setTotalPages(result.data.pagination?.total_pages || 1);

            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentPage, itemsPerPage]); // Re-fetch on page change

    // --- Client-Side Filter Implementation on current page data (Demo) ---
    // Note: Untuk hasil akurat dengan pagination server-side, filter harus dikirim ke API.
    const filteredScans = scans.filter(item => {
        const { day, monthIndex, year } = getPartsFromDate(item.scanned_at);
        const monthName = monthsList[monthIndex];

        const matchDate = selectedDate === "Tanggal" || day === selectedDate;
        const matchMonth = selectedMonth === "Bulan" || monthName === selectedMonth;
        const matchYear = selectedYear === "Tahun" || year === selectedYear;

        return matchDate && matchMonth && matchYear;
    });

    const isFilterActive = selectedDate !== "Tanggal" || selectedMonth !== "Bulan" || selectedYear !== "Tahun";
    
    const handleClearFilter = () => {
        setSelectedDate("Tanggal"); setSelectedMonth("Bulan"); setSelectedYear("Tahun");
        setCurrentPage(1); setOpenDropdown(null);
    };

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    if (loading) return <RiwayatScanSkeleton />;

    return (
        <div className="w-full min-h-screen bg-[#E87E2F] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>
            
            {/* Main Padding */}
            <div className="p-4 md:p-8 lg:p-[3vw]">

                {/* --- HEADER --- */}
                <div className='w-full lg:w-fit bg-[#FFF3EB] rounded-r-full py-3 lg:py-[1.5vw] px-6 lg:px-[4vw] -ml-4 md:-ml-8 lg:-ml-[3vw] mb-6 lg:mb-[3vw] shadow-md'>
                    <h1 className='satoshiBold text-xl md:text-2xl lg:text-[2.5vw] text-[#E87E2F]'>
                        Riwayat Deteksi Makanan
                    </h1>
                </div>

                {/* --- FILTER SECTION --- */}
                <div className="flex flex-col items-start relative z-20 w-full mb-4 lg:mb-[2vw]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-row w-full gap-2 sm:gap-3 lg:gap-[1.5vw] mb-4 items-center">
                        <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    </div>

                    {isFilterActive && (
                        <button onClick={handleClearFilter} className="bg-white mb-2 w-fit text-[#E87E2F] satoshiMedium text-xs sm:text-sm lg:text-[1.2vw] py-2 px-4 lg:py-[0.8vw] lg:px-[1.5vw] rounded-lg lg:rounded-[1vw] flex items-center gap-2 lg:gap-[0.5vw] shadow-sm hover:bg-gray-50 transition-colors">
                            <span>Hapus Filter</span>
                        </button>
                    )}
                </div>

                {/* --- TABLE CONTAINER --- */}
                <div className='w-full bg-white rounded-xl lg:rounded-[1vw] overflow-hidden border-2 lg:border-[0.3vw] border-[#E87E2F] shadow-sm relative z-10'>
                    
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px] lg:min-w-full">
                            
                            {/* --- TABLE HEADER --- */}
                            <div className='flex w-full bg-[#FFF3EB] border-b-2 lg:border-b-[0.2vw] border-[#E87E2F]'>
                                <div className='w-[10%] py-3 lg:py-[1vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                                    <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>No</span>
                                </div>
                                <div className='w-[35%] py-3 lg:py-[1vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                                    <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Tanggal</span>
                                </div>
                                <div className='w-[35%] py-3 lg:py-[1vw] flex items-center justify-center border-r-2 lg:border-r-[0.2vw] border-[#E87E2F]'>
                                    <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Menu</span>
                                </div>
                                <div className='w-[20%] py-3 lg:py-[1vw] flex items-center justify-center'>
                                    <span className='satoshiBold text-sm lg:text-[1.5vw] text-[#E87E2F]'>Aksi</span>
                                </div>
                            </div>

                            {/* --- TABLE BODY --- */}
                            <div className='flex flex-col bg-white'>
                                {filteredScans.length === 0 ? (
                                    <div className='py-8 lg:py-[5vw] flex items-center justify-center'>
                                        <span className='text-gray-400 text-sm lg:text-[1.5vw] italic'>Data tidak ditemukan.</span>
                                    </div>
                                ) : (
                                    filteredScans.map((item, index) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                                        return (
                                            <div key={item.id} className='flex w-full border-b lg:border-b-[0.2vw] border-[#E87E2F] last:border-b-0 hover:bg-orange-50 transition-colors'>
                                                {/* No */}
                                                <div className='w-[10%] py-4 lg:py-[1.2vw] flex items-center justify-center border-r lg:border-r-[0.2vw] border-[#E87E2F]'>
                                                    <span className='satoshiMedium text-sm lg:text-[1.3vw] text-black'>{globalIndex}</span>
                                                </div>
                                                
                                                {/* Tanggal */}
                                                <div className='w-[35%] py-4 lg:py-[1.2vw] flex items-center justify-center border-r lg:border-r-[0.2vw] border-[#E87E2F] px-2'>
                                                    <span className='satoshiMedium text-sm lg:text-[1.3vw] text-black text-center leading-tight'>
                                                        {formatDate(item.scanned_at)}
                                                    </span>
                                                </div>
                                                
                                                {/* Menu */}
                                                <div className='w-[35%] py-4 lg:py-[1.2vw] flex items-center justify-center border-r lg:border-r-[0.2vw] border-[#E87E2F] px-2'>
                                                    <span className='satoshiBold text-sm lg:text-[1.3vw] text-[#8B5E3C] text-center w-full line-clamp-2 leading-tight'>
                                                        {item.nama_makanan || "Tanpa Nama"}
                                                    </span>
                                                </div>
                                                
                                                {/* Detail Button */}
                                                <div className='w-[20%] py-4 lg:py-[1.2vw] flex items-center justify-center'>
                                                    <Link
                                                        href={`/sekolah/riwayat-scan/${item.id}`}
                                                        className='text-[#E87E2F] underline hover:text-[#b06a33] satoshiMedium text-sm lg:text-[1.2vw] whitespace-nowrap cursor-pointer'
                                                    >
                                                        Detail
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PAGINATION & BACK BUTTON --- */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 lg:mt-[2vw] gap-4">
                    
                    {/* Back Button */}
                   

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center gap-4 lg:gap-[1vw]">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 lg:w-[2.5vw] lg:h-[2.5vw] flex items-center justify-center rounded-full text-lg font-bold ${currentPage === 1 ? 'bg-black/10 text-white/50 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-orange-50'}`}
                            >   
                                &lt;
                            </button>
                            <span className="text-white satoshiBold text-sm lg:text-[1.2vw]">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 lg:w-[2.5vw] lg:h-[2.5vw] flex items-center justify-center rounded-full text-lg font-bold ${currentPage === totalPages ? 'bg-black/10 text-white/50 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-orange-50'}`}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
                    
                     <button
                        onClick={() => router.push('/sekolah/scan-nutrisi')}
                        className='bg-[#FFF3EB] text-[#D7762E] satoshiBold flex text-center items-center justify-center ml-auto cursor-pointer text-sm lg:text-[1.2vw] py-3 lg:py-[0.8vw] px-6 lg:px-[2vw] rounded-full hover:bg-white transition-colors shadow-sm w-full sm:w-auto'
                    >
                        Kembali
                    </button>
            </div>
        </div>
    );
}

// --- Responsive Dropdown Component ---
const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[140px] md:w-[160px] lg:w-[12vw]">
            <button 
                onClick={onToggle} 
                className="w-full cursor-pointer bg-white text-[#E87E2F] satoshiBold text-xs sm:text-sm lg:text-[1.2vw] py-2 lg:py-[0.8vw] px-2 sm:px-4 lg:px-[1.5vw] rounded-lg lg:rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-gray-50 border border-transparent focus:border-orange-200" 
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

export default RiwayatScan;