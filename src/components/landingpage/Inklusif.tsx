'use client';

import { useRef, useLayoutEffect } from 'react';
import Image from "next/image";
import mock from "../../assets/landingpage/mock.webp";

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Inklusif = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom", 
                    end: "bottom top",   
                    scrub: 1, 
                }
            });

            tl.fromTo(imageRef.current, 
                { xPercent: 80 }, 
                { 
                    xPercent: -45,
                    ease: "none"   
                }, 
                0 
            );

            tl.fromTo(textRef.current,
                { xPercent: -10 },
                { 
                    xPercent: 25, 
                    ease: "none" 
                },
                0 
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);


    return (
        <div ref={containerRef} className="items-center justify-center flex satoshiBold text-[5.4vw] self-center relative  overflow-hidden pb-[10vw] w-full">
            
            <h1 ref={textRef} className="w-[55vw] relative z-10 leading-tight">
                <span className="text-[#E87E2F]">Semua anak </span>
                berhak mendapat <span className="text-[#E87E2F]">makanan yang aman</span> dan
                <span className="text-[#E87E2F]"> sesuai kebutuhannya</span>
            </h1>

            <div ref={imageRef} className="relative w-[50vw] h-auto translate-y-[5vw] z-0">
                 <Image
                    src={mock}
                    alt="mock"
                    width={800}
                    height={0}
                    className="object-contain "
                />
            </div>
        </div>
    );
};

export default Inklusif;