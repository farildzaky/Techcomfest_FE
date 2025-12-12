'use client'
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 

// Interface sesuai response API
interface ProfileData {
    nama_sekolah: string;
    alamat: string;
    photo_url: string | null;
}

const SidebarProfileSekolah = () => {
    const pathname = usePathname();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // --- FETCH DATA (GET) ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetchWithAuth('/profile', { method: 'GET' });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.profile_data) {
                        setProfile(result.data.profile_data);
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

    // --- HANDLE UPLOAD FOTO (PATCH) ---
    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('photo', file); 

            const response = await fetchWithAuth('/profile', {
                method: 'PATCH',
                body: formData, 
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.data && result.data.profile_data) {
                    setProfile(prev => ({
                        ...prev!, 
                        photo_url: result.data.profile_data.photo_url 
                    }));
                }
                alert("Foto profil berhasil diperbarui!");
            } else {
                const errorResult = await response.json();
                alert(`Gagal upload: ${errorResult.message || "Terjadi kesalahan"}`);
            }
        } catch (error) {
            console.error("Error updating profile photo:", error);
            alert("Gagal memperbarui foto profil.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const menuItems = [
        { label: "Informasi Instansi", href: "/sekolah/profile/informasi-sekolah" },
        { label: "Data Laporan", href: "/sekolah/profile/data-laporan" },
    ];

    return (
        // Container Utama: Mobile pakai padding px/rem, Desktop pakai vw (lg:...)
        <div className="w-full lg:min-h-screen bg-[#D7762E] flex flex-col items-center p-6 lg:p-0 lg:py-[2vw] rounded-none lg:rounded-r-[0.5vw]">
            
            {/* Input File Tersembunyi */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
            />

            {/* Back Button */}
            <div className="w-full px-0 mb-6 lg:px-[2vw] lg:mb-[2vw]">
                <Link href="/sppg/dashboard">
                    {/* Ukuran tombol disesuaikan untuk mobile */}
                    <button className="text-white hover:bg-white/20 p-2 lg:p-[0.5vw] rounded-full transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 lg:w-[2vw] lg:h-[2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </Link>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4 lg:gap-[1vw] mb-8 lg:mb-[3vw]">
                {/* Foto Profil Container: Ukuran fixed di mobile (w-32), vw di desktop */}
                <div className="w-32 h-32 lg:w-[15vw] lg:h-[15vw] bg-[#F3F4F6] rounded-full relative shadow-lg group">
                    
                    {/* Render Foto */}
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                        {loading ? (
                            <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                        ) : isUploading ? (
                            // Loading spinner
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-8 h-8 lg:w-[3vw] lg:h-[3vw] border-4 border-[#D7762E] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs lg:text-[0.8vw] font-bold text-gray-500">Uploading...</span>
                            </div>
                        ) : profile?.photo_url ? (
                            <img 
                                src={profile.photo_url} 
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
                        disabled={isUploading || loading}
                        className="absolute bottom-1 right-2 lg:bottom-[0.5vw] lg:right-[1vw] bg-white p-2 lg:p-[0.4vw] rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="h-6 w-40 lg:h-[2vw] lg:w-[12vw] bg-white/30 rounded animate-pulse mb-2 lg:mb-[0.5vw] mx-auto"></div>
                            <div className="h-4 w-24 lg:h-[1.5vw] lg:w-[8vw] bg-white/30 rounded animate-pulse mx-auto"></div>
                        </>
                    ) : (
                        <>
                            {/* Text size responsive: XL mobile, VW desktop */}
                            <h2 className="satoshiBold text-xl lg:text-[1.8vw] leading-tight break-words uppercase">
                                {profile?.nama_sekolah || "Nama Sekolah"}
                            </h2>
                            <p className="satoshiMedium text-base lg:text-[1.5vw] uppercase mt-1 lg:mt-[0.2vw]">
                                {profile?.alamat || "Alamat Sekolah"}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Menu List */}
            <div className="w-full flex flex-col gap-3 lg:gap-[1vw] px-2 lg:pr-[10vw] lg:px-0">
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
                                    relative z-10 flex items-start w-full justify-center lg:justify-start lg:pl-[8vw] gap-2 lg:gap-[1.5vw] transition-colors duration-300
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

        </div>
    )
}

export default SidebarProfileSekolah;