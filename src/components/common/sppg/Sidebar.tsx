'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import scanWhite from "../../../assets/common/sidebar/scan-white.png";
import scanOrange from "../../../assets/common/sidebar/scan-orange.png";
import reportWhite from "../../../assets/common/sidebar/report-white.png";
import reportOrange from "../../../assets/common/sidebar/report-orange.png";
import homeWhite from "../../../assets/common/sidebar/home-white.png";
import homeOrange from "../../../assets/common/sidebar/home-orange.png";
import menuWhite from "../../../assets/common/sidebar/menu-white.png";
import menuOrange from "../../../assets/common/sidebar/menu-orange.png";
import logout from "../../../assets/common/sidebar/logout.png";

const SidebarSppg = () => {
    const pathname = usePathname();
        const router = useRouter();
        const [isLoggingOut, setIsLoggingOut] = useState(false);

    const studentCount = 400;
    const schoolCount = 5;

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
        if (isLoggingOut) return; // Prevent double click
        
        setIsLoggingOut(true);

        try {
            // 1. Panggil API logout backend
            const response = await fetch("https://api.inkluzi.my.id/api/v1/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh_token: getCookie("refreshToken")
                }),
            });

            // Walaupun API gagal, tetap clear cookies client-side
            if (!response.ok) {
                console.warn("Backend logout failed, but clearing local session anyway");
            }

        } catch (error) {
            console.error("Logout error:", error);
            // Tetap lanjut clear cookies meskipun API error
        } finally {
            // 2. Hapus semua cookies client-side
            document.cookie = "accessToken=; Max-Age=0; path=/;";
            document.cookie = "refreshToken=; Max-Age=0; path=/;";
            document.cookie = "userRole=; Max-Age=0; path=/;";
            
            // 3. Hapus data localStorage
            localStorage.removeItem("user");
            
            // 4. Redirect ke login
            router.push("/login");
        }
    };

    // Helper function untuk ambil cookie
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
                    
                    {/* Ikon Panah Kanan */}
                    <div className="absolute top-[1.5vw] right-[1.5vw]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[1.5vw] h-[1.5vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>

                    <div className="w-[10vw] h-[10vw] bg-white rounded-full shrink-0" />
                    <div className="flex flex-col px-[1vw]">
                        <h1 className="text-[1.8vw] leading-tight">SPPG <br/> Malang</h1>
                        <div className="text-[1.1vw] opacity-90 mt-[0.5vw]">
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
                            {/* Tambahkan overflow-hidden disini agar animasi sliding tidak bocor keluar container */}
                            <div className="relative flex items-center p-[1.2vw] cursor-pointer rounded-r-[2vw] group overflow-hidden">
                                
                                {/* Background Putih dengan Animasi Slide */}
                                <div 
                                    className={`
                                        absolute top-0 left-0 h-full w-full bg-white rounded-r-[2vw]
                                        transition-transform duration-500 ease-in-out
                                        ${isActive ? "translate-x-0" : "-translate-x-full"}
                                    `}
                                />

                                {/* Konten Menu */}
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