'use client';

import { usePathname, useRouter } from "next/navigation"; 
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import sppgWhite from "../../../assets/common/sidebar/sppg-white.png";
import sppgOrange from "../../../assets/common/sidebar/sppg-orange.png";
import penetapanWhite from "../../../assets/common/sidebar/penetapan-white.png";
import penetapanOrange from "../../../assets/common/sidebar/penetapan-orange.png";
import homeWhite from "../../../assets/common/sidebar/home-white.png";
import homeOrange from "../../../assets/common/sidebar/home-orange.png";
import sekolahWhite from "../../../assets/common/sidebar/sekolah-white.png";
import sekolahOrange from "../../../assets/common/sidebar/sekolah-orange.png";
import logout from "../../../assets/common/sidebar/logout.png";

const SidebarAdmin = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);



    const adminItems = [
        {
            label: "Beranda",
            href: "/admin/dashboard",
            iconWhite: homeWhite,
            iconOrange: homeOrange
        },
        {
            label: "Sekolah",
            href: "/admin/sekolah",
            iconWhite: sekolahWhite,
            iconOrange: sekolahOrange
        },
        {
            label: "Sppg ",
            href: "/admin/sppg",
            iconWhite: sppgWhite,
            iconOrange: sppgOrange
        },
        {
            label: "Penetapan",
            href: "/admin/penetapan",
            iconWhite: penetapanWhite,
            iconOrange: penetapanOrange
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

            router.push("/admin/login");
        }
    };

    const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    return (
        <div className=" min-h-screen flex flex-col bg-[#E87E2F] rounded-tr-[4vw] rounded-br-[4vw] overflow-hidden sticky top-0"
            style={{
                boxShadow: "5px 10px 17.8px 0px rgba(0, 0, 0, 0.25)"
            }}
        >

            <div className="w-full py-[1vw] flex flex-col items-center justify-center bg-[#D7762E] satoshiBold text-white text-center gap-[1vw]">
                <div className="w-[10vw] h-[10vw] bg-white rounded-full shrink-0" />
                <div className="flex flex-col px-[1vw]">
                    <h1 className="text-[1.8vw] leading-tight">Administrator</h1>

                </div>
            </div>

            <div className="flex flex-col gap-[0.5vw] mt-[1vw] pr-[2vw]">

                {adminItems.map((item, index) => {
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
export default SidebarAdmin;