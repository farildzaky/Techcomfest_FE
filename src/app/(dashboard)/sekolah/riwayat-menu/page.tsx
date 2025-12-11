'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';

// --- INTERFACES ---
interface MenuData {
    id: string;
    tanggal: string; // Format: "Jumat, 16 Januari 2026"
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

const RiwayatMenuPage = () => {
    // --- STATE ---
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [loading, setLoading] = useState(true);

    // --- STATE FILTER & PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = ["2025", "2026", "2027"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchMenus = async () => {
            setLoading(true);
            try {
                // Endpoint GET /school/menus
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

    // --- LOGIKA FILTER ---
    // Format tanggal dari API: "Jumat, 16 Januari 2026"
    // Kita perlu parsing string ini untuk dicocokkan dengan filter dropdown
    const filteredData = menus.filter(item => {
        const parts = item.tanggal.split(' '); // ["Jumat,", "16", "Januari", "2026"]
        
        if (parts.length < 4) return true; // Safety check

        const day = parts[1];      // "16"
        const month = parts[2];    // "Januari"
        const year = parts[3];     // "2026"

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

    // --- PAGINATION ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    return (
        <div className="min-h-screen" onClick={() => setOpenDropdown(null)}>
            <div className="p-[3vw]">

                <h1 className="satoshiBold text-[2.5vw] text-black mb-[2vw]">Riwayat Menu</h1>

                {/* --- FILTER SECTION --- */}
                <div className="flex flex-col items-start relative z-20" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-[1.5vw] mb-[2vw] items-center">
                        <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                        <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    </div>

                    {isFilterActive && (
                         <button onClick={handleClearFilter} className="bg-white mb-[2vw] w-fit text-[#E87E2F] satoshiMedium text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[1vw] flex items-center gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <span>Hapus Filter</span>
                    </button>
                    )}
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="w-full bg-white rounded-[1.5vw] overflow-hidden border-[0.2vw] border-[#E87E2F] relative z-10">

                    <div className="flex bg-[#E87E2F] text-white">
                        <div className="w-[10%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">No</div>
                        <div className="w-[35%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Tanggal Diberikan</div>
                        <div className="w-[35%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Menu</div>
                        <div className="w-[20%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">Detail</div>
                    </div>

                    <div className="flex flex-col bg-white">
                        {loading ? (
                            <div className="flex items-center justify-center p-[4vw]">
                                <p className="satoshiBold text-[1.5vw] text-[#E87E2F]">Memuat data...</p>
                            </div>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <div key={item.id} className={`flex border-b-[0.15vw] border-[#E87E2F] last:border-b-0 ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'} hover:opacity-95`}>

                                    <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {indexOfFirstItem + index + 1}
                                    </div>

                                    <div className="w-[35%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {item.tanggal}
                                    </div>

                                    <div className="w-[35%] py-[1.5vw] px-[1vw] flex justify-center items-center text-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {item.nama_menu}
                                    </div>

                                    <div className="w-[20%] py-[1.5vw] flex justify-center items-center">
                                        <Link
                                            href={`/sekolah/menu-mbg/${item.id}`}
                                            className="text-[#E87E2F] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33] cursor-pointer"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-[4vw] text-center satoshiMedium text-[1.2vw] text-gray-500">
                                Belum ada riwayat menu.
                            </div>
                        )}
                    </div>
                </div>

                {/* --- PAGINATION --- */}
                {totalPages > 0 && (
                    <div className="flex justify-end mt-[1vw] mb-[2vw]">
                        <div className="flex items-center gap-[1vw]">
                            <span className="text-[#E87E2F] satoshiMedium text-[1.2vw]">Halaman {currentPage} dari {totalPages}</span>
                            <div className="flex gap-[0.5vw]">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&lt;</button>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&gt;</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// --- DROPDOWN COMPONENT ---
const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[12vw]">
            <button onClick={onToggle} className="w-full cursor-pointer bg-[#E87E2F] text-white satoshiBold text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]" style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                {label}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-[1.2vw] h-[1.2vw] transition-transform ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-[0.5vw] w-full bg-white rounded-[0.5vw] shadow-lg max-h-[15vw] overflow-y-auto border border-gray-200 z-30">
                    {options.map((opt, idx) => (
                        <div key={idx} onClick={() => onSelect(opt)} className="px-[1.5vw] py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-[1vw] text-gray-700 border-b border-gray-100 last:border-0">{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiwayatMenuPage;