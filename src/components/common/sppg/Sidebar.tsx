'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/src/lib/api";

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

// Tambahkan props untuk kontrol responsif
interface SidebarSppgProps {
    isOpen: boolean;
    toggle: () => void;
}

const SidebarSppg = ({ isOpen, toggle }: SidebarSppgProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const [profile, setProfile] = useState<ProfileData>({
        nama_instansi: "",
        photo_url: null
    });

    const [schoolCount, setSchoolCount] = useState(0);

    useEffect(() => {
        // Tutup sidebar saat navigasi di mobile
        if (isOpen && window.innerWidth < 1024) {
            toggle();
        }

        const fetchData = async () => {
            try {
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

                const resSchools = await fetchWithAuth("/sppg/schools?page=1&limit=1");
                if (resSchools.ok) {
                    const jsonSchools = await resSchools.json();
                    if (jsonSchools.success && Array.isArray(jsonSchools.data) && jsonSchools.data.length > 0) {
                        setSchoolCount(jsonSchools.data[0].total_schools || 0);
                    } else {
                        setSchoolCount(0);
                    }
                }

            } catch (error) {
                console.error("Gagal mengambil data sidebar:", error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // Tambahkan pathname agar update saat pindah halaman

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
            const response = await fetch("/api/auth/logout", { method: "POST" });
            console.log("Logout response:", response.status);
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
        <>
            {/* --- Overlay Mobile --- */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={toggle}
                aria-hidden="true"
            ></div>

            {/* --- Sidebar Container --- */}
            <div
                className={`
                    fixed lg:sticky top-0 left-0 h-screen
                    w-72 lg:w-auto 
                    bg-[#E87E2F]
                    transition-transform duration-300 ease-in-out z-50
                    flex flex-col overflow-y-auto overflow-x-hidden
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
                    lg:rounded-tr-[4vw] lg:rounded-br-[4vw] 
                `}
                style={{
                    boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)"
                }}
            >
                {/* --- Tombol Tutup (Mobile Only) --- */}
                <div className="flex justify-end p-4 lg:hidden">
                    <button onClick={toggle} className="text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* --- PROFILE SECTION --- */}
                <Link href="/sppg/profile/informasi-instansi" className="w-full block group/profile">
                    <div className="w-full py-6 lg:py-[2vw] px-4 lg:px-0 flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-3 lg:gap-[1vw] relative cursor-pointer hover:bg-[#c26a29] transition-colors duration-300">

                        {/* Icon Chevron */}
                        <div className="absolute top-4 right-4 lg:top-[1.5vw] lg:right-[1.5vw]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>

                        {/* Foto Profil */}
                        <div className="w-24 h-24 lg:w-[10vw] lg:h-[10vw] bg-white rounded-full shrink-0 overflow-hidden relative shadow-md">
                            {isLoadingProfile ? (
                                <div className="w-full h-full bg-gray-300 animate-pulse"></div>
                            ) : profile.photo_url ? (
                                <Image
                                    src={profile.photo_url}
                                    alt="Profil SPPG"
                                    fill
                                    sizes="(max-width: 768px) 30vw, 10vw"
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

                        {/* Informasi Teks */}
                        <div className="flex flex-col px-4 lg:px-[1vw] w-full items-center">
                            {isLoadingProfile ? (
                                <>
                                    <div className="h-6 lg:h-[2vw] w-32 lg:w-[14vw] bg-white/30 rounded animate-pulse mb-2 lg:mb-[0.5vw]"></div>
                                    <div className="h-4 lg:h-[1.2vw] w-20 lg:w-[8vw] bg-white/30 rounded animate-pulse"></div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-lg lg:text-[1.8vw] leading-tight break-words max-w-[90%] lg:max-w-[18vw] line-clamp-2 min-h-[3rem] lg:min-h-[2.2vw]">
                                        {profile.nama_instansi}
                                    </h1>

                                    <div className="text-sm lg:text-[1.1vw] opacity-90 mt-2 lg:mt-[0.5vw]">
                                        {schoolCount} Sekolah
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Link>

                {/* --- MENU ITEMS --- */}
                <div className="flex flex-col gap-2 lg:gap-[0.5vw] mt-4 lg:mt-[1vw] pr-4 lg:pr-[2vw]">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className="block"
                            >
                                <div className="relative flex items-center p-3 lg:p-[1.2vw] cursor-pointer rounded-r-full lg:rounded-r-[2vw] group overflow-hidden">
                                    {/* Animasi Background Putih */}
                                    <div
                                        className={`
                                            absolute top-0 left-0 h-full w-full bg-white rounded-r-full lg:rounded-r-[2vw]
                                            transition-transform duration-500 ease-in-out
                                            ${isActive ? "translate-x-0" : "-translate-x-full"}
                                        `}
                                    />

                                    {/* Konten Menu */}
                                    <div className={`
                                        relative z-10 flex items-center gap-4 lg:gap-[1.5vw] transition-colors duration-300
                                        ${isActive ? "text-[#D7762E]" : "text-white group-hover:text-white/80"}
                                    `}>
                                        <Image
                                            src={isActive ? item.iconOrange : item.iconWhite}
                                            alt={item.label}
                                            width={32}
                                            height={32}
                                            sizes="(max-width: 1024px) 20px, 2vw"
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

                {/* --- LOGOUT BUTTON --- */}
                <div className="flex flex-row justify-center items-center px-4 lg:px-[2vw] mt-auto mb-8 lg:mb-[2vw] border-t border-white lg:border-t-[0.1vw] pt-4 lg:pt-[1vw]">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex flex-row gap-2 lg:gap-[0.5vw] items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Image
                            src={logout}
                            alt="Logout"
                            width={32}
                            height={32}
                            sizes="(max-width: 1024px) 20px, 2vw"
                            className="w-5 h-5 lg:w-[2vw] lg:h-[2vw] object-contain"
                        />
                        <div className="satoshiBold text-base lg:text-[1.4vw] text-white">
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}
export default SidebarSppg;