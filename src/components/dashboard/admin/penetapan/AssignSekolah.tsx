'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';

interface ProfileData {
    nama_sekolah: string;
    sppg: any | null; 
}

interface SchoolData {
    id: string;
    email: string;
    role: string;
    profile_data?: ProfileData; 
}

const AssignSekolah = () => {
    const router = useRouter();
    const params = useParams();
    const sppgId = params.id as string; 

    const [searchQuery, setSearchQuery] = useState("");
    const [schoolList, setSchoolList] = useState<SchoolData[]>([]);
    const [selectedSchools, setSelectedSchools] = useState<string[]>([]); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchSekolah = async () => {
            setLoading(true);
            try {
                const resList = await fetchWithAuth("/admin/users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!resList.ok) throw new Error("Gagal ambil data user");
                const listData = await resList.json();

                const candidateSchools = listData.data.filter((u: SchoolData) => u.role === 'sekolah');

                const detailedChecks = await Promise.all(
                    candidateSchools.map(async (school: SchoolData) => {
                        try {
                            const resDetail = await fetchWithAuth(`/admin/users/${school.id}`, {
                                method: "GET"
                            });
                            const detailJson = await resDetail.json();
                            return detailJson.data; 
                        } catch (err) {
                            return null;
                        }
                    })
                );

                const availableSchools = detailedChecks.filter((u: SchoolData | null) => {
                    if (!u) return false;
                    
                    if (!u.profile_data) return false; 

                    return u.profile_data.sppg === null;
                });
                
                setSchoolList(availableSchools);

            } catch (error) {
                console.error("Error fetching schools:", error);
            } finally {
                setLoading(false);
            }
        };

        if (sppgId) {
            fetchSekolah();
        }
    }, [sppgId]);

    const filteredSchools = schoolList.filter(school => {
        const name = school.profile_data?.nama_sekolah || "";
        const email = school.email || "";
        return (name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                email.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const toggleSelection = (id: string) => {
        setSelectedSchools(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelesai = async () => {
        if (selectedSchools.length === 0) {
            alert("Pilih minimal satu sekolah.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`/admin/sppg/${sppgId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ school_ids: selectedSchools })
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.message || "Gagal menetapkan sekolah.");

            alert(`Berhasil! ${selectedSchools.length} sekolah berhasil ditambahkan.`);
            router.push("/admin/penetapan/assign-sppg");

        } catch (error: any) {
            alert(`Gagal: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col font-sans relative bg-white">
            <div className="w-full shrink-0 bg-white z-20 pt-[1vw]">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-[0.5vw] rounded-full absolute left-[3vw] top-[3vw] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2vw] h-[2vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <div className="flex justify-between items-start px-[3vw] pt-[2vw] pb-[1vw] pl-[6vw]">
                    <div className="flex flex-col">
                        <h1 className="satoshiBold text-[2.5vw] text-black leading-tight">Sekolah Terdaftar dalam Inkluzi</h1>
                        <p className="satoshiMedium text-[1.2vw] text-gray-600">Pilih sekolah yang belum memiliki SPPG</p>
                    </div>
                    <div className="relative w-[30%]">
                        <input 
                            type="text" placeholder="Cari sekolah..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-[0.8vw] border border-gray-200 py-[0.8vw] pl-[3vw] pr-[1vw] text-[1vw] outline-none focus:border-[#E87E2F] placeholder:text-gray-400 shadow-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.2vw] h-[1.2vw] text-[#E87E2F] absolute left-[1vw] top-1/2 -translate-y-1/2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-[3vw] pt-[1vw] pb-[3vw]">
                {loading ? (
                    <div className="text-center mt-[5vw] text-gray-500">Memeriksa data...</div>
                ) : (
                    <div className="grid grid-cols-2 gap-[1.5vw]">
                        {filteredSchools.map((school) => {
                            const isSelected = selectedSchools.includes(school.id);
                            const displayName = school.profile_data?.nama_sekolah || school.email;
                            
                            return (
                                <div 
                                    key={school.id} onClick={() => toggleSelection(school.id)}
                                    className={`flex items-center gap-[1.5vw] p-[1.5vw] rounded-[1vw] border-[0.15vw] cursor-pointer transition-all duration-200 ${isSelected ? 'border-[#D9833E] bg-white shadow-sm' : 'border-[#D9833E] bg-white hover:bg-orange-50'}`}
                                >
                                    <div className={`w-[2vw] h-[2vw] rounded-full border-[0.15vw] border-[#D9833E] flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#D9833E]' : 'bg-white'}`}>
                                        {isSelected && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[1.2vw] h-[1.2vw] text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                    </div>
                                    <span className={`satoshiBold text-[1.3vw] text-[#D9833E]`}>
                                        {displayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!loading && filteredSchools.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-[5vw] text-gray-400">
                        <p className="satoshiMedium text-[1.5vw]">
                           {schoolList.length === 0 ? "Semua sekolah sudah memiliki SPPG" : "Sekolah tidak ditemukan"}
                        </p>
                    </div>
                )}
            </div>

            <div className="relative flex justify-end px-[3vw] pb-[2vw] z-30 pt-[1vw] border-t border-gray-100">
                <button onClick={handleSelesai} disabled={submitting} className={`text-white satoshiBold text-[1.2vw] py-[1vw] px-[5vw] rounded-[1.5vw] shadow-xl transition-all active:scale-95 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C67C3E] hover:bg-[#b06a33]'}`}>
                    {submitting ? "Menyimpan..." : "Selesai"}
                </button>
            </div>
        </div>
    )
}
export default AssignSekolah;