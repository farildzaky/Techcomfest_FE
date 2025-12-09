'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api'; 

// Interface sesuai response API
interface ScanHistoryItem {
    id: string;
    nama_makanan: string;
    scanned_at: string; 
}

const RiwayatScan = () => {
    const router = useRouter();

    const [scans, setScans] = useState<ScanHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 7; 

    // Format Tanggal: "2025-12-09..." -> "9 Desember 2025" (Tanpa Jam)
    const formatDate = (isoString: string) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // --- FETCH DATA RIWAYAT ---
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await fetchWithAuth(`/school/food-scans?page=${currentPage}&limit=${itemsPerPage}`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error("Gagal mengambil riwayat scan");

                const result = await response.json();
                setScans(result.data.scans || []);
                setTotalPages(result.data.pagination?.total_pages || 1);

            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentPage]); 

    // Handlers Pagination
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="w-full min-h-screen bg-[#E87E2F] py-[2vw] px-[3vw] flex flex-col font-sans relative">

            {/* Header Title */}
            <div className='w-fit bg-[#FFF3EB] rounded-r-[3vw] py-[1.5vw] px-[4vw] -ml-[3vw] mb-[3vw] shadow-md'>
                <h1 className='satoshiBold text-[3vw] text-[#E87E2F] w-[60vw] bg-[#FFF3EB] rounded-r-full flex px-[5vw]'>
                    Riwayat Deteksi Makanan
                </h1>
            </div>

            {/* Tabel Container Utama */}
            {/* Menggunakan border tebal dan background putih agar solid */}
            <div className='w-full bg-white rounded-[1vw] overflow-hidden border-[0.3vw] border-[#E87E2F] '>

                {/* --- HEADER TABEL --- */}
                <div className='flex w-full bg-[#FFF3EB] border-b-[0.2vw] border-[#E87E2F]'>
                    {/* No */}
                    <div className='w-[10%] py-[1vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F]'>
                        <span className='satoshiBold text-[1.5vw] text-[#E87E2F]'>No</span>
                    </div>
                    {/* Tanggal Scan */}
                    <div className='w-[35%] py-[1vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F]'>
                        <span className='satoshiBold text-[1.5vw] text-[#E87E2F]'>Tanggal Scan</span>
                    </div>
                    {/* Menu */}
                    <div className='w-[35%] py-[1vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F]'>
                        <span className='satoshiBold text-[1.5vw] text-[#E87E2F]'>Menu</span>
                    </div>
                    {/* Detail */}
                    <div className='w-[20%] py-[1vw] flex items-center justify-center'>
                        <span className='satoshiBold text-[1.5vw] text-[#E87E2F]'>Detail</span>
                    </div>
                </div>

                {/* --- BODY TABEL --- */}
                <div className='flex flex-col bg-white'>
                    
                    {loading ? (
                        <div className="py-[5vw] flex items-center justify-center">
                            <span className="text-[#E87E2F] satoshiBold text-[1.5vw]">Memuat data...</span>
                        </div>
                    ) : scans.length === 0 ? (
                        <div className='py-[5vw] flex items-center justify-center'>
                            <span className='text-gray-400 text-[1.5vw] italic'>Belum ada riwayat scan.</span>
                        </div>
                    ) : (
                        scans.map((item, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                            return (
                                <div key={item.id} className='flex w-full border-b-[0.2vw] border-[#E87E2F] last:border-b-0 hover:bg-orange-50 transition-colors'>
                                    {/* Kolom No */}
                                    <div className='w-[10%] py-[1.2vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F]'>
                                        <span className='satoshiMedium text-[1.3vw] text-black'>{globalIndex}</span>
                                    </div>
                                    
                                    {/* Kolom Tanggal */}
                                    <div className='w-[35%] py-[1.2vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F]'>
                                        <span className='satoshiMedium text-[1.3vw] text-black text-center'>
                                            {formatDate(item.scanned_at)}
                                        </span>
                                    </div>
                                    
                                    {/* Kolom Menu */}
                                    <div className='w-[35%] py-[1.2vw] flex items-center justify-center border-r-[0.2vw] border-[#E87E2F] px-[1vw]'>
                                        <span className='satoshiBold text-[1.3vw] text-[#8B5E3C] text-center w-full truncate'>
                                            {item.nama_makanan || "Tanpa Nama"}
                                        </span>
                                    </div>
                                    
                                    {/* Kolom Detail (Underline Style) */}
                                    <div className='w-[20%] py-[1.2vw] flex items-center justify-center'>
                                        <Link
                                            href={`/sekolah/scan-nutrisi/${item.id}`}
                                            className='text-[#E87E2F] underline hover:text-[#b06a33] satoshiMedium text-[1.2vw] whitespace-nowrap cursor-pointer'
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-[2vw] mt-[2vw]">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`px-[2vw] py-[0.5vw] rounded-full text-[1.2vw] satoshiBold ${currentPage === 1 ? 'bg-black/10 text-white/50 cursor-not-allowed' : 'bg-[#FFF3EB] text-[#E87E2F] hover:bg-white'}`}
                    >
                        Sebelumnya
                    </button>
                    <span className="text-white satoshiBold text-[1.2vw]">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`px-[2vw] py-[0.5vw] rounded-full text-[1.2vw] satoshiBold ${currentPage === totalPages ? 'bg-black/10 text-white/50 cursor-not-allowed' : 'bg-[#FFF3EB] text-[#E87E2F] hover:bg-white'}`}
                    >
                        Selanjutnya
                    </button>
                </div>
            )}

            {/* Tombol Kembali */}
            <div className='flex justify-end mt-[2vw]'>
                <button
                    onClick={() => router.push('/sekolah/scan-nutrisi')}
                    className='bg-[#FFF3EB] text-[#D7762E] satoshiBold text-[1.5vw] py-[0.8vw] px-[3vw] rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md cursor-pointer'
                >
                    Kembali
                </button>
            </div>
        </div>
    );
}

export default RiwayatScan;