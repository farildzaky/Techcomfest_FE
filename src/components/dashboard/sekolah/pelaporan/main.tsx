'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 

// --- INTERFACE ---
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

const MainPelaporanSekolah = () => {
    const router = useRouter();
    
    const [reports, setReports] = useState<ReportListItem[]>([]); 
    const [loadingList, setLoadingList] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ReportDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
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

    return (
        <div className="w-full min-h-screen p-[3vw] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>

            <h1 className="satoshiBold text-[2.5vw] text-black mb-[2vw]">Lacak Pelaporan</h1>

            <div className="flex gap-[1.5vw] mb-[2vw] relative z-20 items-center" onClick={(e) => e.stopPropagation()}>
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
            <div className="w-full bg-[#E87E2F] rounded-[1.5vw] overflow-hidden border-[0.2vw] border-[#E87E2F] relative z-10">
                <div className="flex bg-[#E87E2F] text-white">
                    <div className="w-[10%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">No</div>
                    <div className="w-[25%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Tanggal Lapor</div>
                    <div className="w-[30%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Menu</div>
                    <div className="w-[20%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Status</div>
                    <div className="w-[15%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">Detail</div>
                </div>

                <div className="flex flex-col bg-white">
                    {loadingList ? (
                        <div className="flex items-center justify-center p-[4vw]"><p className="satoshiBold text-[1.5vw] text-[#E87E2F]">Memuat data...</p></div>
                    ) : currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <div key={item.id} className={`flex border-b-[0.15vw] border-[#E87E2F] last:border-b-0 transition-colors ${(indexOfFirstItem + index) % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}`}>
                                <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{indexOfFirstItem + index + 1}</div>
                                <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{item.tanggal} {item.bulan} {item.tahun}</div>
                                <div className="w-[30%] py-[1.5vw] px-[1vw] flex justify-center items-center text-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{item.menu}</div>
                                <div className="w-[20%] px-[2vw] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <span className={`${getStatusColor(item.status)} text-white satoshiBold text-[1vw] px-[2vw] py-[0.5vw] rounded-[1vw] shadow-sm w-full text-center capitalize`}>{item.status}</span>
                                </div>
                                <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                    <button 
                                        onClick={() => handleViewDetail(item.id)} 
                                        className="text-[#D98848] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33] cursor-pointer"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-[4vw] text-center satoshiMedium text-[1.2vw] text-gray-500">Data tidak ditemukan.</div>
                    )}
                </div>
            </div>

            {totalPages > 0 && (
                <div className="flex justify-end mt-[1vw] mb-[2vw]">
                    <div className="flex items-center gap-[1vw]">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={` cursor-pointer w-[2vw] h-[2vw] flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&lt;</button>
                        <span className="text-[#E87E2F] satoshiMedium text-[1.2vw]">Halaman {currentPage} dari {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={` cursor-pointer w-[2vw] h-[2vw] flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#E87E2F] text-white'}`}>&gt;</button>
                    </div>
                </div>
            )}
            
            <div className="mt-[2vw]">
                <button onClick={() => router.push('/sekolah/pelaporan/form-pelaporan')} className="w-full bg-[#E87E2F] text-white satoshiBold text-[1.8vw] py-[1.2vw] rounded-[1.5vw] shadow-md hover:bg-[#b06a33]">Laporkan Menu ke Sppg</button>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[3vw]">
                    <div className="bg-[#E87E2F] w-[50vw] max-h-[90vh] overflow-y-auto rounded-[2vw] p-[3vw] shadow-2xl relative flex flex-col gap-[1.5vw]">
                        {loadingDetail ? (
                            <div className="text-white text-center satoshiBold text-[1.5vw]">Mengambil Data Detail...</div>
                        ) : (
                            <>
                                <h2 className="text-white satoshiBold text-[2vw] text-center">{selectedItem.menu}</h2>
                                {selectedItem.foto_report && (
                                    <div className="w-full h-[20vw] bg-white rounded-[1vw] overflow-hidden mb-[1vw] flex items-center justify-center">
                                        <img src={selectedItem.foto_report} alt="Bukti Laporan" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-white satoshiMedium text-[1.2vw]">Catatan & Komponen:</p>
                                <div className="bg-white rounded-[1.5vw] p-[2vw] min-h-[10vw]">
                                    <ul className="list-none flex flex-col gap-[0.8vw]">
                                        {selectedItem.catatan.map((line, idx) => (
                                            <li key={idx} className="text-[#8B4513] satoshiMedium text-[1.2vw] leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        <button onClick={() => setSelectedItem(null)} className="absolute top-[1.5vw] right-[2vw] text-white hover:text-gray-200 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2.5vw] h-[2.5vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[12vw] ">
            <button onClick={onToggle} className="cursor-pointer w-full bg-[#E87E2F] text-white satoshiBold text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]">
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

export default MainPelaporanSekolah;