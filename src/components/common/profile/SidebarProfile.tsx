'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { fetchWithAuth } from '@/src/lib/api'; 

// --- INTERFACES DINAMIS ---
interface ProfileDataResponse { 
    nama_instansi?: string; 
    nama_sekolah?: string; 
    wilayah_kerja?: string;
    photo_url: string | null;
}
interface UserDetailResponse { 
    id: string;
    email: string;
    role: string; 
    profile_data: ProfileDataResponse;
}
// --------------------------

const SidebarProfile = () => {
    const pathname = usePathname();
    
    // State untuk data profil dan loading
    const [profile, setProfile] = useState<{ nama: string, photoUrl: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dapatkan ID Pengguna dari URL
    const pathSegments = pathname.split('/');
    const userId = pathSegments[3] || ''; 

    // --- LOGIKA DINAMIS BACK LINK ---
    // Cek segmen URL kedua (index 2) untuk menentukan jenis list
    const contextType = pathSegments[2]; // Biasanya 'sppg' atau 'sekolah'
    const backLink = contextType === 'sekolah' ? '/admin/sekolah' : '/admin/sppg'; 
    // --------------------------------

    
    // --- FETCH DATA PROFIL SPPG / SEKOLAH ---
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError("ID pengguna tidak ditemukan di URL.");
            return;
        }

        const loadProfile = async () => {
            try {
                const response = await fetchWithAuth(`/admin/users/${userId}`, { 
                    method: "GET"
                });
                const result: { data: UserDetailResponse, message: string } = await response.json();

                if (!response.ok) {
                    setError(result.message || "Gagal memuat data profil.");
                    throw new Error(result.message || "Gagal memuat data profil.");
                }

                const userData = result.data;
                const detailData = userData.profile_data;
                
                let displayName = userData.email; 

                // Logic Penentuan Nama berdasarkan Role
                if (userData.role === 'sekolah') {
                    displayName = detailData.nama_sekolah || userData.email;
                } else if (userData.role === 'sppg') {
                    displayName = detailData.nama_instansi || userData.email;
                }

                const profileData = {
                    nama: displayName, 
                    photoUrl: detailData.photo_url, 
                };

                setProfile(profileData);

            } catch (error) {
                console.error("Fetch profile error:", error);
                setError("Gagal memuat data profil.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [userId]); 
    // --- END FETCH DATA ---

    // --- RENDER LOADING / ERROR STATE ---
    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#D7762E] flex justify-center items-center rounded-r-[0.5vw] text-white satoshiBold text-[1.5vw]">
                Memuat...
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full min-h-screen bg-[#D7762E] flex justify-center items-center rounded-r-[0.5vw] text-red-100 satoshiBold text-[1vw] p-[1vw]">
                Error: {error}
            </div>
        );
    }
    // --- END RENDER LOADING / ERROR STATE ---


    return (
        <div className="w-full min-h-screen bg-[#D7762E] flex flex-col items-center py-[2vw] rounded-r-[0.5vw]">
            
            <div className="w-full px-[2vw] mb-[2vw]">
                {/* Tombol kembali ke list yang sesuai (SPPG atau Sekolah) */}
                <Link href={backLink}> 
                    <button className="text-white hover:bg-white/20 p-[0.5vw] rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[2vw] h-[2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </Link>
            </div>

            <div className="flex flex-col items-center gap-[1vw] mb-[3vw]">
                {/* Photo URL / Placeholder */}
                <div className="w-[15vw] h-[15vw] bg-[#F3F4F6] rounded-full relative overflow-hidden shrink-0">
                    {profile?.photoUrl ? (
                        <Image
                            src={profile.photoUrl}
                            alt="Foto Profil"
                            layout="fill"
                            objectFit="cover"
                        />
                    ) : (
                         <div className="w-full h-full bg-white/50 flex items-center justify-center text-[#D7762E] satoshiBold text-[4vw]">
                            {/* Placeholder/inisial */}
                        </div>
                    )}

                
                </div>
                
                <div className="text-center text-white">
                    {/* Tampilkan Nama Instansi/Sekolah */}
                    <h2 className="satoshiBold text-[1.8vw] leading-tight">{profile?.nama}</h2>
                </div>
            </div>

            

        </div>
    )
}

export default SidebarProfile;