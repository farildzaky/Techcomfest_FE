interface CardPelaporanProps {
    sekolah: string;
    pelaporan: string;
}

const CardPelaporan: React.FC<CardPelaporanProps> = ({ sekolah, pelaporan }) => {
    return (
        <div className="
            flex flex-col w-full bg-[#E87E2F] text-white shadow-sm transition-all hover:shadow-md
            p-4 rounded-xl gap-1
            lg:p-[1vw] lg:rounded-[1vw] lg:gap-0 h-full justify-between
        ">
            {/* Judul Sekolah */}
            <h1 className="
                satoshiBold leading-tight
                text-lg 
                lg:text-[1.8vw]
            ">
                {sekolah}
            </h1>

            {/* Isi Pelaporan */}
            <h2 className="
                satoshiRegular opacity-90
                text-sm 
                lg:text-[1.2vw]
            ">
                {pelaporan}
            </h2>

            {/* Tombol Detail */}
            <p className="
                satoshiRegular flex ml-auto opacity-80 cursor-pointer hover:underline
                text-xs mt-2
                lg:text-[1vw] lg:mt-[0.5vw]
            ">
                detail
            </p>
        </div>
    )
}

export default CardPelaporan;