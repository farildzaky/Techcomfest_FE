'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/api";

// --- Import Aset ---
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

// --- Interfaces ---
interface DisabilityType {
    jenis_disabilitas: string;
    jumlah_siswa: number;
}

interface SchoolProfileData {
    nama_sekolah: string;
    total_siswa: number;
    disability_types: DisabilityType[];
    photo_url: string | null;
}

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [profile, setProfile] = useState<{
        name: string;
        categories: string;
        studentCount: number;
        photoUrl: string | null;
    }>({
        name: "",
        categories: "",
        studentCount: 0,
        photoUrl: null
    });

    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            toggle();
        }

        const loadProfile = async () => {
            try {
                const response = await fetchWithAuth("/profile", { method: "GET" });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && result.data.profile_data) {
                        const data = result.data.profile_data as SchoolProfileData;
                        
                        const categoriesFormatted = data.disability_types
                            ? data.disability_types.map(d => d.jenis_disabilitas).join(", ")
                            : '-';

                        setProfile({
                            name: data.nama_sekolah || "Nama Sekolah",
                            categories: categoriesFormatted,
                            studentCount: data.total_siswa || 0,
                            photoUrl: data.photo_url
                        });
                    }
                }
            } catch (err: any) {
                console.error("Fetch profile error:", err);
            }
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const menuItems = [
        { label: "Beranda", href: "/sekolah/dashboard", iconWhite: homeWhite, iconOrange: homeOrange },
        { label: "Menu MBG", href: "/sekolah/menu-mbg", iconWhite: menuWhite, iconOrange: menuOrange },
        { label: "Scan Nutrisi", href: "/sekolah/scan-nutrisi", iconWhite: scanWhite, iconOrange: scanOrange },
        { label: "Pelaporan", href: "/sekolah/pelaporan", iconWhite: reportWhite, iconOrange: reportOrange },
        { label: "Riwayat Menu", href: "/sekolah/riwayat-menu", iconWhite: riwayatWhite, iconOrange: riwayatOrange },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await fetch("/auth/logout", { method: "POST" });
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

    return (
        <>
            {/* --- Overlay Mobile --- */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={toggle}
                aria-hidden="true"
            ></div>

            {/* --- Container Sidebar Utama --- */}
            <div
                className={`
                    fixed lg:sticky top-0 left-0 h-screen
                    w-72 lg:w-[18vw]
                    bg-[#E87E2F]
                    transition-transform duration-300 ease-in-out z-50
                    flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
                    lg:rounded-tr-[4vw] lg:rounded-br-[4vw]
                `}
                style={{
                    boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)"
                }}
            >
                {/* --- 1. BAGIAN ATAS (STATIC - TIDAK SCROLL) --- */}
                <div className="flex-shrink-0 bg-[#E87E2F] z-10 lg:rounded-tr-[4vw]"> {/* shrink-0 agar tidak mengecil */}
                    
                    {/* Tombol Tutup (Mobile) */}
                    <div className="flex justify-end p-4 lg:hidden">
                        <button onClick={toggle} className="text-white p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* PROFILE SECTION */}
                    <Link href="/sekolah/profile/informasi-sekolah" className="w-full block group/profile">
                        <div className="w-full py-6 lg:py-[2vw] px-4 lg:px-0 flex flex-col items-center justify-center bg-[#E87E2F] satoshiBold text-white text-center gap-3 lg:gap-[1vw] relative cursor-pointer hover:bg-[#c26a29] transition-colors duration-300 lg:rounded-tr-[4vw]">
                            
                            <div className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[1.5vw] opacity-70 group-hover/profile:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>

                            <div className="w-24 h-24 lg:w-[10vw] lg:h-[10vw] bg-white rounded-full shrink-0 overflow-hidden relative shadow-md">
                                {profile.photoUrl ? (
                                    <Image 
                                        src={profile.photoUrl}
                                        alt="Profil Sekolah"
                                        fill 
                                        sizes="(max-width: 768px) 30vw, 15vw"
                                        className="object-cover"
                                        unoptimized={true} 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[#D7762E]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 lg:w-[5vw] lg:h-[5vw]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col px-4 lg:px-[1vw] w-full">
                                <h1 className="text-lg lg:text-[1.8vw] leading-tight break-words w-full line-clamp-2 min-h-[3rem] lg:min-h-[2.2vw]">
                                    {profile.name}
                                </h1>
                                <div className="text-sm lg:text-[1.1vw] opacity-90 mt-2 lg:mt-[0.5vw]">
                                    <p className="line-clamp-1 w-full mx-auto">{profile.categories || "Jenis Sekolah"}</p>
                                    <p>{profile.studentCount} Siswa</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* --- 2. BAGIAN TENGAH (SCROLLABLE MENU) --- */}
                {/* flex-1 akan mengisi sisa ruang, overflow-y-auto memungkinkan scroll hanya di area ini */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 lg:gap-[0.5vw] mt-4 lg:mt-[0vw] pr-4 lg:pr-[2vw] pb-4">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);

                        return (
                            <Link 
                                key={index} 
                                href={item.href}
                                className="block flex-shrink-0" // Mencegah item mengecil
                            >
                                <div className="relative flex items-center p-3 lg:p-[1.2vw] cursor-pointer rounded-r-full lg:rounded-r-[2vw] group overflow-hidden">
                                    <div 
                                        className={`
                                            absolute top-0 left-0 h-full w-full bg-white rounded-r-full lg:rounded-r-[2vw]
                                            transition-transform duration-500 ease-in-out
                                            ${isActive ? "translate-x-0" : "-translate-x-full"}
                                        `}
                                    />
                                    <div className={`
                                        relative z-10 flex items-center gap-4 lg:gap-[1.5vw] transition-colors duration-300
                                        ${isActive ? "text-[#D7762E]" : "text-white group-hover:text-white/80"}
                                    `}>
                                        <Image
                                            src={isActive ? item.iconOrange : item.iconWhite}
                                            alt={item.label}
                                            className="w-5 h-5 lg:w-[2vw] lg:h-[2vw] object-contain transition-transform duration-300"
                                        />
                                        <span className="text-base lg:text-[1.4vw] satoshiBold whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* --- 3. BAGIAN BAWAH (STATIC - TIDAK SCROLL) --- */}
                <div className="flex-shrink-0 border-t border-white lg:border-t-[0.1vw] bg-[#E87E2F] lg:rounded-br-[4vw]">
                    <div className="flex flex-row justify-center items-center px-4 lg:px-[2vw] py-6 lg:py-[1vw]">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex flex-row gap-2 lg:gap-[0.5vw] items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Image
                                src={logout}
                                alt="Logout"
                                className="w-5 h-5 lg:w-[2vw] lg:h-[2vw] object-contain"
                            />
                            <div className="satoshiBold text-base lg:text-[1.4vw] text-white">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Sidebar;