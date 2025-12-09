'use client'
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import mbg from "../../assets/landingpage/reason/mbg.webp";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Reason = () => {
    const [activeTab, setActiveTab] = useState('tantangan');
    const [isFading, setIsFading] = useState(false);
    
    const containerRef = useRef(null);

    const handleTabChange = (tab : string) => {
        if (activeTab === tab) return;

        setIsFading(true);

        setTimeout(() => {
            setActiveTab(tab);
            setIsFading(false);
        }, 300);
    };

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const tlEnter = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse",
                }
            });

            tlEnter
                .from(".reason-title", {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out"
                })
                .from(".reason-left-group", {
                    x: -80,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out"
                }, "-=0.6")
                .from(".reason-image", {
                    x: 80,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out"
                }, "-=0.8")
                .from(".reason-subtitle", {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                }, "-=0.5");


            const tlExit = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.5,
                }
            });

            tlExit.to([".reason-title", ".reason-left-group", ".reason-image", ".reason-subtitle"], {
                y: -50,
                opacity: 0,
                stagger: 0.1
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="flex flex-col w-full gap-[2vw] px-[3vw]">
            
            <h1 className="reason-title satoshiBold text-[4.5vw] text-[#E87E2F]">
                Mengapa Kami Ada
            </h1>

            <div className="flex flex-row w-full h-full">

                <div className="reason-left-group flex flex-col">
                    <div className="w-[41vw] h-[30vw] bg-[#E87E2F] rounded-tl-[1.5vw] rounded-br-[1.5vw] p-[2.5vw] px-[3vw] text-white satoshiMedium text-justify flex items-center"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <p className={`text-[2vw] leading-relaxed transition-all duration-300 ease-in-out transform ${isFading ? 'opacity-0 translate-x-2' : 'opacity-100 translate-y-0'}`}>
                            {activeTab === 'tantangan' 
                                ? "MBG menjadi program penting untuk menjaga asupan gizi siswa. Namun sampai saat ini, penyesuaian menu untuk anak disabilitas masih belum menjadi standar nasional. Banyak sekolah harus memeriksa alergi, tekstur, dan porsi secara manual sehingga memakan waktu dan rentan terlewat."
                                : "Kami hadir untuk membantu sekolah menganalisis menu secara otomatis, mulai dari komposisi gizi hingga deteksi alergi dan tekstur. Dengan integrasi laporan cepat ke SPPG, komunikasi menjadi lebih efisien dan keputusan gizi dapat diambil dengan lebih akurat."
                            }
                        </p>
                    </div>

                    <div className="w-[35vw] h-[7vw] bg-[#E87E2F] rounded-b-[1.5vw] p-[2.8vw] text-white satoshiMedium text-justify flex items-center justify-start gap-[1vw]"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <button 
                            onClick={() => handleTabChange('tantangan')}
                            className={`rounded-[1vw] w-full h-[3vw] flex items-center justify-center text-[1.8vw] cursor-pointer transition-colors duration-300
                                ${activeTab === 'tantangan' 
                                    ? 'bg-white text-[#E87E2F]' 
                                    : 'bg-white/50 text-[#E87E2F] border border-white opacity-60 hover:opacity-100' 
                                }`}
                        >
                            Tantangan
                        </button>

                        <button 
                            onClick={() => handleTabChange('solusi')}
                            className={`rounded-[1vw] w-full h-[3vw] flex items-center justify-center text-[1.8vw] cursor-pointer transition-colors duration-300
                                ${activeTab === 'solusi' 
                                    ? 'bg-white text-[#E87E2F]' 
                                    : 'bg-white/50 text-[#E87E2F] border border-white opacity-60 hover:opacity-100' 
                                }`}
                        >
                            Solusi
                        </button>

                    </div>
                </div>

                <div className="flex flex-col translate-x-[-0.31vw]">
                    <div className="reason-image">
                        <Image
                            src={mbg}
                            alt="MBG"
                            className="w-[59vw]"
                        />
                    </div>
                    <h2 className="reason-subtitle satoshiBold text-[4vw] text-end mr-[3vw] mt-[-1vw]">
                        Wujudkan Menu MBG <br />yang Aman dan Inklusif
                    </h2>
                </div>
            </div>
        </section>
    )
};
export default Reason;