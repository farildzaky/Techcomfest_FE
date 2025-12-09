import Link from "next/link";
const DaftarSekolah = () => {

    const sekolah = [
        { id: 1, sekolah: "SLB-B YTPB Malang" },
        { id: 2, sekolah: "SLB-B YTPB Malang" },
        { id: 3, sekolah: "SLB-B YTPB Malang" },
        { id: 4, sekolah: "SLB-B YTPB Malang" },
        { id: 5, sekolah: "SLB-B YTPB Malang" },
    ]

    return (
        <div className="p-[3vw] flex flex-col gap-[3vw]">

            <h1 className="satoshiBold text-[2.5vw]">Pelaporan Sekolah</h1>

            <div className="flex flex-col gap-[2vw]">
                {sekolah.map((item) => (
                    <Link href={`/sppg/pelaporan/${item.id}`} key={item.id} className="block transition-transform hover:scale-[1.01] ">
                        <h1 className="satoshiBold text-[1.8vw] bg-[#E87E2F] text-white p-[1vw] px-[2vw] rounded-[1vw]"
                            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

                        >{item.sekolah}</h1>
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default DaftarSekolah;