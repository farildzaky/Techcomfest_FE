'use client'
import Link from "next/link";
import Image from "next/image";
import logoWhite from "../../assets/logo-white.png";

const Register = () => {
    return (
        <section className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-x-hidden">

            <div className="flex flex-col w-full md:w-[60vw] md:h-screen items-center justify-center relative px-6 py-10 md:px-[8vw] gap-8 md:gap-[3vw]">

                <Link href="/" className="fixed md:absolute top-4 left-4 md:top-[2vw] md:left-[2vw] hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-8 h-8 md:w-[3vw] md:h-[3vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>

                <div className="flex flex-col text-[#B56225] items-center leading-none gap-2 md:gap-[0.5vw] md:mt-0">
                    <h1 className="satoshiBold text-4xl md:text-[4.5vw]">Daftar</h1>
                    <p className="satoshiMedium text-base md:text-[1.5vw]">Daftar untuk Bergabung!</p>
                </div>

                <div className="w-full max-w-md md:max-w-none flex flex-col gap-6 md:gap-[2vw]">
                    <p className="text-black satoshiMedium text-sm md:text-[1.2vw] text-center md:text-left">
                        Pilih sesuai peran Anda
                    </p>

                    <div className="flex flex-col gap-2 md:gap-[0.5vw]">
                        <Link href="/register/sekolah" className="w-full ">
                            <button className="w-full bg-[#D9833E] cursor-pointer text-white satoshiBold text-lg md:text-[1.5vw] py-3 md:py-[1vw] rounded-xl md:rounded-[1vw] hover:bg-[#c27233] transition-colors shadow-md">
                                Masuk sebagai Sekolah
                            </button>
                        </Link>
                        <p className="text-black satoshiMedium text-xs md:text-[1vw] text-center opacity-80">
                            Untuk mengelola menu MBG, analisis gizi, & pelaporan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 md:gap-[0.5vw]">
                        <Link href="/register/sppg" className="w-full">
                            <button className="w-full bg-[#D9833E] cursor-pointer text-white satoshiBold text-lg md:text-[1.5vw] py-3 md:py-[1vw] rounded-xl md:rounded-[1vw] hover:bg-[#c27233] transition-colors shadow-md">
                                Masuk sebagai SPPG
                            </button>
                        </Link>
                        <p className="text-black satoshiMedium text-xs md:text-[1vw] text-center opacity-80">
                            Untuk menerima laporan & mengirim menu mingguan.
                        </p>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 md:absolute md:bottom-[4vw]">
                    <p className="satoshiMedium text-[#D9833E] text-sm md:text-[1.1vw]">
                        Sudah punya akun? <Link href="/login" className="satoshiBold underline cursor-pointer hover:text-[#B56225]">Masuk</Link>
                    </p>
                </div>

            </div>
        </section>
    )
}

export default Register;