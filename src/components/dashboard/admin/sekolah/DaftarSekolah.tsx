'use client'
import React, { useState, useEffect } from 'react';
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
    const [openRowId, setOpenRowId] = useState<string | null>(null); 

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth("https://api.inkluzi.my.id/api/v1/admin/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
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

    const filteredSchools = schools.filter(s => 
        filterStatus === "All" || s.status.toLowerCase() === filterStatus.toLowerCase()
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSchools.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

    const handleStatusChange = async (id: string, newStatus: string) => {
        const originalSchools = [...schools];
        setSchools(prev => prev.map(s => s.id === id ? { ...s, status: newStatus.toLowerCase() } : s));
        setOpenRowId(null);

        try {
            const res = await fetchWithAuth(`https://api.inkluzi.my.id/api/v1/admin/users/${id}`, {
                method: "PATCH", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });

            if (!res.ok) throw new Error("Gagal update status");

        } catch (err) {
            alert("Gagal update status di server.");
            setSchools(originalSchools); 
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (error) return <div className="w-full h-screen flex justify-center items-center text-red-500 satoshiBold text-[1.5vw]">{error}</div>;

    return (
        <div className="w-full min-h-screen p-[3vw] font-sans relative" onClick={() => { setOpenRowId(null); setIsFilterOpen(false); }}>
            
            <div className="flex justify-between items-center mb-[2vw]">
                <h1 className="satoshiBold text-[2.5vw] text-black">Sekolah</h1>
                
                <div className="relative z-30" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="bg-[#E87E2F] text-white satoshiBold text-[1vw] px-[1.5vw] py-[0.5vw] rounded-[0.5vw] flex items-center gap-[0.5vw]"
                    >
                        Filter: {filterStatus}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-[1vw] h-[1vw] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    
                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-[0.5vw] bg-white shadow-lg rounded-[0.5vw] w-[10vw] overflow-hidden z-20 border border-gray-100">
                            {["All", "Active", "Pending", "Inactive"].map((status) => (
                                <div 
                                    key={status}
                                    onClick={() => { setFilterStatus(status); setIsFilterOpen(false); setCurrentPage(1); }}
                                    className="px-[1vw] py-[0.5vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-[0.9vw] text-gray-700"
                                >
                                    {status}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full bg-[#E87E2F] rounded-[1.5vw] border-[0.2vw] border-[#E87E2F]">
                
                <div className="flex bg-[#E87E2F] text-white rounded-t-[1.3vw]">
                    <div className="w-[10%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">No</div>
                    <div className="w-[30%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Sekolah</div>
                    <div className="w-[25%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Jumlah Siswa</div>
                    <div className="w-[20%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Status</div>
                    <div className="w-[15%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">Detail</div>
                </div>

                <div className="flex flex-col bg-white rounded-b-[1.3vw]">
                    {loading ? (
                        Array.from({ length: 7 }).map((_, index) => (
                            <div key={index} className="flex border-b-[0.15vw] border-[#E87E2F] animate-pulse">
                                <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E]">
                                    <div className="h-[1.5vw] w-[2vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[30%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E]">
                                    <div className="h-[1.5vw] w-[12vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E]">
                                    <div className="h-[1.5vw] w-[8vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[20%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E]">
                                    <div className="h-[1.5vw] w-[5vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                    <div className="h-[1.5vw] w-[6vw] bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        currentItems.map((item, index) => {
                            const globalIndex = indexOfFirstItem + index + 1;
                            const displayStatus = item.status.charAt(0).toUpperCase() + item.status.slice(1);

                            return (
                                <div 
                                    key={item.id} 
                                    className={`flex border-b-[0.15vw] border-[#E87E2F] transition-colors relative z-10 
                                        ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}
                                        ${index === currentItems.length - 1 ? 'last:border-b-0 rounded-b-[1.3vw]' : ''} 
                                    `}
                                    style={{ zIndex: openRowId === item.id ? 50 : 10 }}
                                >
                                    
                                    <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] satoshiMedium text-[1.2vw] text-black">
                                        {globalIndex}
                                    </div>
                                    
                                    <div className="w-[30%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] satoshiMedium text-[1.2vw] text-black">
                                        {item.profile_name || item.email} 
                                    </div>
                                    
                                    <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] satoshiMedium text-[1.2vw] text-black">
                                        {item.total_siswa || 0} Siswa 
                                    </div>
                                    
                                    <div 
                                        className="w-[20%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] relative cursor-pointer px-[2vw]"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            setOpenRowId(openRowId === item.id ? null : item.id);
                                        }}
                                    >
                                        <div className="w-full flex items-center justify-center relative">
                                            <span className={`satoshiBold text-[1.2vw] text-[#E87E2F]`}>
                                                {displayStatus}
                                            </span>
                                            <div className="absolute right-[-1vw] top-1/2 -translate-y-1/2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-[1.2vw] h-[1.2vw] text-[#E87E2F] transition-transform ${openRowId === item.id ? 'rotate-180' : ''}`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </div>
                                        </div>

                                        {openRowId === item.id && (
                                            <div className="absolute top-[100%] left-[10%] w-[80%] bg-white border border-[#E87E2F] rounded-[0.5vw] shadow-xl z-50 flex flex-col overflow-hidden mt-[0.5vw]">
                                                {["Active", "Pending", "Inactive"].map((statusOption) => (
                                                    <div 
                                                        key={statusOption}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(item.id, statusOption);
                                                        }}
                                                        className="px-[1vw] py-[0.5vw] hover:bg-[#E87E2F] hover:text-white cursor-pointer satoshiMedium text-[1vw] text-[#E87E2F] border-b border-orange-100 last:border-0 text-center transition-colors"
                                                    >
                                                        {statusOption}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                        <Link href={`/admin/sekolah/${item.id}`} className="text-[#D9833E] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33]">
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-[1.5vw] items-center gap-[1vw]">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}`}>&lt;</button>
                <p className="satoshiMedium text-[#E87E2F] text-[1.2vw]">Halaman {currentPage} dari {totalPages || 1}</p>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}`}>&gt;</button>
            </div>

        </div>
    );
};

export default DaftarSekolahAdmin;