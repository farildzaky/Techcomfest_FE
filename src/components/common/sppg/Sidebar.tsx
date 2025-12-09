'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/api"; 

// Assets
import scanWhite from "../../../assets/common/sidebar/scan-white.png";
import scanOrange from "../../../assets/common/sidebar/scan-orange.png";
import reportWhite from "../../../assets/common/sidebar/report-white.png";
import reportOrange from "../../../assets/common/sidebar/report-orange.png";
import homeWhite from "../../../assets/common/sidebar/home-white.png";
import homeOrange from "../../../assets/common/sidebar/home-orange.png";
import menuWhite from "../../../assets/common/sidebar/menu-white.png";
import menuOrange from "../../../assets/common/sidebar/menu-orange.png";
import logout from "../../../assets/common/sidebar/logout.png";

interface ProfileData {
    nama_instansi: string;
    photo_url: string | null;
    alamat?: string;
    wilayah_kerja?: string;
}

const SidebarSppg = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // State Profile
    const [profile, setProfile] = useState<ProfileData>({
        nama_instansi: "", 
        photo_url: null
    });

    // State Count (Dinamis)
    const [schoolCount, setSchoolCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0); // Masih statis/dummy

    // --- FETCH DATA (Profile & Total Schools) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Profile
                const resProfile = await fetchWithAuth("/profile");
                if (resProfile.ok) {
                    const json = await resProfile.json();
                    if (json.success && json.data && json.data.profile_data) {
                        setProfile({
                            nama_instansi: json.data.profile_data.nama_instansi || "-",
                            photo_url: json.data.profile_data.photo_url || null,
                            alamat: json.data.profile_data.alamat,
                            wilayah_kerja: json.data.profile_data.wilayah_kerja
                        });
                    }
                }

                // 2. Fetch Total Schools (Ambil limit 1 saja cukup untuk metadata)
                const resSchools = await fetchWithAuth("/sppg/schools?page=1&limit=1");
                if (resSchools.ok) {
                    const jsonSchools = await resSchools.json();
                    // Struktur: { data: [{ total_schools: 2, ... }, ...] }
                    if (jsonSchools.success && Array.isArray(jsonSchools.data) && jsonSchools.data.length > 0) {
                        // Ambil total_schools dari item pertama
                        setSchoolCount(jsonSchools.data[0].total_schools || 0);
                    } else {
                        setSchoolCount(0);
                    }
                }

            } catch (error) {
                console.error("Gagal mengambil data sidebar:", error);
            }
        };

        fetchData();
    }, []);

    const menuItems = [
        { 
            label: "Beranda", 
            href: "/sppg/dashboard", 
            iconWhite: homeWhite, 
            iconOrange: homeOrange 
        },
        { 
            label: "Menu MBG", 
            href: "/sppg/menu-mbg", 
            iconWhite: menuWhite, 
            iconOrange: menuOrange 
        },
        { 
            label: "Pelaporan", 
            href: "/sppg/pelaporan", 
            iconWhite: reportWhite, 
            iconOrange: reportOrange
        },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return; 
        setIsLoggingOut(true);

        try {
            const response = await fetch("/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh_token: getCookie("refreshToken")
                }),
            });

            if (!response.ok) {
                console.warn("Backend logout failed, but clearing local session anyway");
            }
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

    const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#E87E2F] rounded-tr-[4vw] rounded-br-[4vw] overflow-hidden sticky top-0"
            style={{ 
                boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)" 
            }}
        >
            
            {/* --- Profile Section --- */}
            <Link href="/sppg/profile/informasi-instansi" className="w-full block">
                <div className="w-full py-[2vw] flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-[1vw] relative cursor-pointer hover:bg-[#c26a29] transition-colors duration-300">
                    
                    <div className="absolute top-[1.5vw] right-[1.5vw]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[1.5vw] h-[1.5vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>

                    {/* Foto Profil */}
                    <div className="w-[10vw] h-[10vw] bg-white rounded-full shrink-0 overflow-hidden relative border-[0.2vw] border-white">
                        {profile.photo_url ? (
                            <Image 
                                src={profile.photo_url}
                                alt="Profil SPPG"
                                fill // Menggunakan fill agar responsif
                                sizes="(max-width: 768px) 100vw, 10vw"
                                className="object-cover"
                                unoptimized={true} 
                            />
                        ) : (
                            // Default Avatar (Jika tidak ada foto)
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[#D7762E]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[5vw] h-[5vw]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col px-[1vw]">
                        <h1 className="text-[1.8vw] leading-tight break-words max-w-[18vw] line-clamp-2 min-h-[2.2vw]">
                            {profile.nama_instansi}
                        </h1>
                        
                        <div className="text-[1.1vw] opacity-90 mt-[0.5vw]">
                            {/* Menampilkan Total Sekolah Dinamis */}
                            {schoolCount} Sekolah | {studentCount} Siswa 
                        </div>
                    </div>
                </div>
            </Link>

            {/* --- Menu Items --- */}
            <div className="flex flex-col gap-[0.5vw] mt-[1vw] pr-[2vw]">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                        <Link 
                            key={index} 
                            href={item.href}
                            className="block" 
                        >
                            <div className="relative flex items-center p-[1.2vw] cursor-pointer rounded-r-[2vw] group overflow-hidden">
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full w-full bg-white rounded-r-[2vw]
                                        transition-transform duration-500 ease-in-out
                                        ${isActive ? "translate-x-0" : "-translate-x-full"}
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

            {/* --- Logout Section --- */}
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
export default SidebarSppg;