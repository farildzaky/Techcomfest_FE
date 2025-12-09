import Image from "next/image";
import information from "../../../assets/dashboard/sekolah/information.png";
import menu from "../../../assets/dashboard/sekolah/menu.png";
import CardMenu from "./CardMenu";
import report from "../../../assets/dashboard/sekolah/report.png";
import scan from "../../../assets/dashboard/sekolah/scan.png";
import { weeklyMenus } from "@/src/data/MenuMbg";

const alertMessage = "Menu minggu ini sering mengandung susu. 11 siswa alergi susu.";

interface MenuItem {
    id: number;
    day: string;
    menu: string;
}

const MainDashboardSekolah = () => {

    const percentage = 30

    const menus = [
        { id: 1, menu: "Nasi Ikan Bumbu Kuning", day: "senin" },
        { id: 2, menu: "Nasi Soto Ayam Bening", day: "selasa" },
        { id: 3, menu: "Nasi Tahu Bacem Telur", day: "rabu" },
        { id: 4, menu: "Nasi Ayam Teriyaki", day: "kamis" },
        { id: 5, menu: "Nasi Ayam Katsu", day: "jumat" },
    ];

    const riskyMenus = [
        { category: "Alergen Tinggi", items: ["Nasi Ikan Bumbu Kuning", "Nasi Ayam Katsu"] },
        { category: "Tekstur Tidak Sesuai", items: ["Nasi Soto Ayam Bening"] },
        { category: "Gizi Kurang", items: ["Nasi Tahu Bacem Telur", "Nasi Ayam Teriyaki"] },
    ];

    return (
        <div className="grid-cols-7 grid pb-[1vw]">
            {/* mid section */}
            <div className="col-span-5 p-[1vw] pt-[1vw] gap-[2vw] flex flex-col ">

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

                <div className="flex flex-row justfiy-center items-center w-full  gap-[1vw] ">
                    {/* scan */}
                    <div className="bg-[#F5DDCA] relative rounded-[2vw] flex flex-row items-center w-[80%] h-[10vw] justify-end gap-[3vw] ml-[4vw] pr-[1vw]">

                        <div className="w-[10vw] h-[10vw] bg-[#E87E2F] rounded-full mr-[1vw] absolute left-[-3vw] flex justify-center items-center">
                            <Image src={scan} alt="scan icon" className="w-[5vw] h-[5vw] " />
                        </div>
                        <div className="w-[15vw] items-start">
                            <h1 className="satoshiBold text-[1.5vw]">Scan Nutrisi</h1>
                            <p className="satoshiMedium text-[1vw] text-justify">Unggah foto menu makanan untuk cek gizi, tekstur, dan potensi alergi secara otomatis.</p>
                        </div>

                    </div>

                    {/* report */}
                    <div className="bg-[#F5DDCA] relative rounded-[2vw] flex flex-row items-center w-[80%] h-[10vw] justify-end gap-[3vw] ml-[4vw] pr-[1vw] text-justify">

                        <div className="w-[10vw] h-[10vw] bg-[#E87E2F] rounded-full mr-[1vw] absolute left-[-3vw] flex justify-center items-center">
                            <Image src={report} alt="report icon" className="w-[5vw] h-[5vw] " />
                        </div>
                        <div className="w-[15vw] items-start">
                            <h1 className="satoshiBold text-[1.5vw]">Pelaporan</h1>
                            <p className="satoshiMedium text-[1vw]">Laporkan menu yang tidak sesuai dengan kebutuhan siswa secara cepat ke pihak SPPG.</p>
                        </div>

                    </div>
                </div>

            </div>

            {/* right section */}
            <div className="col-span-2 pr-[1vw] pt-[1vw] gap-[1vw] flex flex-col ">
                <h1 className="w-full text-[2vw] satoshiBold bg-[#D7762E] text-center flex items-center justify-center text-white rounded-[1vw] p-[1.5vw]">Logo</h1>

                {/* risiko */}
                <div className="bg-[#F5DDCA] rounded-[2vw]  flex flex-col items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

                >
                    <h1 className="bg-[#E87E2F]  w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[0.5vw] text-[1.8vw] satoshiBold">Risiko Menu Minggu Ini</h1>
                    {riskyMenus.map((risk, index) => (
                        <div key={index} className="w-full px-[1.5vw] py-[0.5vw] ">
                            <h2 className="satoshiBold text-[1.4vw] text-[#D7762E] ">
                                {risk.category}
                            </h2>

                            <p className="satoshiMedium text-[1.2vw] text-black leading-tight">
                                {risk.items.join(", ")}
                            </p>

                        </div>
                    ))}
                </div>

                <div className="bg-[#E87E2F] rounded-[2vw] p-[1.5vw] flex flex-col items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
                >
                    <h1 className="text-white satoshiBold text-[2vw]">{percentage}%</h1>
                    <h2 className="text-white satoshiBold text-[1.5vw]">Siswa Memiliki Risiko Menu</h2>
                </div>

                <div className="bg-[#F5DDCA] rounded-[2vw]  flex flex-col items-center"
                    style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

                >
                    <h1 className="bg-[#E87E2F]  w-full text-center flex items-center justify-center text-white rounded-[1.5vw] py-[1vw] text-[1.8vw] satoshiBold">Menu Sebelummnya</h1>
                    {[...weeklyMenus].sort((a, b) => b.id - a.id).map((item, index) => (
                        <div key={item.id} className="w-full flex items-center gap-[1vw]  p-[1vw]">

                            <div className="w-[4vw] h-[4vw] rounded-full bg-[#E87E2F] flex items-center justify-center flex-shrink-0">
                                <span className="text-white satoshiBold text-[2vw]">{index + 1}</span>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="satoshiBold text-[1.4vw] text-black mb-[0.2vw]">
                                    {item.date}
                                </h2>
                                <p className="satoshiMedium text-[1.2vw] text-black leading-tight">
                                    {item.menu}
                                </p>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
export default MainDashboardSekolah;