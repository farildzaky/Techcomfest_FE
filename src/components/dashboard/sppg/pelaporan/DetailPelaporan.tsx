'use client'
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const DATA_PELAPORAN = [
    { 
        id: 1, no: 1, tanggal: "4", bulan: "Januari", tahun: "2026", 
        menu: "Nasi Ikan Bumbu Kuning", status: "Selesai",
        catatan: ["Ikan terlalu asin menurut beberapa siswa.", "Sayuran pendamping sudah segar."]
    },
    { 
        id: 2, no: 2, tanggal: "4", bulan: "Januari", tahun: "2026", 
        menu: "Nasi Soto Ayam Bening", status: "Selesai",
        catatan: ["Kuah soto sangat segar.", "Potongan ayam perlu diperbanyak."]
    },
    { 
        id: 3, no: 3, tanggal: "4", bulan: "Januari", tahun: "2026", 
        menu: "Nasi Ayam Teriyaki", status: "Proses",
        catatan: ["Saus teriyaki terlalu manis.", "Perlu rekomendasi alternatif."]
    },
    { 
        id: 4, no: 4, tanggal: "4", bulan: "Januari", tahun: "2026", 
        menu: "Nasi Ayam Katsu", status: "Selesai",
        catatan: ["Tekstur katsu agak keras.", "Saus pendamping mohon dipisah."]
    },
    { id: 5, no: 5, tanggal: "5", bulan: "Januari", tahun: "2026", menu: "Nasi Goreng", status: "Selesai", catatan: ["Enak"] },
    { id: 6, no: 6, tanggal: "5", bulan: "Januari", tahun: "2026", menu: "Mie Goreng", status: "Proses", catatan: ["Kurang sayur"] },
];

interface CustomDropdownProps {
    label: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
}

const DetailPelaporanSekolahSppg = () => {
    const router = useRouter();
    const params = useParams();
    

    const schoolName = "SLB-B YTPB Malang"; 

    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; 

    const [selectedDate, setSelectedDate] = useState("Tanggal");
    const [selectedMonth, setSelectedMonth] = useState("Bulan");
    const [selectedYear, setSelectedYear] = useState("Tahun");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const dates = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const years = ["2025", "2026", "2027"];

    const filteredData = DATA_PELAPORAN.filter(item => {
        const matchDate = selectedDate === "Tanggal" || item.tanggal === selectedDate;
        const matchMonth = selectedMonth === "Bulan" || item.bulan === selectedMonth;
        const matchYear = selectedYear === "Tahun" || item.tahun === selectedYear;
        return matchDate && matchMonth && matchYear;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Selesai": return "bg-[#4CAF50]"; 
            case "Proses": return "bg-[#F2C94C]";  
            default: return "bg-gray-400";
        }
    };

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <div className="w-full min-h-screen p-[3vw] flex flex-col font-sans relative" onClick={() => setOpenDropdown(null)}>
            
            <div className="mb-[2vw]">
                <h1 className="satoshiBold text-[2.5vw] text-black">Pelaporan Sekolah</h1>
                <h2 className="satoshiMedium text-[1.5vw] text-gray-600">{schoolName}</h2>
            </div>

            <div className="flex gap-[1.5vw] mb-[2vw] relative z-20" onClick={(e) => e.stopPropagation()}>
                <CustomDropdown 
                    label={selectedDate} 
                    options={dates} 
                    isOpen={openDropdown === 'date'}
                    onToggle={() => toggleDropdown('date')}
                    onSelect={(val: string) => { setSelectedDate(val); setCurrentPage(1); setOpenDropdown(null); }}
                />
                <CustomDropdown 
                    label={selectedMonth} 
                    options={months} 
                    isOpen={openDropdown === 'month'}
                    onToggle={() => toggleDropdown('month')}
                    onSelect={(val: string) => { setSelectedMonth(val); setCurrentPage(1); setOpenDropdown(null); }}
                />
                <CustomDropdown 
                    label={selectedYear} 
                    options={years} 
                    isOpen={openDropdown === 'year'}
                    onToggle={() => toggleDropdown('year')}
                    onSelect={(val: string) => { setSelectedYear(val); setCurrentPage(1); setOpenDropdown(null); }}
                />
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
                    {currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <div key={item.id} className={`flex border-b-[0.15vw] border-[#E87E2F] last:border-b-0 transition-colors ${
                                            (indexOfFirstItem + index) % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'
                                        } hover:opacity-95`}>
                                
                                <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                    {indexOfFirstItem + index + 1}
                                </div>
                                <div className="w-[25%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                    {item.tanggal} {item.bulan} {item.tahun}
                                </div>
                                <div className="w-[30%] py-[1.5vw] px-[1vw] flex justify-center items-center text-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                    {item.menu}
                                </div>
                                <div className="w-[20%] px-[2vw] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F]"
                                >
                                    <span className={`${getStatusColor(item.status)} text-white satoshiBold text-[1vw] px-[2vw] py-[0.5vw] rounded-[1vw] shadow-sm w-full text-center`} style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="w-[15%] py-[1.5vw] flex justify-center items-center">
                                    <button onClick={() => setSelectedItem(item)} className="text-[#E87E2F] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33] cursor-pointer">
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-[2vw] text-center satoshiMedium text-[1.2vw] text-gray-500">
                            Data tidak ditemukan.
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 0 && (
                <div className="flex justify-end mt-[1vw] mb-[2vw]">
                    <div className="flex items-center gap-[1vw]">
                        <span className="text-[#E87E2F] satoshiMedium text-[1.2vw]">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <div className="flex gap-[0.5vw]">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`w-[2vw] h-[2vw] cursor-pointer flex items-center justify-center rounded-full ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}
                            >
                                &lt;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`w-[2vw] h-[2vw] cursor-pointer flex items-center justify-center rounded-full ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#E87E2F] text-white hover:bg-[#b06a33]'}`}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[3vw]">
                    <div className="bg-[#E87E2F] w-[50vw] rounded-[2vw] p-[3vw] shadow-2xl relative flex flex-col gap-[1.5vw]">
                        <h2 className="text-white satoshiBold text-[2vw] text-center">{selectedItem.menu}</h2>
                        <p className="text-white satoshiMedium text-[1.2vw]">Catatan</p>
                        <div className="bg-white rounded-[1.5vw] p-[2vw] min-h-[15vw]">
                            <ul className="list-disc list-outside pl-[1.5vw] flex flex-col gap-[0.5vw]">
                                {selectedItem.catatan.map((note: string, idx: number) => (
                                    <li key={idx} className="text-[#8B4513] satoshiMedium text-[1.2vw] leading-relaxed">{note}</li>
                                ))}
                            </ul>
                        </div>
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
        <div className="relative w-[12vw]">
            <button 
                onClick={onToggle}
                className="w-full bg-[#E87E2F] text-white satoshiBold text-[1.2vw] py-[0.8vw] px-[1.5vw] rounded-[0.5vw] flex justify-between items-center shadow-sm hover:bg-[#b06a33] transition-colors cursor-pointer"
                        style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
            >
                {label}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-[1.2vw] h-[1.2vw] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-[0.5vw] w-full bg-white rounded-[0.5vw] shadow-lg max-h-[15vw] overflow-y-auto border border-gray-200 z-30">
                    {options.map((opt: string, idx: number) => (
                        <div 
                            key={idx} 
                            onClick={() => onSelect(opt)}
                            className="px-[1.5vw] py-[0.8vw] hover:bg-orange-50 cursor-pointer satoshiMedium text-[1vw] text-gray-700 border-b border-gray-100 last:border-0"
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DetailPelaporanSekolahSppg;