import Image from 'next/image';
import tes from '../../assets/landingpage/feature/tes.png';

const Feature = () => {
    return (
        <section className="flex flex-col w-full gap-[2vw] items-center justify-center relative px-[3vw] ">
            <h1 className="satoshiBold text-[4.5vw] text-[#E87E2F]">Fitur Kami</h1>

            <div className="flex flex-col items-center w-full relative">
                <div className='absolute w-[40vw] h-[40vw] rounded-full bg-[#E87E2F]'></div>

                <div className="grid grid-cols-2 gap-[2vw] z-10  ">
                    <Image src={tes} alt="feature image" className="w-[30vw] h-[20vw] object-contain hover:scale-110 transition-all duration-300 ease-in-out transform" />
                    <Image src={tes} alt="feature image" className="w-[30vw] h-[20vw] object-contain hover:scale-110 transition-all duration-300 ease-in-out transform" />
                </div>
                <div className="grid grid-cols-2 gap-[2vw] z-10 ">
                    <Image src={tes} alt="feature image" className="w-[30vw] h-[20vw] object-contain hover:scale-110 transition-all duration-300 ease-in-out transform" />
                    <Image src={tes} alt="feature image" className="w-[30vw] h-[20vw] object-contain hover:scale-110 transition-all duration-300 ease-in-out transform" />
                </div>
            </div>
        </section>
    )
};

export default Feature;