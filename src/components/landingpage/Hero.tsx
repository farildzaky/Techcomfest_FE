'use client'
import Image from "next/image"
import { useState, useEffect, useRef, useLayoutEffect } from "react"
import gambar1 from "../../assets/landingpage/hero/gambar1.webp"
import gambar2 from "../../assets/landingpage/hero/gambar2.webp"
import dokter from "../../assets/landingpage/hero/dokter.png"

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const rawImages = [gambar1, gambar2];
const images = [...rawImages, rawImages[0]];

const Hero = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const transitionDuration = 1000;
    const slideInterval = 2500;
    const [counter, setCounter] = useState(0);
    const number = 55;
    const containerRef = useRef(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImage(prev => prev + 1);
            setIsTransitioning(true);
        }, slideInterval);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (currentImage === images.length - 1) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentImage(0);
            }, transitionDuration);
            return () => clearTimeout(timeout);
        }
    }, [currentImage]);

    useEffect(() => {
        const duration = 2500;
        const stepTime = Math.abs(Math.floor(duration / number));
        const timer = setInterval(() => {
            setCounter((prev) => {
                if (prev >= number) {
                    clearInterval(timer);
                    return number;
                }
                return prev + 1;
            });
        }, stepTime);
        return () => clearInterval(timer);
    }, []);


    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            
            const tlEnter = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%", 
                    toggleActions: "play none none reverse", 
                }
            });

            tlEnter.from(".hero-title", { y: 60, opacity: 0, duration: 1.5, ease: "power3.out" })
            .from(".hero-desc", { y: 40, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8")
            .from(".hero-slider-container", { x: 60, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=1.0")
            .from(".hero-box-doctor", { y: 60, opacity: 0, scale: 0.95, duration: 1, ease: "back.out(1.2)" }, "-=0.8")
            .from(".hero-box-counter", { y: -60, opacity: 0, scale: 0.95, duration: 1, ease: "back.out(1.2)" }, "-=0.8");

            
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="flex flex-row relative justify-center w-full h-full px-[3vw] ">
             <div className="w-[40%] satoshiBold text-[4.5vw] flex flex-col gap-[2vw] justify-center">
                <h1 className="hero-title">
                    KAMI PEDULI VALIDASI <span className="text-[#E8882F]">GIZI</span> UNTUK <span className="text-[#E8882F]">SEKOLAH INKLUSIF</span>
                </h1>
                <p className="hero-desc text-[1.5vw] satoshiMedium">
                    Membantu sekolah memastikan setiap menu MBG memenuhi standar keamanan gizi dan sesuai kebutuhan siswa disabilitas dengan analisis AI.
                </p>
            </div>

            <div className="hero-slider-container w-[60%] flex items-center justify-center overflow-hidden relative h-full">
                <div className="relative w-full flex">
                    {images.map((imgSrc, index) => (
                        <div
                            key={index}
                            className={`w-full flex-shrink-0 relative flex ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
                            style={{
                                transform: `translateX(-${currentImage * 100}%)`
                            }}
                        >
                            <Image src={imgSrc} alt={`Gambar ${index + 1}`} className="w-full h-auto object-cover" />
                        </div>
                    ))}
                </div>
                <div 
                    className="hero-box-doctor absolute bottom-[2%] left-[3%] w-[60%] h-[27%] bg-[#E8882F] rounded-[1.5vw] z-10 pointer-events-none flex flex-row gap-[1vw]"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <Image src={dokter} alt="Dokter" className="h-full w-auto rounded-[1vw] ml-[1vw]" />
                    <div className="flex flex-col gap-[0.5vw] justify-center">
                        <div className="">
                            <h2 className="satoshiBold text-white text-[1.5vw] ">dr. David Fadjar Putra, MS, Sp. G.K</h2>
                            <p className="satoshiBold text-white text-[1.2vw] leading-none">Spesialis Gizi Klinik</p>
                        </div>
                        <p className="satoshiMedium text-white text-[1.15vw]">"Penyandang disabilitas tetap boleh makan menu umum, namun nutrisinya harus benar-benar seimbang."</p>
                    </div>
                </div>

                <div 
                    className="hero-box-counter absolute top-[3%] right-0 w-[24%] h-[34%] bg-[#E8882F] rounded-[1.5vw] flex flex-col justify-center items-center gap-[1vw] text-white "
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <div className="flex items-center leading-none">
                        <span className={`satoshiBold text-white text-[5vw] transition-all duration-1000 ease-out transform ${counter === number ? 'translate-x-0' : 'translate-x-[1.7vw]'}`}>{counter}</span>
                        <span className={`font-bold text-[5vw] transition-all duration-1000 ease-out transform ${counter === number ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>+</span>
                    </div>
                    <h2 className="satoshiBold text-white text-[1.5vw] ">Sekolah Inklusif</h2>
                </div>
            </div>
        </section>
    )
}
export default Hero;