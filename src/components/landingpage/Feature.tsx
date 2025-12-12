'use client';

import Image from 'next/image';
import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mock from '../../assets/landingpage/feature/mock.webp';

const Feature = () => {
    const [activeId, setActiveId] = useState<number | null>(null);
    const containerRef = useRef<HTMLElement>(null);

    const features = [
        {
            id: 1,
            title: "Validasi Menu",
            desc: "Periksa menu MBG secara otomatis berdasarkan bahan & kategori makanan.",
            align: "right"
        },
        {
            id: 2,
            title: "Scan Nutrisi Makanan",
            desc: "Unggah foto menu untuk mendeteksi nutrisi gizi, tekstur, dan potensi alergi.",
            align: "left"
        },
        {
            id: 3,
            title: "Rekap Menu Sebelumnya",
            desc: "Lihat riwayat menu sebelumnya yang dapat dijadikan referensi alternatif menu lain.",
            align: "right"
        },
        {
            id: 4,
            title: "Pelaporan Cepat",
            desc: "Kirim laporan ke SPPG dengan mudah yang dilengkapi juga dengan bukti foto.",
            align: "left"
        }
    ];

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();

        const ctx = gsap.context(() => {

            // --- MOBILE ---
            mm.add("(max-width: 1023px)", () => {
                const items = gsap.utils.toArray(".feature-item-mobile");
                items.forEach((item: any) => {
                    gsap.from(item, {
                        scrollTrigger: {
                            trigger: item,
                            start: "top 90%", // Lebih awal (saat item baru mau masuk layar)
                            end: "top 60%",
                            scrub: 1,
                        },
                        y: 80,
                        opacity: 0,
                        scale: 0.95,
                        ease: "power2.out"
                    });
                });
            });

            // --- DESKTOP (PARALLAX ENTRY) ---
            mm.add("(min-width: 1024px)", () => {

                // Timeline utama yang terikat scroll
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%", // Mulai animasi saat bagian atas section masuk 80% viewport (bawah layar)
                        end: "center 40%", // Selesai saat tengah section di tengah layar
                        scrub: 1.5, // Sedikit lebih smooth (ada delay dikit biar halus)
                    }
                });

                // 1. Judul & Lingkaran masuk duluan
                tl.from(".feature-title", {
                    y: 100,
                    opacity: 0,
                    duration: 1
                })
                    .from(".center-circle", {
                        scale: 0.6,
                        opacity: 0,
                        duration: 1.5
                    }, "-=0.5");

                // 2. Item 1, 2, 3, 4 Masuk Berurutan (Staggered Parallax)
                const itemsLg = gsap.utils.toArray(".feature-item-lg");

                // Kita gunakan .from() untuk animasi masuk
                tl.from(itemsLg, {
                    y: 300,       // Datang dari posisi SANGAT bawah (efek parallax kuat)
                    opacity: 0,
                    duration: 2,  // Durasi scroll yang dibutuhkan lebih panjang
                    stagger: 0.8, // Jeda antar item cukup signifikan
                    ease: "power1.out" // Ease yang linear di awal agar terasa langsung bergerak saat scroll
                }, "-=1.0"); // Mulai sebelum lingkaran selesai total

                // 3. Efek Parallax Lingkaran Tengah (Terpisah agar terus bergerak pelan)
                gsap.to(".center-circle", {
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5
                    },
                    y: 80, // Gerak sedikit ke bawah mengikuti scroll
                    ease: "none"
                });

                // 4. Animasi Keluar (Exit) - Saat scroll melewati section ke bawah
                const tlExit = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "bottom 60%", // Mulai hilang saat bagian bawah section naik
                        end: "bottom top",
                        scrub: 1,
                    }
                });

                tlExit.to([".feature-item-lg", ".center-circle", ".feature-title"], {
                    opacity: 0,
                    y: -100,
                    stagger: 0.1,
                    ease: "power1.in"
                });
            });

        }, containerRef);

        return () => {
            ctx.revert();
            mm.revert();
        };
    }, []);

    const getNumberStyle = (id: number) => {
        return activeId === id
            ? "bg-[#D7762E] text-white scale-110 shadow-lg"
            : "bg-[#FFF3EB] text-[#D7762E]";
    };

    return (
        <section
            ref={containerRef}
            className="flex flex-col w-full gap-8 lg:gap-[2vw] items-center justify-center relative px-6 lg:px-[3vw] py-10 lg:py-[5vw]"
        >
            <h1 className="feature-title satoshiBold text-[9vw] lg:text-[4.5vw] text-[#E87E2F] relative z-10 text-center">
                Fitur Kami
            </h1>

            {/* --- MOBILE LAYOUT --- */}
            <div className="flex flex-col w-full gap-8 lg:hidden">
                {features.map((feature) => (
                    <div key={feature.id} className="feature-item-mobile flex flex-col items-center text-center gap-2 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                        <div className="w-16 h-16 text-3xl rounded-full flex items-center justify-center satoshiBold bg-[#D7762E] text-white shadow-lg mb-2">
                            {feature.id}
                        </div>
                        <h2 className="text-[#D7762E] satoshiBold text-xl">
                            {feature.title}
                        </h2>
                        <p className="text-gray-600 satoshiMedium text-sm leading-relaxed px-4">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* --- DESKTOP LAYOUT --- */}
            <div className="hidden lg:flex flex-col items-center w-full justify-center relative gap-[5vw]">

                <div className='center-circle absolute w-[70vw] h-[60vw] top-[50%]  translate-y-[-50%] pointer-events-none z-0'>
                    <Image
                        src={mock}
                        alt="circle"
                        className="w-full h-full object-contain"
                        sizes="70vw"
                        loading="lazy"
                    />
                </div>

                <div className="grid grid-cols-2 gap-[40vw] z-10 w-full relative">

                    <div
                        className='feature-item-lg flex flex-col items-end gap-[0.5vw] cursor-pointer group'
                        onMouseEnter={() => setActiveId(1)}
                        onMouseLeave={() => setActiveId(null)}
                    >
                        <div className={`w-[6vw] h-[6vw] text-[4vw] text-center rounded-full flex items-center justify-center satoshiBold transition-all duration-300 ease-in-out ${getNumberStyle(1)}`}
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                        >
                            1
                        </div>
                        <h2 className={`text-black satoshiBold text-[2vw] transition-colors duration-300 ${activeId === 1 ? 'text-[#D7762E]' : ''}`}>
                            {features[0].title}
                        </h2>
                        <p className='text-black satoshiMedium text-[1.2vw] text-end max-w-[20vw]'>
                            {features[0].desc}
                        </p>
                    </div>

                    <div
                        className='feature-item-lg flex flex-col items-start gap-[0.5vw] cursor-pointer group'
                        onMouseEnter={() => setActiveId(2)}
                        onMouseLeave={() => setActiveId(null)}
                    >
                        <div className={`w-[6vw] h-[6vw] text-[4vw] text-center rounded-full flex items-center justify-center satoshiBold transition-all duration-300 ease-in-out ${getNumberStyle(2)}`}
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                        >
                            2
                        </div>
                        <h2 className={`text-black satoshiBold text-[2vw] transition-colors duration-300 ${activeId === 2 ? 'text-[#D7762E]' : ''}`}>
                            {features[1].title}
                        </h2>
                        <p className='text-black satoshiMedium text-[1.2vw] text-start max-w-[20vw]'>
                            {features[1].desc}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-[40vw] z-10 w-full mt-[2vw] relative">

                    <div
                        className='feature-item-lg flex flex-col items-end gap-[0.5vw] cursor-pointer group'
                        onMouseEnter={() => setActiveId(3)}
                        onMouseLeave={() => setActiveId(null)}
                    >
                        <div className={`w-[6vw] h-[6vw] text-[4vw] text-center rounded-full flex items-center justify-center satoshiBold transition-all duration-300 ease-in-out ${getNumberStyle(3)}`}
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                        >
                            3
                        </div>
                        <h2 className={`text-black satoshiBold text-[2vw] transition-colors duration-300 ${activeId === 3 ? 'text-[#D7762E]' : ''}`}>
                            {features[2].title}
                        </h2>
                        <p className='text-black satoshiMedium text-[1.2vw] text-end max-w-[20vw]'>
                            {features[2].desc}
                        </p>
                    </div>

                    <div
                        className='feature-item-lg flex flex-col items-start gap-[0.5vw] cursor-pointer group'
                        onMouseEnter={() => setActiveId(4)}
                        onMouseLeave={() => setActiveId(null)}
                    >
                        <div className={`w-[6vw] h-[6vw] text-[4vw] text-center rounded-full flex items-center justify-center satoshiBold transition-all duration-300 ease-in-out ${getNumberStyle(4)}`}
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                        >
                            4
                        </div>
                        <h2 className={`text-black satoshiBold text-[2vw] transition-colors duration-300 ${activeId === 4 ? 'text-[#D7762E]' : ''}`}>
                            {features[3].title}
                        </h2>
                        <p className='text-black satoshiMedium text-[1.2vw] text-start max-w-[20vw]'>
                            {features[3].desc}
                        </p>
                    </div>
                </div>

            </div>
        </section>
    )
};

export default Feature;