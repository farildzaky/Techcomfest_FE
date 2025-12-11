'use client'
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 

// Interface sesuai response API
interface ProfileData {
    nama_instansi: string;
    wilayah_kerja: string;
    photo_url: string | null;
}

const SidebarProfileSppg = () => {
    const pathname = usePathname();
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file tersembunyi

    // --- STATE ---
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // State khusus saat upload

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
        // Trigger klik pada input file yang tersembunyi
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validasi ukuran (opsional, misal maks 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            // Key 'photo' sesuai dengan dokumentasi API pada gambar image_9b507c.jpg
            formData.append('photo', file); 

            // Catatan: Saat menggunakan FormData, jangan set 'Content-Type': 'application/json' secara manual.
            // Biarkan browser mengaturnya menjadi 'multipart/form-data'.
            const response = await fetchWithAuth('/profile', {
                method: 'PATCH',
                body: formData, 
            });

            if (response.ok) {
                const result = await response.json();
                
                // Update tampilan foto profil dengan URL baru dari response
                if (result.data && result.data.profile_data) {
                    setProfile(prev => ({
                        ...prev!, // Mempertahankan data lama (nama, dll)
                        photo_url: result.data.profile_data.photo_url // Update URL foto
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
            // Reset input value agar user bisa memilih file yang sama jika perlu
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const menuItems = [
        { label: "Informasi Instansi", href: "/sppg/profile/informasi-instansi" },
        { label: "Data Laporan", href: "/sppg/profile/data-laporan" },
    ];

    return (
        <div className="w-full min-h-screen bg-[#D7762E] flex flex-col items-center py-[2vw] rounded-r-[0.5vw]">
            
            {/* Input File Tersembunyi */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
            />

            {/* Back Button */}
            <div className="w-full px-[2vw] mb-[2vw]">
                <Link href="/sppg/dashboard">
                    <button className="text-white hover:bg-white/20 p-[0.5vw] rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2vw] h-[2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </Link>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center gap-[1vw] mb-[3vw]">
                {/* Foto Profil Container */}
                <div className="w-[15vw] h-[15vw] bg-[#F3F4F6] rounded-full relative shadow-lg group">
                    
                    {/* Render Foto */}
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                        {loading ? (
                            <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                        ) : isUploading ? (
                            // Loading spinner saat upload
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-[3vw] h-[3vw] border-4 border-[#D7762E] border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[0.8vw] font-bold text-gray-500">Uploading...</span>
                            </div>
                        ) : profile?.photo_url ? (
                            <img 
                                src={profile.photo_url} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[6vw] h-[6vw] text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        )}
                    </div>

                    {/* Tombol Edit Foto (Clickable) */}
                    <button 
                        onClick={handleIconClick}
                        disabled={isUploading || loading}
                        className="absolute bottom-[0.5vw] right-[1vw] bg-white p-[0.4vw] rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Ubah Foto Profil"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[2vw] h-[2vw] text-[#D9833E]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                </div>
                
                {/* Teks Nama & Wilayah */}
                <div className="text-center text-white px-[1vw]">
                    {loading ? (
                        <>
                            <div className="h-[2vw] w-[12vw] bg-white/30 rounded animate-pulse mb-[0.5vw] mx-auto"></div>
                            <div className="h-[1.5vw] w-[8vw] bg-white/30 rounded animate-pulse mx-auto"></div>
                        </>
                    ) : (
                        <>
                            <h2 className="satoshiBold text-[1.8vw] leading-tight break-words uppercase">
                                {profile?.nama_instansi || "Nama Instansi"}
                            </h2>
                            <p className="satoshiMedium text-[1.5vw] uppercase mt-[0.2vw]">
                                {profile?.wilayah_kerja || "Wilayah Kerja"}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Menu List */}
            <div className="w-full flex flex-col gap-[1vw] pr-[10vw]">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                        <Link 
                            key={index} 
                            href={item.href}
                            className="block" 
                        >
                            <div className="relative flex items-center p-[1.2vw] cursor-pointer rounded-r-[1vw] group">
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full bg-white opacity-50 rounded-r-[2vw]
                                        transition-all duration-500 ease-in-out
                                        ${isActive ? "w-full" : "w-0"}
                                    `}
                                />

                                <div className={`
                                    relative z-10 flex items-start flex w-full justify-start pl-[8vw] gap-[1.5vw] transition-colors duration-300
                                    ${isActive ? "text-white" : "text-white group-hover:text-white/80"}
                                `}>
                                    
                                    <span className="text-[1.4vw] satoshiBold whitespace-nowrap">
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

export default SidebarProfileSppg;