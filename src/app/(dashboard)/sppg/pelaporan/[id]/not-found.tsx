'use client';

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#E87E2F]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E87E2F]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="flex flex-col items-center text-center gap-6 max-w-lg relative z-10">
                
                <div className="relative py-4">
                    <div className="text-[30vw] md:text-[20vw] lg:text-[12vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E87E2F] to-[#E87E2F]/30 leading-none select-none">
                        404
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-2xl flex items-center justify-center">
                            <span className="text-4xl md:text-5xl">😵</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-3">
                    <h2 className="satoshiBold text-2xl md:text-3xl text-gray-800">
                        Laporan Tidak Ditemukan
                    </h2>
                    <p className="satoshiMedium text-base md:text-lg text-gray-500 max-w-sm">
                        Data pelaporan yang kamu cari tidak ada atau sudah dihapus.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Link
                        href="/sppg/pelaporan"
                        className="flex items-center justify-center gap-2 bg-[#E87E2F] text-white satoshiBold text-base px-8 py-3 rounded-xl hover:bg-[#D7762E] transition-all"
                    >
                        📋 Ke Daftar Pelaporan
                    </Link>
                    
                    <Link
                        href="/sppg/dashboard"
                        className="flex items-center justify-center gap-2 bg-white text-[#E87E2F] border-2 border-[#E87E2F]/30 satoshiBold text-base px-8 py-3 rounded-xl hover:border-[#E87E2F] transition-all"
                    >
                        🏠 Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
