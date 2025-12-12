'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from "next/image";
import bg from "../../assets/landingpage/collab/bg.webp";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Collab = () => {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const bgImageRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            
            gsap.set(overlayRef.current, { opacity: 1 });
            gsap.set(textRef.current, { scale: 1, opacity: 1 });
            gsap.set(descRef.current, { opacity: 1, y: 0 });
            gsap.set(bgImageRef.current, { scale: 1.2, opacity: 1 }); 

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=200%", 
                    pin: true,     
                    pinSpacing: true, 
                    scrub: 1, 
                    anticipatePin: 1 
                }
            });

            tl.to(textRef.current, {
                scale: 150,       
                ease: "power2.in", 
                duration: 4 
            }, 0);

            tl.to(descRef.current, { opacity: 0, duration: 0.5 }, 0);

            tl.to(overlayRef.current, {
                opacity: 0, 
                duration: 2,
                ease: "power1.inOut"
            }, 0.5);

            tl.to(bgImageRef.current, {
                scale: 1, 
                duration: 4,
                ease: "none"
            }, 0);

            tl.to(bgImageRef.current, {
                opacity: 0, 
                duration: 0.5, 
                ease: "power1.inOut"
            }, 3.5); 

            tl.to({}, { duration: 0.5 }); 

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const orangeColor = '#E87E2F';
    
    const textShadowStyle = `
            10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px 10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            10px 10px 14.4px rgba(255, 255, 255, 0.35)
        `;

    return (
        <section ref={containerRef} className="flex flex-col w-full h-screen items-center justify-center relative overflow-hidden bg-white">

            <div className="absolute inset-0 w-full h-full z-0">
                <Image
                    ref={bgImageRef}
                    src={bg}
                    alt="background"
                    fill
                    sizes="100vw"
                    className="w-full h-full object-cover"
                    priority
                />
            </div>

            <div
                ref={overlayRef}
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                style={{ backgroundColor: orangeColor }} 
            ></div>

            <h1 ref={textRef} className="absolute z-20 text-white text-[4.5vw] satoshiBold leading-wide text-center origin-center will-change-transform flex flex-col items-center justify-center pointer-events-none w-full whitespace-nowrap">
                <span className="pl-[1vw] rounded-[1vw] leading-none block"
                style={{ textShadow: textShadowStyle }}
                >
                    Kolaborasi dengan SPPG
                </span>
            </h1>

            <div ref={descRef} className="absolute bottom-[5vw] right-[5vw] w-[66%] z-20 text-right">
                <p className="text-white satoshiMedium text-[1.5vw] px-[0.5vw]">
                    Sekolah dan SPPG berkomunikasi lebih cepat dengan sistem validasi menu yang otomatis, laporan yang terstruktur, dan data gizi yang tercatat.
                </p>
            </div>
        </section>
    )
};

export default Collab;