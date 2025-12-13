'use client'
import Image from "next/image";
import { useState, useRef, useLayoutEffect } from "react";
import mbg from "../../assets/landingpage/reason/mbg.webp";
import mbgMobile from "../../assets/landingpage/reason/mbg-mobile.webp";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Reason = () => {
    const [activeTab, setActiveTab] = useState('tantangan');
    const [isFading, setIsFading] = useState(false);

    const containerRef = useRef(null);

    const handleTabChange = (tab: string) => {
        if (activeTab === tab) return;
        setIsFading(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsFading(false);
        }, 300);
    };

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

            tlEnter
                .from(".reason-title", { y: 60, opacity: 0, duration: 1, ease: "power3.out" })
                .from(".reason-left-group", { x: -80, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.7")
                .from(".reason-image", { x: 80, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=1.0")
                .from(".reason-subtitle", { y: 40, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.6");


        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="flex flex-col w-full gap-[5vw] px-[5vw]  lg:py-0 lg:gap-[2vw] lg:px-[3vw]"
        >
            <h2 className="reason-title satoshiBold text-[9vw] lg:text-[4.5vw] text-[#E87E2F] text-center lg:text-left">
                Mengapa Kami Ada
            </h2>

            <div className="flex flex-col lg:flex-row w-full h-full items-center lg:items-start">

                {/* --- LEFT GROUP --- */}
                <div className="reason-left-group flex flex-col items-center lg:items-start w-full lg:w-auto">

                    {/* Mobile Image - di luar box, menempel dengan tumpukan */}
                    <Image
                        src={mbgMobile}
                        alt="MBG Mobile"
                        width={600}
                        height={300}
                        sizes="90vw"
                        className="lg:hidden w-full rounded-t-[4vw] relative z-10"
                    />

                    {/* Text Box + Buttons (gabung di mobile) */}
                    <div
                        className="bg-[#E87E2F] text-white satoshiMedium text-justify flex flex-col w-[88.9vw] rounded-tl-[6vw] rounded-br-[6vw] rounded-tr-none rounded-bl-none mt-[-8vw] pt-[12vw] px-[5vw] pb-[5vw] gap-[4vw] lg:mt-0 lg:pt-0 lg:pb-0 lg:gap-0 lg:w-[41vw] lg:h-[30vw] lg:rounded-tl-[1.5vw] lg:rounded-br-[1.5vw] lg:p-[2.5vw] lg:px-[3vw] lg:items-center lg:justify-center"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        {/* Text content */}
                        <p className={`text-[3.5vw] lg:text-[2vw] leading-relaxed transition-all duration-300 ease-in-out transform ${isFading ? 'opacity-0 translate-x-2' : 'opacity-100 translate-y-0'}`}>
                            {activeTab === 'tantangan'
                                ? "MBG menjadi program penting untuk menjaga asupan gizi siswa. Namun sampai saat ini, penyesuaian menu untuk anak disabilitas masih belum menjadi standar nasional. Banyak sekolah harus memeriksa alergi, tekstur, dan porsi secara manual sehingga memakan waktu dan rentan terlewat."
                                : "Kami hadir untuk membantu sekolah menganalisis menu secara otomatis, mulai dari komposisi gizi hingga deteksi alergi dan tekstur. Dengan integrasi laporan cepat ke SPPG, komunikasi menjadi lebih efisien dan keputusan gizi dapat diambil dengan lebih akurat."
                            }
                        </p>

                        
                    </div>
                    

                    {/* Buttons Container */}
                    <div
                        className="flex bg-[#E87E2F] text-white satoshiMedium items-center justify-start w-[70vw] rounded-bl-[3vw] translate-x-[-0.2vw] lg:translate-x-[0vw] rounded-br-[3vw] mt-[-1px] pt-[4vw] pb-[3vw] px-[3vw] gap-[3vw] self-start ml-[0.75vw] lg:ml-0 lg:mt-0 lg:w-[35vw] lg:h-[7vw] lg:rounded-b-[1.5vw] lg:rounded-bl-[1.5vw] lg:p-[2.8vw] lg:gap-[1vw] z-auto lg:pt-[2.8vw]"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <button
                            onClick={() => handleTabChange('tantangan')}
                            className={`flex items-center justify-center cursor-pointer transition-all duration-300 rounded-[2vw] w-full h-[8vw] text-[3.5vw] lg:rounded-[1vw] lg:w-full lg:h-[3vw] lg:text-[1.8vw] ${activeTab === 'tantangan'
                                ? 'bg-white text-[#E87E2F] scale-105'
                                : 'bg-white/50 text-[#E87E2F] border border-white opacity-60 hover:opacity-100 hover:scale-102'
                                }`}
                        >
                            Tantangan
                        </button>

                        <button
                            onClick={() => handleTabChange('solusi')}
                            className={`flex items-center justify-center cursor-pointer transition-all duration-300 rounded-[2vw] w-full h-[8vw] text-[3.5vw] lg:rounded-[1vw] lg:w-full lg:h-[3vw] lg:text-[1.8vw] ${activeTab === 'solusi'
                                ? 'bg-white text-[#E87E2F] scale-105'
                                : 'bg-white/50 text-[#E87E2F] border border-white opacity-60 hover:opacity-100 hover:scale-102'
                                }`}
                        >
                            Solusi
                        </button>
                    </div>


                </div>

                {/* --- RIGHT GROUP --- */}
                <div className="flex flex-col lg:translate-x-[-0.31vw] w-full">

                    {/* Gambar: HIDDEN di Mobile, BLOCK di Desktop */}
                    <div className="reason-image hidden lg:block">
                        <Image
                            src={mbg}
                            alt="MBG"
                            width={1200}
                            height={600}
                            sizes="59vw"
                            className="w-[59vw]"
                        />
                    </div>

                    {/* Subtitle */}
                    <h2 className="reason-subtitle satoshiBold text-[7vw] text-center mt-[8vw] lg:text-[4vw] lg:text-end lg:mr-[3vw] lg:mt-[1vw] leading-tight text-black">
                        Wujudkan Menu MBG <br />yang Aman dan Inklusif
                    </h2>
                </div>
            </div>
        </section>
    )
};
export default Reason;