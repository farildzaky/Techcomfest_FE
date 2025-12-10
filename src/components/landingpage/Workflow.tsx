'use client';

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import lamp from "../../assets/landingpage/workflow/lamp.png";
import calender from "../../assets/landingpage/workflow/calender.png";
import fluent from "../../assets/landingpage/workflow/fluent.png";

import mock1 from "../../assets/landingpage/workflow/mock1.png";
import mock2 from "../../assets/landingpage/workflow/mock2.png";

gsap.registerPlugin(ScrollTrigger);

const Workflow = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const items = [
        {
            icon: calender, 
            title: "Pilih Jenis Pemeriksaan",
            desc: "Sekolah dapat memilih analisis melalui menu MBG mingguan atau mengunggah foto makanan untuk diperiksa AI."
        },
        {
            icon: lamp,
            title: "AI Analisis Otomatis",
            desc: "AI mengevaluasi gizi, alergi, dan tekstur, lalu memberi status kecocokan menu."
        },
        {
            icon: fluent,
            title: "Tindak Lanjut Cepat",
            desc: "Lihat hasil, kirim laporan, ataupun lihat rekomendasi. Semua data otomatis tersusun dalam rekap yang ada."
        }
    ];

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            
            ScrollTrigger.refresh();

            const itemElements = gsap.utils.toArray<HTMLElement>('.workflow-item');
            
            itemElements.forEach((el, index) => {
                const content = el.querySelector(".content-group");
                const icon = el.querySelector(".icon-wrapper");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%", 
                        toggleActions: "play none none reverse"
                    }
                });

                tl.fromTo(icon, 
                    { scale: 0, opacity: 0 }, 
                    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
                )
                .fromTo(content, 
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 }, 
                    "-=0.3"
                );

                const line = el.querySelector(".dashed-line");
                if (line) {
                    gsap.fromTo(line, 
                        { height: 0 },
                        {
                            height: "100%", 
                            ease: "none",
                            scrollTrigger: {
                                trigger: el,
                                start: "top 60%",
                                end: "bottom 60%",
                                scrub: 1 
                            }
                        }
                    );
                }
            });

            const tlParallax = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom", 
                    end: "bottom top",   
                    scrub: 1             
                }
            });

            tlParallax.to(".workflow-title", { y: 50, ease: "none" }, 0);
            tlParallax.to(".mock-1", { y: -80, ease: "none" }, 0);
            tlParallax.to(".mock-2", { y: -150, ease: "none" }, 0);

        }, containerRef);

        return () => ctx.revert(); 
    }, []);

    return (
        <section ref={containerRef} className="flex flex-col gap-[2vw] relative mb-[10vw]">
            <h1 className="workflow-title satoshiBold text-[4.5vw] text-[#E87E2F] px-[3vw] relative z-10">Cara Kerja</h1>

            <div className="w-full px-[6vw] flex flex-row items-start gap-[15vw] relative">

                <div className="w-[30vw] h-fit sticky top-[20vh] relative mt-[2vw]">
                    <div className="mock-1 relative z-0">
                        <Image 
                            src={mock1} 
                            alt="Mockup 1" 
                            className="w-[25vw] h-auto drop-shadow-xl"
                            priority 
                        />
                    </div>
                    <div className="mock-2 absolute top-[10vw] right-[-8vw] z-10">
                        <Image 
                            src={mock2} 
                            alt="Mockup 2" 
                            className="w-[22vw] h-auto drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                <div className="flex flex-col w-[40vw] pt-[5vw]">
                    {items.map((item, index) => (
                        <div key={index} className="flex flex-row gap-[3vw] workflow-item relative">
                            <div className="flex flex-col items-center">

                                <div className="icon-wrapper group flex justify-center items-center w-[8vw] h-[8vw] bg-[#E87E2F] border-[0.2vw] border-[#E87E2F] hover:bg-white rounded-full z-10 shrink-0 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                    <div className="relative w-[4vw] h-[4vw]">
                                        
                                        <Image
                                            src={item.icon}
                                            alt="icon"
                                            fill
                                            sizes="(max-width: 768px) 100vw, 5vw" 
                                            priority 
                                            className="object-contain transition-all duration-300 brightness-0 invert group-hover:filter-none"
                                        />
                                    </div>
                                </div>

                                {index !== items.length - 1 && (
                                    <div className="w-[0.3vw] flex-grow min-h-[15vw] relative">
                                        <div className="dashed-line absolute top-0 w-full border-l-[0.2vw] border-dashed border-[#E87E2F] h-full origin-top"></div>
                                    </div>
                                )}
                            </div>

                            <div className={`content-group flex flex-col w-[34vw] justify-start pt-[0.5vw] ${index !== items.length - 1 ? 'pb-[4vw]' : 'pb-0'}`}>
                                <h2 className="satoshiBold text-[2vw] text-black mb-[0.5vw]">{item.title}</h2>
                                <p className="satoshiMedium text-[1.3vw] text-black">{item.desc}</p>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
export default Workflow;