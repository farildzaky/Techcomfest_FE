'use client';

import { usePathname, useRouter } from "next/navigation"; 
import Link from "next/link"; 
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchWithAuth } from '@/src/lib/api'; 
// --- ASSET IMPORTS ---
import scanWhite from "../../assets/common/sidebar/scan-white.png";
import scanOrange from "../../assets/common/sidebar/scan-orange.png";
import reportWhite from "../../assets/common/sidebar/report-white.png";
import reportOrange from "../../assets/common/sidebar/report-orange.png";
import homeWhite from "../../assets/common/sidebar/home-white.png";
import homeOrange from "../../assets/common/sidebar/home-orange.png";
import menuWhite from "../../assets/common/sidebar/menu-white.png";
import menuOrange from "../../assets/common/sidebar/menu-orange.png";
import riwayatWhite from "../../assets/common/sidebar/riwayat-white.png";
import riwayatOrange from "../../assets/common/sidebar/riwayat-orange.png";
import logout from "../../assets/common/sidebar/logout.png";

// --- INTERFACE PROFIL SEKOLAH ---
interface DisabilityType {
    jenis_disabilitas: string;
    jumlah_siswa: number;
}
interface SchoolProfileData {
    nama_sekolah: string;
    jenis_sekolah: string;
    total_siswa: number;
    disability_types: DisabilityType[];
    photo_url: string | null; 
}
// ------------------------------


const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);


    // --- FETCH DATA PROFIL SEKOLAH ---
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoadingProfile(true);
                const response = await fetchWithAuth("/profile", {
                    method: "GET"
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.message || "Gagal memuat data profil.");

                const profileData = result.data.profile_data as SchoolProfileData;
                
                const categoriesFormatted = profileData.disability_types
                    ? profileData.disability_types.map(d => d.jenis_disabilitas).join(" | ")
                    : 'N/A';

                setProfile({
                    name: profileData.nama_sekolah,
                    categories: categoriesFormatted,
                    studentCount: profileData.total_siswa,
                    photoUrl: profileData.photo_url 
                });

            } catch (err: any) {
                console.error("Fetch profile error:", err);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);
    // --- END FETCH DATA ---

    const menuItems = [
        { 
            label: "Beranda", 
            href: "/sekolah/dashboard", 
            iconWhite: homeWhite, 
            iconOrange: homeOrange 
        },
        { 
            label: "Menu MBG", 
            href: "/sekolah/menu-mbg", 
            iconWhite: menuWhite, 
            iconOrange: menuOrange 
        },
        { 
            label: "Scan Nutrisi", 
            href: "/sekolah/scan-nutrisi", 
            iconWhite: scanWhite, 
            iconOrange: scanOrange 
        },
        { 
            label: "Pelaporan", 
            href: "/sekolah/pelaporan", 
            iconWhite: reportWhite, 
            iconOrange: reportOrange
        },
        { 
            label: "Riwayat Menu", 
            href: "/sekolah/riwayat-menu",
            iconWhite: riwayatWhite, 
            iconOrange: riwayatOrange 
        },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);

        try {
            await fetch("/auth/logout", {
                method: "POST",
            });
            
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            document.cookie = "accessToken=; Max-Age=0; path=/;";
            document.cookie = "refreshToken=; Max-Age=0; path=/;";
            document.cookie = "userRole=; Max-Age=0; path=/;";
            localStorage.removeItem("user");
            
            router.push("/login");
        }
    };

    // --- SKELETON LOADING STATE ---
    if (loadingProfile) {
        return (
            <div className="min-h-screen flex flex-col bg-[#E87E2F] rounded-tr-[4vw] rounded-br-[4vw] overflow-hidden sticky top-0"
                style={{ 
                    boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)" 
                }}
            >
                {/* Profile Section Skeleton */}
                <div className="w-full py-[1vw] flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-[1vw] animate-pulse">
                    {/* Avatar Skeleton */}
                    <div className="w-[10vw] h-[10vw] bg-gray-400 rounded-full shrink-0" />
                    
                    <div className="flex flex-col px-[1vw] gap-[0.5vw] items-center">
                        {/* Name Line Skeleton */}
                        <div className="h-[1.8vw] w-[12vw] bg-gray-400 rounded" />
                        
                        <div className="text-[1.1vw] opacity-90 mt-[0.5vw] flex flex-col gap-[0.2vw] items-center">
                            {/* Category Line Skeleton */}
                            <div className="h-[1vw] w-[10vw] bg-gray-400 rounded" />
                            {/* Student Count Line Skeleton */}
                            <div className="h-[1vw] w-[6vw] bg-gray-400 rounded" />
                        </div>
                    </div>
                </div>

                {/* Menu Items Skeleton */}
                <div className="flex flex-col gap-[0.5vw] mt-[1vw] pr-[2vw] px-[1vw]">
                    {menuItems.map((_, i) => (
                        <div key={i} className="flex items-center p-[1.2vw] rounded-r-[2vw]">
                            <div className="h-[1.4vw] w-full bg-gray-400/50 rounded" />
                        </div>
                    ))}
                </div>

                {/* Logout Skeleton */}
                <div className="flex flex-row justify-center items-center px-[2vw] mt-auto mb-[2vw] border-t-[0.1vw] border-white pt-[1vw]">
                     <div className="h-[1.5vw] w-[80%] bg-gray-400/50 rounded" />
                </div>
            </div>
        );
    }
    // --- END SKELETON LOADING STATE ---


    return (
        <div className=" min-h-screen flex flex-col bg-[#E87E2F] rounded-tr-[4vw] rounded-br-[4vw] overflow-hidden sticky top-0"
            style={{ 
                boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)" 
            }}
        >
            
            {/* --- Profile Section --- */}
            <div className="w-full py-[1vw] flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-[1vw]">
                
                {/* Photo URL / Placeholder */}
                <div className="w-[10vw] h-[10vw] bg-white rounded-full shrink-0 relative overflow-hidden">
                    {profile?.photoUrl ? (
                        <Image
                            src={profile.photoUrl}
                            alt="Foto Profil Sekolah"
                            layout="fill"
                            objectFit="cover" 
                            className="rounded-full"
                        />
                    ) : (
                         <div className="w-full h-full bg-white flex items-center justify-center text-[#D7762E] satoshiBold text-[3vw]">
                             {/* Inisial atau ikon default */}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col px-[1vw]">
                    {/* Data Dinamis */}
                    <h1 className="text-[1.8vw] leading-tight">{profile?.name || "Nama Sekolah"}</h1>
                    <div className="text-[1.1vw] opacity-90 mt-[0.5vw]">
                        <p>{profile?.categories || "Jenis Disabilitas"}</p>
                        <p>{profile?.studentCount || 0} Siswa</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-[0.5vw] mt-[1vw] pr-[2vw]">
                
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                        <Link 
                            key={index} 
                            href={item.href}
                            className="block" 
                        >
                            <div className="relative flex items-center p-[1.2vw] cursor-pointer rounded-r-[2vw] group">
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full bg-white rounded-r-[2vw]
                                        transition-all duration-500 ease-in-out
                                        ${isActive ? "w-full" : "w-0"}
                                    `}
                                />

                                <div className={`
                                    relative z-10 flex items-center gap-[1.5vw] transition-colors duration-300
                                    ${isActive ? "text-[#D7762E]" : "text-white group-hover:text-white/80"}
                                `}>
                                    <Image
                                        src={isActive ? item.iconOrange : item.iconWhite}
                                        alt={item.label}
                                        className="w-[2vw] h-[2vw] object-contain transition-transform duration-300"
                                    />
                                    <span className="text-[1.4vw] satoshiBold whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* logout (Tombol aksi) */}
                        <div className="flex flex-row justify-center items-center px-[2vw] mt-auto mb-[2vw] border-t-[0.1vw] border-white pt-[1vw]">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex flex-row gap-[0.5vw] items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Image
                        src={logout}
                        alt="Logout"
                        className="w-[2vw] h-[2vw] object-contain"
                    />
                    <div className="satoshiBold text-[1.4vw] text-white">
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </div>
                </button>
            </div>
        </div>
    )
}
export default Sidebar;