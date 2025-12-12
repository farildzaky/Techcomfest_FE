'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api'; 

interface UserData {
    id: string;
    email: string;
    role: string;
    status: string;
    profile_name: string;
    total_siswa: number;
}

const DaftarSekolahAdmin = () => {
    const [schools, setSchools] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filterStatus, setFilterStatus] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; 
    
    // --- STATE BARU UNTUK POSISI DROPDOWN ROW ---
    const [openRowId, setOpenRowId] = useState<string | null>(null); 
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null); // Ref untuk filter dropdown

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth("/admin/users", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("Gagal mengambil data sekolah");

                const responseData = await res.json();
                const allUsers: UserData[] = responseData.data;
                const schoolUsers = allUsers.filter(user => user.role === 'sekolah');
                setSchools(schoolUsers);
            } catch (err: any) {
                setError("Gagal memuat data. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, []);

    // Tutup dropdown saat scroll agar posisi tidak lari
    useEffect(() => {
        const handleScroll = () => {
            if (openRowId) setOpenRowId(null);
            if (isFilterOpen) setIsFilterOpen(false); // Tutup filter juga saat scroll
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [openRowId, isFilterOpen]);

    // Tutup dropdown saat klik luar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Tutup Dropdown Row
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenRowId(null);
            }
            // Tutup Filter Dropdown
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredSchools = schools.filter(s => 
        filterStatus === "All" || s.status.toLowerCase() === filterStatus.toLowerCase()
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSchools.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

    // --- HANDLER POSISI DROPDOWN ROW ---
    const handleToggleDropdown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        
        if (openRowId === id) {
            setOpenRowId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY, 
                left: rect.left + window.scrollX,  
                width: rect.width                  
            });
            setOpenRowId(id);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const originalSchools = [...schools];
        setSchools(prev => prev.map(s => s.id === id ? { ...s, status: newStatus.toLowerCase() } : s));
        setOpenRowId(null);

        try {
            const res = await fetchWithAuth(`/admin/users/${id}`, {
                method: "PATCH", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });
            if (!res.ok) throw new Error("Gagal update status");
        } catch (err) {
            alert("Gagal update status di server.");
            setSchools(originalSchools); 
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    if (error) return <div className="w-full h-screen flex justify-center items-center text-red-500 satoshiBold text-xl lg:text-[1.5vw]">{error}</div>;

    return (
        <div className="w-full min-h-screen p-4 lg:p-[3vw] font-sans relative" onClick={() => { setOpenRowId(null); setIsFilterOpen(false); }}>
            
            {/* Header & Filter */}
            <div className="flex justify-between items-center mb-6 lg:mb-[2vw]">
                <h1 className="satoshiBold text-2xl lg:text-[2.5vw] text-black">Sekolah</h1>
                
                {/* Wrapper Filter dengan Ref */}
                <div className="relative z-30" ref={filterRef} onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1vw] px-4 py-2 lg:px-[1.5vw] lg:py-[0.5vw] rounded-lg lg:rounded-[0.5vw] flex items-center gap-2 lg:gap-[0.5vw]"
                    >
                        Filter: {filterStatus}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 lg:w-[1vw] lg:h-[1vw] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    
                    {isFilterOpen && (
                        // PERUBAHAN DISINI: Lebar dibatasi 80% dari parent (jika parent kecil) atau w-max agar pas konten
                        <div className="absolute right-0 top-full mt-2 lg:mt-[0.5vw] bg-white shadow-lg rounded-lg lg:rounded-[0.5vw] min-w-[80%] w-max overflow-hidden z-20 border border-gray-100">
                            {["All", "Active", "Pending", "Inactive"].map((status) => (
                                <div 
                                    key={status}
                                    onClick={() => { setFilterStatus(status); setIsFilterOpen(false); setCurrentPage(1); }}
                                    className="px-4 py-2 lg:px-[1vw] lg:py-[0.5vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-sm lg:text-[0.9vw] text-gray-700 text-right"
                                >
                                    {status}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- TABEL CONTAINER --- */}
            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] border-2 lg:border-[0.2vw] border-[#E87E2F] overflow-hidden">
                <div className="w-full overflow-x-auto"> 
                    <div className="min-w-[900px] w-full">
                        
                        {/* Table Header */}
                        <div className="flex bg-[#E87E2F] text-white">
                            <div className="w-[10%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">No</div>
                            <div className="w-[30%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">Sekolah</div>
                            <div className="w-[25%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">Jumlah Siswa</div>
                            <div className="w-[20%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">Status</div>
                            <div className="w-[15%] py-4 lg:py-[1vw] flex justify-center items-center satoshiBold text-base lg:text-[1.5vw]">Detail</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col bg-white">
                            {loading ? (
                                Array.from({ length: 7 }).map((_, index) => (
                                    <div key={index} className="flex border-b border-[#E87E2F] lg:border-b-[0.15vw] animate-pulse">
                                        <div className="w-full h-12 bg-gray-200"></div>
                                    </div>
                                ))
                            ) : currentItems.length > 0 ? (
                                currentItems.map((item, index) => {
                                    const globalIndex = indexOfFirstItem + index + 1;
                                    const displayStatus = item.status.charAt(0).toUpperCase() + item.status.slice(1);
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex border-b border-[#E87E2F] lg:border-b-[0.15vw] transition-colors
                                                ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}
                                                ${index === currentItems.length - 1 ? 'last:border-b-0' : ''} 
                                            `}
                                        >
                                            <div className="w-[10%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                                {globalIndex}
                                            </div>
                                            <div className="w-[30%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black text-center px-2">
                                                {item.profile_name || item.email} 
                                            </div>
                                            <div className="w-[25%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black">
                                                {item.total_siswa || 0} Siswa 
                                            </div>
                                            
                                            {/* Kolom Status (Button Only) */}
                                            <div 
                                                className="w-[20%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] px-4 lg:px-[2vw]"
                                                onClick={(e) => handleToggleDropdown(e, item.id)}
                                            >
                                                <div className="w-full flex items-center justify-center relative cursor-pointer">
                                                    <span className={`satoshiBold text-sm lg:text-[1.2vw] text-[#E87E2F]`}>
                                                        {displayStatus}
                                                    </span>
                                                    <div className="absolute right-[-1vw] top-1/2 -translate-y-1/2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] text-[#E87E2F] transition-transform ${openRowId === item.id ? 'rotate-180' : ''}`}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="w-[15%] py-4 lg:py-[1.5vw] flex justify-center items-center">
                                                <Link href={`/admin/sekolah/${item.id}`} className="text-[#D9833E] underline satoshiMedium text-sm lg:text-[1.2vw] hover:text-[#b06a33]">
                                                    Lihat Detail
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-6 lg:p-[2vw] text-center satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 bg-white">
                                    Belum ada sekolah yang terdaftar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-end mt-4 lg:mt-[1.5vw] items-center gap-4 lg:gap-[1vw]">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}`}>&lt;</button>
                <p className="satoshiMedium text-[#E87E2F] text-sm lg:text-[1.2vw]">Halaman {currentPage} dari {totalPages || 1}</p>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}`}>&gt;</button>
            </div>

            {/* --- DROPDOWN FLOATING (DI LUAR TABEL) --- */}
            {openRowId && (
                <div 
                    ref={dropdownRef}
                    className="fixed bg-white border border-[#E87E2F] rounded-lg lg:rounded-[0.5vw] shadow-xl flex flex-col overflow-hidden z-[9999]"
                    style={{ 
                        top: dropdownPos.top - 5, 
                        left: dropdownPos.left + (dropdownPos.width * 0.1), // Geser sedikit agar tengah
                        width: dropdownPos.width * 0.8, // Set lebar 80% dari lebar kolom status
                        minWidth: '100px'
                    }}
                >
                    {["Active", "Pending", "Inactive"].map((statusOption) => (
                        <div 
                            key={statusOption}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(openRowId, statusOption);
                            }}
                            className="px-4 py-2 lg:px-[1vw] lg:py-[0.5vw] hover:bg-[#E87E2F] hover:text-white cursor-pointer satoshiMedium text-sm lg:text-[1vw] text-[#E87E2F] border-b border-orange-100 last:border-0 text-center transition-colors"
                        >
                            {statusOption}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default DaftarSekolahAdmin;