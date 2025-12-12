'use client'; // Wajib ditambahkan karena menggunakan Hooks

import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/logo-orange.png";
import { useState, useEffect } from "react";

const Navbar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            // Ambil posisi scroll saat ini
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Jika scroll ke BAWAH dan sudah melewati 50px -> Sembunyikan
                setIsVisible(false);
            } else {
                // Jika scroll ke ATAS atau posisi di paling atas -> Munculkan
                setIsVisible(true);
            }

            // Simpan posisi scroll terakhir
            setLastScrollY(currentScrollY);
        };

        // Pasang event listener
        window.addEventListener('scroll', controlNavbar);

        // Bersihkan event listener saat komponen di-unmount (agar tidak memory leak)
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out bg-white/90 backdrop-blur-sm shadow-sm
            ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
        >
            <div className="flex flex-row justify-between py-[1vw] px-[3vw] items-center w-full">
                <div className="flex flex-row items-center gap-[1vw] lg:gap-[0.5vw]">
                    <Image
                        src={logo}
                        alt="logo"
                        className="lg:w-[5vw] lg:h-[5vw] md:w-[8vw] md:h-[8vw] w-[10vw] h-[10vw] object-contain"
                        priority
                        sizes="(max-width: 768px) 10vw, (max-width: 1024px) 8vw, 5vw"
                    />
                    <span className="satoshiBold tracking-wider text-[#E87E2F] text-[4vw] md:text-[3.5vw] lg:text-[2.5vw]">INKLUZI</span>
                </div>
                <div className="flex flex-row gap-[2vw] text-[4vw] md:text-[3vw] lg:text-[2vw] satoshiBold">
                    <Link href="/register" className="text-[#B56225] hover:text-[#E87E2F] transition-colors">Register</Link>
                    <Link href="/login" className="text-[#B56225] hover:text-[#E87E2F] transition-colors">Login</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;