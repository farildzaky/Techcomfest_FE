'use client'
import Image from "next/image"
import Link from "next/link"
import isimenu from "../../../../assets/dashboard/sppg/isi-menu.png"
import menuMBG from "../../../../assets/dashboard/sppg/menu-MBG.png"

const Option = () => {
    return (
        <section className="w-full min-h-screen flex flex-col bg-white overflow-y-auto">
            
            <div className="w-full px-[5vw] pt-[4vw] pb-[2vw] md:px-[3vw] md:pt-[2vw]">
                <h1 className="satoshiBold text-[6vw] md:text-[3vw] text-black leading-tight">
                    Menu MBG
                </h1>
                <h3 className="satoshiMedium text-[3.5vw] md:text-[1.5vw] text-gray-600 mt-[1vw]">
                    Perbarui menu untuk setiap minggunya
                </h3>
            </div>


            <div className="flex flex-col md:flex-row justify-center items-center gap-[6vw] md:gap-[3vw] flex-grow pb-[5vw] px-[5vw]">
                
                <Link href="/sppg/menu-mbg/isi-menu" className="group w-full md:w-[35vw]">
                    <div 
                        className="bg-[#E87E2F] rounded-[2vw] md:rounded-[1.5vw] p-[6vw] md:p-[3vw] flex flex-col gap-[2vw] md:gap-[1.5vw] items-center text-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95 cursor-pointer h-full justify-center"
                        style={{ boxShadow: '0px 4px 10px 0px #00000040' }}
                    >
                        <div className="w-[20vw] h-[20vw] md:w-[12vw] md:h-[12vw] relative mb-[1vw]">
                            <Image 
                                src={isimenu} 
                                alt="Isi Menu MBG" 
                                className="object-contain w-full h-full" 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-[1vw] md:gap-[0.5vw]">
                            <h2 className="satoshiBold text-[5vw] md:text-[2.5vw] text-white">
                                Isi Menu MBG
                            </h2>
                            <p className="satoshiMedium text-[3vw] md:text-[1.3vw] text-white/90 leading-relaxed">
                                Isi menu harian MBG setiap minggu untuk seluruh sekolah yang terdaftar dalam instansi
                            </p>
                        </div>
                    </div>
                </Link>

                <Link href="/sppg/menu-mbg/weekly-menu" className="group w-full md:w-[35vw]">
                    <div 
                        className="bg-[#E87E2F] rounded-[2vw] md:rounded-[1.5vw] p-[6vw] md:p-[3vw] flex flex-col gap-[2vw] md:gap-[1.5vw] items-center text-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95 cursor-pointer h-full justify-center"
                        style={{ boxShadow: '0px 4px 10px 0px #00000040' }}
                    >
                        <div className="w-[20vw] h-[20vw] md:w-[12vw] md:h-[12vw] relative mb-[1vw]">
                            <Image 
                                src={menuMBG} 
                                alt="Lihat Menu MBG" 
                                className="object-contain w-full h-full" 
                            />
                        </div>

                        <div className="flex flex-col gap-[1vw] md:gap-[0.5vw]">
                            <h2 className="satoshiBold text-[5vw] md:text-[2.5vw] text-white">
                                Menu MBG
                            </h2>
                            <p className="satoshiMedium text-[3vw] md:text-[1.3vw] text-white/90 leading-relaxed">
                                Lihat menu harian MBG setelah mengisi jadwal menu MBG mingguan
                            </p>
                        </div>
                    </div>
                </Link>

            </div>
        </section>
    )
}

export default Option;