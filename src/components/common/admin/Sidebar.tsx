'use client';

import { usePathname, useRouter } from "next/navigation"; 
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// --- Import Aset (Pastikan path benar) ---
import sppgWhite from "../../../assets/common/sidebar/sppg-white.png";
import sppgOrange from "../../../assets/common/sidebar/sppg-orange.png";
import penetapanWhite from "../../../assets/common/sidebar/penetapan-white.png";
import penetapanOrange from "../../../assets/common/sidebar/penetapan-orange.png";
import homeWhite from "../../../assets/common/sidebar/home-white.png";
import homeOrange from "../../../assets/common/sidebar/home-orange.png";
import sekolahWhite from "../../../assets/common/sidebar/sekolah-white.png";
import sekolahOrange from "../../../assets/common/sidebar/sekolah-orange.png";
import logout from "../../../assets/common/sidebar/logout.png";

// --- Interface Props ---
interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

const SidebarAdmin = ({ isOpen, toggle }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const adminItems = [
        { label: "Beranda", href: "/admin/dashboard", iconWhite: homeWhite, iconOrange: homeOrange },
        { label: "Sekolah", href: "/admin/sekolah", iconWhite: sekolahWhite, iconOrange: sekolahOrange },
        { label: "Sppg ", href: "/admin/sppg", iconWhite: sppgWhite, iconOrange: sppgOrange },
        { label: "Penetapan", href: "/admin/penetapan", iconWhite: penetapanWhite, iconOrange: penetapanOrange },
    ];

    // Tutup sidebar saat navigasi di mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            toggle();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const handleLogout = async () => {
        if (isLoggingOut) return; 
        setIsLoggingOut(true);

        try {
            const response = await fetch("/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: getCookie("refreshToken") }),
            });
            if (!response.ok) console.warn("Backend logout failed");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            document.cookie = "accessToken=; Max-Age=0; path=/;";
            document.cookie = "refreshToken=; Max-Age=0; path=/;";
            document.cookie = "userRole=; Max-Age=0; path=/;";
            localStorage.removeItem("user");
            router.push("/login"); // Redirect ke login umum atau admin login
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
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={toggle}
                aria-hidden="true"
            ></div>

            {/* --- Sidebar Container --- */}
            <div className={`
                fixed lg:static top-0 left-0 h-screen lg:h-full
                w-72 lg:w-auto 
                bg-[#E87E2F] 
                transition-transform duration-300 ease-in-out z-50
                flex flex-col overflow-y-auto overflow-x-hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
                lg:rounded-tr-[4vw] lg:rounded-br-[4vw]
            `}
            style={{ boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)" }}
            >
                {/* --- Tombol Tutup (Mobile Only) --- */}
                <div className="flex justify-end p-4 lg:hidden">
                    <button onClick={toggle} className="text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* --- Profile / Header Section --- */}
                <div className="w-full py-6 lg:py-[1vw] flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-3 lg:gap-[1vw]">
                    <div className="w-20 h-20 lg:w-[10vw] lg:h-[10vw] bg-white rounded-full shrink-0" />
                    <div className="flex flex-col px-4 lg:px-[1vw]">
                        <h1 className="text-xl lg:text-[1.8vw] leading-tight">Administrator</h1>
                    </div>
                </div>

                {/* --- Menu Items --- */}
                <div className="flex flex-col gap-2 lg:gap-[0.5vw] mt-4 lg:mt-[1vw] pr-4 lg:pr-[2vw]">
                    {adminItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);

                        return (
                            <Link key={index} href={item.href} className="block">
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

                {/* --- Logout Button --- */}
                <div className="flex flex-row justify-center items-center px-4 lg:px-[2vw] mt-auto mb-8 lg:mb-[2vw] border-t border-white lg:border-t-[0.1vw] pt-4 lg:pt-[1vw]">
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
        </>
    )
}
export default SidebarAdmin;