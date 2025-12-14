'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';

// Import Assets
import bg from "../../../../assets/bg.png";
import loadingIcon from "../../../../assets/loading.png";
import alertIcon from "../../../../assets/alert.png";

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
    const [loadingData, setLoadingData] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'loading' | 'error' | 'success' | null>(null);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        const fetchSekolah = async () => {
            setLoadingData(true);
            try {
                const resList = await fetchWithAuth("/admin/users", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!resList.ok) throw new Error("Gagal ambil data user");
                const listData = await resList.json();

                const candidateSchools = listData.data.filter((u: SchoolData) => u.role === 'sekolah');

                const detailedChecks = await Promise.all(
                    candidateSchools.map(async (school: SchoolData) => {
                        try {
                            const resDetail = await fetchWithAuth(`/admin/users/${school.id}`, { method: "GET" });
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
                setLoadingData(false);
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
            setModalType('error');
            setModalMessage("Pilih minimal satu sekolah.");
            setIsModalOpen(true);
            return;
        }

        setModalType('loading');
        setIsModalOpen(true);

        try {
            const res = await fetchWithAuth(`/admin/sppg/${sppgId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ school_ids: selectedSchools })
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.message || "Gagal menetapkan sekolah.");
            }

            // Sukses - Modal tetap loading sebentar atau langsung redirect
            // Disini kita biarkan loading state aktif sampai redirect terjadi
            router.push("/admin/penetapan");

        } catch (error: any) {
            setModalType('error');
            setModalMessage(error.message || "Terjadi kesalahan sistem.");
        }
    };

    const closeModal = () => {
        // Jangan tutup jika sedang loading proses API
        if (modalType === 'loading') return;
        setIsModalOpen(false);
        setModalType(null);
    };

    return (
        <div className="w-full h-screen flex flex-col font-sans relative bg-white overflow-hidden">

            {/* Header Section */}
            <div className="w-full shrink-0 bg-white z-20 pt-4 lg:pt-0 border-b lg:border-none border-gray-100 pb-4 lg:pb-0">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-2 lg:p-[0.5vw] rounded-full absolute left-4 lg:left-[2vw] top-4 lg:top-[2vw] transition-colors z-30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2vw] lg:h-[2vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start px-4 lg:px-[3vw] pt-12 lg:pt-[2vw] pb-4 lg:pb-[1vw] lg:pl-[6vw] gap-4 lg:gap-0">
                    <div className="flex flex-col w-full lg:w-auto">
                        <h1 className="satoshiBold text-2xl lg:text-[2.5vw] text-black leading-tight">Sekolah Terdaftar</h1>
                        <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-600 mt-1 lg:mt-0">Pilih sekolah yang belum memiliki SPPG</p>
                    </div>

                    <div className="relative w-full lg:w-[30%]">
                        <input
                            type="text" placeholder="Cari sekolah..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg lg:rounded-[0.8vw] border border-gray-200 py-3 lg:py-[0.8vw] pl-10 lg:pl-[3vw] pr-4 lg:pr-[1vw] text-sm lg:text-[1vw] outline-none focus:border-[#E87E2F] placeholder:text-gray-400 shadow-sm transition-colors"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-[1.2vw] lg:h-[1.2vw] text-[#E87E2F] absolute left-3 lg:left-[1vw] top-1/2 -translate-y-1/2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* List Sekolah */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-[3vw] pt-4 lg:pt-[1vw] pb-24 lg:pb-[3vw]">
                {loadingData ? (
                    <div className="text-center mt-10 lg:mt-[5vw] text-gray-500 satoshiMedium text-sm lg:text-[1.2vw]">Memeriksa data...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-[1.5vw]">
                        {filteredSchools.map((school) => {
                            const isSelected = selectedSchools.includes(school.id);
                            const displayName = school.profile_data?.nama_sekolah || school.email;

                            return (
                                <div
                                    key={school.id} onClick={() => toggleSelection(school.id)}
                                    className={`
                                        flex items-center gap-3 lg:gap-[1.5vw] p-4 lg:p-[1.5vw] rounded-xl lg:rounded-[1vw] border-2 lg:border-[0.15vw] 
                                        cursor-pointer transition-all duration-200 
                                        ${isSelected ? 'border-[#D9833E] bg-white shadow-sm' : 'border-[#D9833E] bg-white hover:bg-orange-50'}
                                    `}
                                >
                                    <div className={`w-6 h-6 lg:w-[2vw] lg:h-[2vw] rounded-full border-2 lg:border-[0.15vw] border-[#D9833E] flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#D9833E]' : 'bg-white'}`}>
                                        {isSelected && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 lg:w-[1.2vw] lg:h-[1.2vw] text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                    </div>
                                    <span className={`satoshiBold text-sm lg:text-[1.3vw] text-[#D9833E]`}>{displayName}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!loadingData && filteredSchools.length === 0 && (
                    <div className={`flex flex-col items-center justify-center text-gray-400 ${filteredSchools.length === 0 ? 'h-full mt-0' : 'h-auto  mt-10 lg:mt-[5vw]'}`}>
                        <p className={`satoshiMedium text-sm lg:text-[1.5vw] text-center`}>
                            {schoolList.length === 0 ? "Semua sekolah sudah memiliki SPPG" : "Sekolah tidak ditemukan"}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Button */}
            <div className="relative lg:static flex justify-end px-4 lg:px-[3vw] pb-4 lg:pb-[2vw] pt-4 lg:pt-[1vw] bg-white border-t border-gray-100 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:shadow-none">
                <button
                    onClick={handleSelesai}
                    disabled={isModalOpen} // Disable saat modal terbuka
                    className={`w-full lg:w-auto text-white satoshiBold text-base lg:text-[1.2vw] py-3 lg:py-[1vw] px-8 lg:px-[5vw] rounded-xl lg:rounded-[1.5vw] shadow-md lg:shadow-xl transition-all active:scale-95 ${isModalOpen ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C67C3E] hover:bg-[#b06a33]'}`}
                >
                    Selesai
                </button>
            </div>

            {/* --- UNIVERSAL MODAL SYSTEM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        {/* ICON SECTION */}
                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />

                            {modalType === 'loading' && (
                                <Image src={loadingIcon} alt="Loading" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                            )}

                            {modalType === 'success' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] absolute text-[#E87E2F]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}

                            {modalType === 'error' && (
                                <Image src={alertIcon} alt="Error" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute" />
                            )}
                        </div>

                        {/* TEXT CONTENT */}
                        <div className="flex flex-col gap-2">
                            {modalType === 'loading' && (
                                <>
                                    <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                        Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                                    </p>
                                </>
                            )}

                            {modalType === 'success' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[2vw] text-[#E87E2F]">Berhasil!</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">{modalMessage}</p>
                                </>
                            )}

                            {modalType === 'error' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[2vw] text-red-500">Gagal Menyimpan</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">{modalMessage}</p>
                                </>
                            )}
                        </div>

                        {/* BUTTON ACTION */}
                        {modalType !== 'loading' && (
                            <div className="flex w-full gap-4 lg:gap-[1.5vw] mt-2 lg:mt-[1vw]">
                                <button
                                    onClick={closeModal}
                                    className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                                >
                                    Tutup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}

export default AssignSekolah;