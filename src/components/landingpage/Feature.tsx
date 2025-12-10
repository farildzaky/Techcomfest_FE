'use client';

import Image from 'next/image';
import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mock from '../../assets/landingpage/feature/mock.png';

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
            desc: "Unggah foto menu untuk menedetksi nutrisi gizi, tekstur, dan potensi alergi.",
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

        const ctx = gsap.context(() => {

            const tlEnter = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "top 50%",
                    toggleActions: "play none none reverse"
                }
            });

            tlEnter.from(".feature-item", {
                y: 40,
                opacity: 0,
                scale: 0.9,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.2
            });

            const tlExit = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            tlExit.to([".feature-item", ".center-circle", ".feature-title"], {
                opacity: 0,
                y: -100,
                stagger: 0.1,
                ease: "power1.in"
            });

            gsap.to(".center-circle", {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 0.5
                },
                y: 50,
                ease: "none"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const getNumberStyle = (id: number) => {
        return activeId === id
            ? "bg-[#D7762E] text-white scale-110 shadow-lg"
            : "bg-[#FFF3EB] text-[#D7762E]";
    };

    return (
        <section ref={containerRef} className="flex flex-col w-full gap-[2vw] items-center justify-center relative px-[3vw] py-[5vw]">
            <h1 className="feature-title satoshiBold text-[4.5vw] text-[#E87E2F] relative z-10">Fitur Kami</h1>

            <div className="flex flex-col items-center w-full justify-center relative gap-[5vw]">

                <div className='center-circle absolute w-[70vw] h-[60vw] top-[50%] translate-x-[2%] translate-y-[-50%] pointer-events-none z-0'>
                    <Image src={mock} alt="circle" className="w-full h-full object-contain" />
                </div>

                <div className="grid grid-cols-2 gap-[40vw] z-10 w-full relative">

                    <div
                        className='feature-item flex flex-col items-end gap-[0.5vw] cursor-pointer group'
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
                        className='feature-item flex flex-col items-start gap-[0.5vw] cursor-pointer group'
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
                        className='feature-item flex flex-col items-end gap-[0.5vw] cursor-pointer group'
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
                        className='feature-item flex flex-col items-start gap-[0.5vw] cursor-pointer group'
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