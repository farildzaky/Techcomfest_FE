'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from "next/image";
import mock from "../../assets/landingpage/mock.webp";

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Inklusif = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();

        const ctx = gsap.context(() => {

            // --- 1. ANIMASI MOBILE (< 1024px) ---
            // Gerakan Vertikal (Fade Up) agar tidak merusak layout HP
            mm.add("(max-width: 1023px)", () => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        end: "center center",
                        scrub: 1,
                    }
                });

                tl.fromTo(textRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
                    .fromTo(imageRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8");
            });

            // --- 2. ANIMASI DESKTOP (>= 1024px) ---
            // Gerakan Horizontal "Bertemu di Tengah"
            mm.add("(min-width: 1024px)", () => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom", // Mulai saat bagian atas container masuk dari bawah layar
                        end: "center center", // Selesai saat container di tengah layar
                        scrub: 1.5, // Sedikit delay agar smooth
                    }
                });

                // Teks: Datang dari kiri (-100px) menuju posisi normal (0)
                tl.fromTo(textRef.current,
                    { x: -100, opacity: 0 },
                    { x: 0, opacity: 1, ease: "power2.out" },
                    0
                );

                // Gambar: Datang dari kanan (100px) menuju posisi normal (0)
                tl.fromTo(imageRef.current,
                    { x: 100, opacity: 0, scale: 0.9 },
                    { x: 0, opacity: 1, scale: 1, ease: "power2.out" },
                    0
                );
            });

        }, containerRef);

        return () => {
            ctx.revert();
            mm.revert();
        };
    }, []);


    return (
        <div ref={containerRef} className="w-full relative  px-[5vw] ">

            {/* CONTAINER FLEX:
                - Mobile: flex-col (Atas Bawah)
                - Desktop: flex-row (Kiri Kanan)
            */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full h-full gap-[8vw] lg:gap-0">

                <h2 ref={textRef} className="relative z-10 leading-tight w-full lg:w-[50%] satoshiBold text-[8vw] lg:text-[4.5vw] text-center lg:text-left">
                    <span className="text-[#E87E2F]">Semua anak </span>
                    berhak mendapat <span className="text-[#E87E2F]">makanan yang aman</span> dan
                    <span className="text-[#E87E2F]"> sesuai kebutuhannya</span>
                </h2>

                {/* --- GAMBAR (KANAN) --- */}
                {/* Lebar dibatasi 45% di desktop */}
                <div ref={imageRef} className="relative w-full lg:w-[45%] h-auto z-0 flex justify-center lg:justify-end mt-[5vw] lg:mt-0">
                    <Image
                        src={mock}
                        alt="mock"
                        width={800}
                        height={800}
                        sizes="(max-width: 1024px) 80vw, 45vw"
                        className="object-contain w-[80vw] lg:w-full h-auto "
                    />
                </div>

            </div>
        </div>
    );
};

export default Inklusif;