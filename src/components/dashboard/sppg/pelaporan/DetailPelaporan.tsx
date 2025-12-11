'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';

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

    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [schoolName, setSchoolName] = useState("Memuat Nama Sekolah...");
    const [loading, setLoading] = useState(true);

    const [selectedDetail, setSelectedDetail] = useState<ReportDetailData | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [itemToUpdate, setItemToUpdate] = useState<ReportListItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = ["2025", "2026", "2027"];

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
        setItemToUpdate(item);
    };

    const handleConfirmUpdate = async () => {
        if (!itemToUpdate) return;

        setIsUpdating(true);
        try {
            const response = await fetchWithAuth(`/sppg/reports/${itemToUpdate.id}`, {
                method: 'PUT'
            });

            if (response.ok) {
                setReports(prev => prev.map(item => 
                    item.id === itemToUpdate.id ? { ...item, status: "completed" } : item
                ));
                setItemToUpdate(null);
                alert("Status berhasil diperbarui!");
            } else {
                const errJson = await response.json();
                console.error("Backend Error:", errJson);
                alert(`Gagal mengubah status: ${errJson.message || "Unknown Error"}`);
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Terjadi kesalahan koneksi.");
        } finally {
            setIsUpdating(false);
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
        if (s === 'completed' || s === 'selesai') return "bg-[#4CAF50] cursor-default"; 
        if (s === 'processing' || s === 'proses' || s === 'pending') return "bg-[#F2C94C] cursor-pointer hover:bg-[#e0b840]";
        return "bg-gray-400 cursor-pointer";
    };

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

    return (
        <div className="w-full min-h-screen p-[3vw] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>
            
            <div className="mb-[2vw]">
                <h1 className="satoshiBold text-[2.5vw] text-black">Pelaporan Sekolah</h1>
                <h2 className="satoshiMedium text-[1.5vw] text-gray-600">
                    {loading ? (
                        <div className="h-[2vw] w-[25vw] bg-gray-200 rounded animate-pulse mt-[0.5vw]"></div>
                    ) : (
                        schoolName
                    )}
                </h2>
            </div>

            <div className="flex flex-col items-start relative z-20" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-[1.5vw] mb-[2vw] items-center">
                    <CustomDropdown label={selectedDate} options={dates} isOpen={openDropdown === 'date'} onToggle={() => toggleDropdown('date')} onSelect={(val) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    <CustomDropdown label={selectedMonth} options={monthsList} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} onSelect={(val) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }} />
                    <CustomDropdown label={selectedYear} options={years} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} onSelect={(val) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }} />
                </div>
                {isFilterActive && (
                     <button onClick={handleClearFilter} className="bg-white cursor-pointer mb-[2vw] w-fit text-[#E87E2F] satoshiMedium text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[1vw] flex items-center gap-[0.5vw] shadow-sm hover:bg-[#E87E2F] hover:text-white"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <span>Hapus Filter</span>
                    </button>
                )}
            </div>

            <div className="w-full bg-[#E87E2F] rounded-[1.5vw] overflow-hidden border-[0.2vw] border-[#E87E2F] relative z-10">
                <div className="flex bg-[#E87E2F] text-white">
                    <div className="w-[10%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">No</div>
                    <div className="w-[25%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Tanggal Lapor</div>
                    <div className="w-[30%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Menu</div>
                    <div className="w-[20%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">Status</div>
                    <div className="w-[15%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">Detail</div>
                </div>

                <div className="flex flex-col bg-white">
                    {loading ? (
                         [...Array(5)].map((_, i) => (
                            <div key={i} className="flex border-b-[0.15vw] border-[#E87E2F] bg-white animate-pulse">
                                <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <div className="w-[1.5vw] h-[1.5vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <div className="w-[10vw] h-[1.2vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[30%] py-[1.5vw] px-[1vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <div className="w-[15vw] h-[1.2vw] bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-[20%] px-[2vw] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <div className="w-full h-[2vw] bg-gray-200 rounded-[1vw]"></div>
                                </div>
                                <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                    <div className="w-[5vw] h-[1.2vw] bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <div key={item.id} className={`flex border-b-[0.15vw] border-[#E87E2F] last:border-b-0 transition-colors ${(indexOfFirstItem + index) % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'} hover:opacity-95`}>
                                <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{indexOfFirstItem + index + 1}</div>
                                <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{item.tanggal} {item.bulan} {item.tahun}</div>
                                <div className="w-[30%] py-[1.5vw] px-[1vw] flex justify-center items-center text-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">{item.menu}</div>
                                <div className="w-[20%] px-[2vw] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]">
                                    <button 
                                        onClick={() => handleStatusClick(item)}
                                        className={`${getStatusColor(item.status)} text-white satoshiBold text-[1vw] px-[2vw] py-[0.5vw] rounded-[1vw] shadow-sm w-full text-center capitalize transition-colors`} 
                                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                                        title={item.status === 'processing' ? "Klik untuk selesaikan" : "Sudah selesai"}
                                    >
                                        {item.status}
                                    </button>
                                </div>
                                <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                    <button onClick={() => handleViewDetail(item.id)} className="text-[#E87E2F] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33] cursor-pointer">Lihat Detail</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-[2vw] text-center satoshiMedium text-[1.2vw] text-gray-500">Data tidak ditemukan.</div>
                    )}
                </div>
            </div>

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

            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[3vw]">
                    <div className="bg-[#E87E2F] w-[50vw] max-h-[90vh] overflow-y-auto rounded-[2vw] p-[3vw] shadow-2xl relative flex flex-col gap-[1.5vw]">
                        {loadingDetail ? (
                            <div className="text-white text-center satoshiBold text-[1.5vw]">Mengambil Data Detail...</div>
                        ) : (
                            <>
                                <h2 className="text-white satoshiBold text-[2vw] text-center">{selectedDetail.menu}</h2>
                                {selectedDetail.foto_report && (
                                    <div className="w-full h-[20vw] bg-white rounded-[1vw] overflow-hidden mb-[1vw] flex items-center justify-center">
                                        <img src={selectedDetail.foto_report} alt="Bukti Laporan" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-white satoshiMedium text-[1.2vw]">Catatan & Komponen:</p>
                                <div className="bg-white rounded-[1.5vw] p-[2vw] min-h-[10vw]">
                                    <ul className="list-none flex flex-col gap-[0.8vw]">
                                        {selectedDetail.catatan.map((line, idx) => (
                                            <li key={idx} className="text-[#8B4513] satoshiMedium text-[1.2vw] leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                        <button onClick={() => setSelectedDetail(null)} className="absolute top-[1.5vw] right-[2vw] text-white hover:text-gray-200 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2.5vw] h-[2.5vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {itemToUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[3vw]">
                    <div className="bg-white w-[30vw] rounded-[2vw] p-[2vw] shadow-2xl relative flex flex-col gap-[1.5vw] text-center">
                        <h2 className="text-[#D7762E] satoshiBold text-[2.5vw]">Sudah Menyelesaikan Laporan</h2>
                        <p className="text-black satoshiMedium text-[1.2vw]">
                            Pastikan menu sudah diperbarui dengan mengedit menu MBG. Status akan otomatis terganti.
                        </p>
                        <div className="flex gap-[1vw] justify-center mt-[1vw]">
                            <button 
                                onClick={() => setItemToUpdate(null)}
                                className="bg-white text-[#E87E2F] border-[0.15vw] border-[#E87E2F] px-[3vw] py-[0.8vw] rounded-[1.5vw] satoshiBold text-[1.2vw] hover:bg-[#FFF3EB] transition-colors"
                            >
                                Batal
                            </button>

                            <button 
                                onClick={handleConfirmUpdate}
                                disabled={isUpdating}
                                className={`text-white px-[3vw] py-[0.8vw] rounded-[1.5vw] satoshiBold text-[1.2vw] transition-all shadow-md
                                    ${isUpdating ? 'bg-[#E87E2FCC] cursor-wait' : 'bg-[#E87E2F] hover:bg-[#E87E2FCC]'}`}
                            >
                                {isUpdating ? "Memproses..." : "Selesai"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const CustomDropdown = ({ label, options, isOpen, onToggle, onSelect }: CustomDropdownProps) => {
    return (
        <div className="relative w-[12vw]">
            <button onClick={onToggle} className="w-full bg-[#E87E2F] cursor-pointer text-white satoshiBold text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33]" style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
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

export default DetailPelaporanSekolahSppg;