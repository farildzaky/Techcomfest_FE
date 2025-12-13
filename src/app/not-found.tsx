'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import logoOrange from "@/src/assets/logo-orange.png";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-72 h-72 bg-[#E87E2F]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E87E2F]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-[#E87E2F]/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-[#E87E2F]/15 rounded-full blur-lg animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />

            <div className={`flex flex-col items-center text-center gap-6 max-w-lg relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                <Link href="/" className="flex items-center gap-3 mb-2 hover:scale-110 transition-transform duration-300">
                    <Image
                        src={logoOrange}
                        alt="Inkluzi Logo"
                        width={868}
                        height={870}
                        className="w-10 h-10 md:w-12 md:h-12"
                    />
                    <span className="satoshiBold text-2xl md:text-3xl text-[#E87E2F]">INKLUZI</span>
                </Link>

                <div className="relative py-4">
                    <div className="text-[35vw] md:text-[25vw] lg:text-[15vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E87E2F] to-[#E87E2F]/30 leading-none select-none animate-pulse" style={{ animationDuration: '2s' }}>
                        404
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full shadow-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                                <div className="text-5xl md:text-6xl">😵</div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#E87E2F] rounded-full animate-ping" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="satoshiBold text-2xl md:text-3xl lg:text-4xl text-gray-800">
                        Waduh, Nyasar! 🗺️
                    </h2>
                    <p className="satoshiMedium text-base md:text-lg text-gray-500 max-w-sm leading-relaxed">
                        Halaman yang kamu cari kayaknya lagi liburan atau memang nggak ada. Yuk balik ke jalan yang benar!
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-3 bg-gradient-to-r from-[#E87E2F] to-[#D7762E] text-white satoshiBold text-base md:text-lg px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-orange-200 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                    >
                        <span className="text-xl group-hover:animate-bounce">🏠</span>
                        Ke Beranda
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center justify-center gap-3 bg-white text-[#E87E2F] border-2 border-[#E87E2F]/30 satoshiBold text-base md:text-lg px-8 py-4 rounded-2xl hover:border-[#E87E2F] hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">👈</span>
                        Balik
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 w-full">
                    <p className="satoshiMedium text-sm text-gray-400 mb-4">Atau mau kemana nih?</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/login" className="satoshiMedium text-sm px-4 py-2 rounded-full bg-orange-50 text-[#E87E2F] hover:bg-orange-100 transition-colors">
                            🔐 Login
                        </Link>
                        <Link href="/register" className="satoshiMedium text-sm px-4 py-2 rounded-full bg-orange-50 text-[#E87E2F] hover:bg-orange-100 transition-colors">
                            ✨ Daftar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
