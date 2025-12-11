
interface CardPelaporanProps {
    sekolah: string;
    pelaporan: string;
}
const CardPelaporan: React.FC<CardPelaporanProps> = ({ sekolah, pelaporan }) => {
    return (
        <div className="flex flex-col p-[1vw] bg-[#E87E2F] rounded-[1vw] w-full">
            <h1 className="satoshiBold text-[1.8vw] text-white">{sekolah}</h1>
            <h2 className="satoshiRegular text-[1.2vw] text-white">{pelaporan}</h2>
            <p className="satoshiRegular text-[1vw] text-white opacity-90 flex ml-auto">detail</p>
        </div>
    )
}
export default CardPelaporan;