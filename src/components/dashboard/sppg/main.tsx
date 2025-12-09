import Image from "next/image";
import CardMenu from "../sekolah/CardMenu";
import CardPelaporan from "./CardPelaporan";
import information from "../../../assets/dashboard/sekolah/information.png";
import menu from "../../../assets/dashboard/sekolah/menu.png";

interface Menu {
    id: number;
    day: string;
    menu: string;
}

const MainDashboardSppg = () => {

    const menus = [
        { id: 1, menu: "Nasi Ikan Bumbu Kuning", day: "senin" },
        { id: 2, menu: "Nasi Soto Ayam Bening", day: "selasa" },
        { id: 3, menu: "Nasi Tahu Bacem Telur", day: "rabu" },
        { id: 4, menu: "Nasi Ayam Teriyaki", day: "kamis" },
        { id: 5, menu: "Nasi Ayam Katsu", day: "jumat" },
    ]

    const pelaporan = [
        { id: 1, sekolah: "SLB-B YTPB Malang", pelaporan: "Menu Senin - Ganti Susu Coklat" },
        { id: 2, sekolah: "SLB-B YTPB Malang", pelaporan: "Menu Senin - Ganti Susu Coklat" },
        { id: 3, sekolah: "SLB-B YTPB Malang", pelaporan: "Menu Senin - Ganti Susu Coklat" }

    ]

    const alertMessage = "Menu minggu ini sering mengandung susu. 11 siswa alergi susu.";

    return (
        <div className="pb-[1vw] flex flex-col">
            <div className="grid-cols-7 grid ">
                <div className="col-span-5 p-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                    <div className="bg-[#D7762E] w-full rounded-full px-[1vw] py-[0.5vw] satoshiMedium text-white text-[1vw] items-center flex flex-row "
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <Image src={information} alt="information" className="  mr-[0.5vw] w-[1.5vw] " />

                        <span>{alertMessage}</span>
                    </div>

                    <div className="bg-[#E87E2F] w-full rounded-[2vw] pl-[2vw]  flex flex-row  items-center "
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                    >
                        <div className="flex flex-col w-[55%]">
                            <h1 className="satoshiBold text-[2.5vw] text-white">Validasi Gizi Cerdas untuk Siswa Sekolah Inklusif</h1>
                            <p className="satoshiMedium text-[1.3vw] text-white">Memastikan setiap menu MBG aman, sesuai, dan ramah untuk anak disabilitas.</p>
                        </div>

                        <Image src={menu} alt="menu image" className="w-[55%] " />
                    </div>
                    {/* weekly menu */}
                    <h2 className="satoshiBold text-[2vw]">Menu Minggu Depan</h2>
                    <div className="bg-[#F5DDCA] p-[2vw] rounded-[2vw] flex flex-row gap-[1vw] items-start pt-[4vw]"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

                    >
                        {menus.map((item) => (
                            <CardMenu
                                key={item.id}
                                day={item.day}
                                menu={item.menu}
                            />
                        ))}
                    </div>
                </div>
                <div className="col-span-2 pr-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                    <h1 className="w-full text-[2vw] satoshiBold bg-[#D7762E] text-center flex items-center justify-center text-white rounded-[2vw] p-[1.5vw]">Logo</h1>
                    <div className="bg-[#F5DDCA] rounded-[2vw]  flex flex-col items-center h-[38.7vw]"
                        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

                    >
                        {/* daftar sekolah */}
                        <h1 className="bg-[#E87E2F]  w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[0.5vw] text-[1.8vw] satoshiBold">Daftar Sekolah</h1>

                    </div>
                </div>
            </div>
            <div className="flex-col flex gap-[1vw]">
            <h2 className="satoshiBold text-[2vw] mx-[1vw] leadding-none">Pelaporan Terbaru</h2>

            <div className="bg-[#F5DDCA] p-[1vw] rounded-[1vw] flex flex-row gap-[1vw] items-start  mx-[1vw]"
                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
            >
                {pelaporan.map((item) => (
                    <CardPelaporan
                        key={item.id}
                        sekolah={item.sekolah}
                        pelaporan={item.pelaporan}
                    />
                ))}
            </div>
            </div>
        </div>
    );
}
export default MainDashboardSppg;