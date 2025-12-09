import Image from "next/image";
import bg from "../../assets/landingpage/collab/bg.png";
const Collab = () => {
    return (
        <section className="flex flex-col w-full items-center justify-center relative  ">
            <div className="relative flex flex-col w-full items-center justify-center ">
                <Image src={bg} alt="background" className="w-full   z-0" />
                <h1 className="absolute text-black  text-[4.5vw] z-10 satoshiBold leading-wide">

                    <span className="bg-[#B56225] pl-[1vw] rounded-[1vw] leading-none z-10"
                        style={{
                            boxShadow: `
            10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px 10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            10px 10px 14.4px rgba(255, 255, 255, 0.35)
        `
                        }}
                    >Kolaborasi </span>

                    <span
                        className="text-[#B56225] z-0"
                        style={{
                            textShadow: `
            10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px 10px 14.4px rgba(255, 255, 255, 0.35), 
            -10px -10px 14.4px rgba(255, 255, 255, 0.35), 
            10px 10px 14.4px rgba(255, 255, 255, 0.35)
        `
                        }}
                    >dengan SPPG</span> </h1>

            </div>

            <p className="self-end text-right  text-black satoshiMedium text-[1.5vw] px-[3vw] w-[66%]">
                Sekolah dan SPPG berkomunikasi lebih cepat dengan sistem validasi menu yang otomatis, laporan yang terstruktur, dan data gizi yang tercatat.
            </p>
        </section>
    )
};

export default Collab;