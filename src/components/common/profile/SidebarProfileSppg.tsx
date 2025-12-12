'use client'
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image';

// Import Assets
import bg from "../../../assets/bg.png";
import loadingIcon from "../../../assets/loading.png";
import alertIcon from "../../../assets/alert.png";

// Interface sesuai response API SPPG
interface ProfileData {
    nama_instansi: string;
    wilayah_kerja: string;
    photo_url: string | null;
}

const SidebarProfileSppg = () => {
    const pathname = usePathname();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE DATA ---
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    // State untuk Cache Busting Gambar
    const [imgKey, setImgKey] = useState(Date.now());

    // --- STATE MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'loading' | 'success' | 'error' | null>(null);
    const [modalMessage, setModalMessage] = useState("");

    // --- FETCH DATA (GET) ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetchWithAuth('/profile', { method: 'GET' });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.profile_data) {
                        setProfile(result.data.profile_data);
                        setImgKey(Date.now()); // Set key awal
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil data profil:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // --- HELPER MODAL ---
    const showLoadingModal = () => {
        setModalType('loading');
        setIsModalOpen(true);
    };

    const showSuccessModal = (message: string) => {
        setModalType('success');
        setModalMessage(message);
        setIsModalOpen(true);
    };

    const showErrorModal = (message: string) => {
        setModalType('error');
        setModalMessage(message);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (modalType === 'loading') return; 
        setIsModalOpen(false);
        setModalType(null);
    };

    // --- HANDLE UPLOAD FOTO (PATCH) ---
    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validasi Ukuran (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showErrorModal("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        showLoadingModal();

        try {
            const formData = new FormData();
            formData.append('photo', file); 

            const response = await fetchWithAuth('/profile', {
                method: 'PATCH',
                body: formData, 
            });

            const result = await response.json();

            if (response.ok) {
                // Update State & Force Refresh Image
                if (result.data && result.data.profile_data) {
                    setProfile(result.data.profile_data);
                    setImgKey(Date.now()); // Update timestamp agar gambar langsung berubah
                }
                showSuccessModal("Foto profil berhasil diperbarui!");
            } else {
                showErrorModal(result.message || "Gagal mengupload foto.");
            }
        } catch (error) {
            console.error("Error updating profile photo:", error);
            showErrorModal("Terjadi kesalahan jaringan.");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const menuItems = [
        { label: "Informasi Instansi", href: "/sppg/profile/informasi-instansi" },
        { label: "Data Pelaporan", href: "/sppg/profile/data-laporan" },
    ];

    return (
        <div className="w-full lg:min-h-screen bg-[#D7762E] flex flex-col items-center p-6 lg:py-[2vw] lg:p-0 rounded-none lg:rounded-r-[0.5vw]">
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
            />

            {/* Back Button */}
            <div className="w-full mb-6 lg:mb-[2vw] px-0 lg:px-[2vw]">
                <Link href="/sppg/dashboard">
                    <button className="text-white hover:bg-white/20 p-2 lg:p-[0.5vw] rounded-full transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2vw] lg:h-[2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </Link>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4 lg:gap-[1vw] mb-8 lg:mb-[3vw]">
                
                {/* Foto Profil Container */}
                <div className="w-32 h-32 lg:w-[15vw] lg:h-[15vw] bg-[#F3F4F6] rounded-full relative shadow-lg group">
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                        {loading ? (
                            <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                        ) : profile?.photo_url ? (
                            // Menggunakan <img> biasa + key timestamp untuk bypass cache
                            <img 
                                key={imgKey}
                                src={`${profile.photo_url}${profile.photo_url.includes('?') ? '&' : '?'}v=${imgKey}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 lg:w-[6vw] lg:h-[6vw] text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        )}
                    </div>

                    {/* Tombol Edit Foto */}
                    <button 
                        onClick={handleIconClick}
                        disabled={loading}
                        className="absolute bottom-1 right-2 lg:bottom-[0.5vw] lg:right-[1vw] bg-white p-2 lg:p-[0.4vw] rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10 disabled:opacity-50"
                        title="Ubah Foto Profil"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-[2vw] lg:h-[2vw] text-[#D9833E]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                </div>
                
                {/* Teks Nama & Wilayah */}
                <div className="text-center text-white px-4 lg:px-[1vw]">
                    {loading ? (
                        <>
                            <div className="h-6 w-32 lg:h-[2vw] lg:w-[12vw] bg-white/30 rounded animate-pulse mb-2 lg:mb-[0.5vw] mx-auto"></div>
                            <div className="h-4 w-24 lg:h-[1.5vw] lg:w-[8vw] bg-white/30 rounded animate-pulse mx-auto"></div>
                        </>
                    ) : (
                        <>
                            <h2 className="satoshiBold text-xl lg:text-[1.8vw] leading-tight break-words uppercase">
                                {profile?.nama_instansi || "Nama Instansi"}
                            </h2>
                            <p className="satoshiMedium text-base lg:text-[1.5vw] uppercase mt-1 lg:mt-[0.2vw]">
                                {profile?.wilayah_kerja || "Wilayah Kerja"}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Menu List */}
            <div className="w-full flex flex-col gap-3 lg:gap-[1vw] px-2 lg:px-0 lg:pr-[10vw]">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                        <Link 
                            key={index} 
                            href={item.href}
                            className="block" 
                        >
                            <div className="relative flex items-center justify-center lg:justify-start p-3 lg:p-[1.2vw] cursor-pointer rounded-lg lg:rounded-l-none lg:rounded-r-[1vw] group">
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full bg-white opacity-50 rounded-lg lg:rounded-l-none lg:rounded-r-[2vw]
                                        transition-all duration-500 ease-in-out
                                        ${isActive ? "w-full" : "w-0"}
                                    `}
                                />

                                <div className={`
                                    relative z-10 flex w-full justify-center lg:justify-start lg:pl-[8vw] gap-2 lg:gap-[1.5vw] transition-colors duration-300
                                    ${isActive ? "text-white" : "text-white group-hover:text-white/80"}
                                `}>
                                    
                                    <span className="text-base lg:text-[1.4vw] satoshiBold whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* --- UNIFIED MODAL SYSTEM (Fixed Z-9999) --- */}
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
                                // SVG Centang Oranye
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] absolute text-[#E87E2F]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}

                            {modalType === 'error' && (
                                <Image src={alertIcon} alt="Error" className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] translate-y-[-0.3vw] object-contain absolute" />
                            )}
                        </div>

                        {/* TEXT CONTENT */}
                        <div className="flex flex-col gap-2">
                            {modalType === 'loading' && (
                                <>
                                    <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Mengunggah...</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                        Mohon tunggu, foto sedang diperbarui.
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
                                    <h3 className="satoshiBold text-lg lg:text-[2vw] text-red-500">Gagal</h3>
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

export default SidebarProfileSppg;