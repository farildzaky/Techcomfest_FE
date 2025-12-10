'use client'
import React from 'react';
import Link from 'next/link';
import Sidebar from "@/src/components/common/Sidebar";
import { weeklyMenus } from "@/src/data/MenuMbg";

const RiwayatMenuPage = () => {
    return (
        <div className="min-h-screen">

            <div>
                <div className="p-[3vw] ">

                    <h1 className="satoshiBold text-[2.5vw] text-black mb-[2vw]">Riwayat Menu</h1>

                    <div className="w-full bg-white rounded-[1.5vw] overflow-hidden border-[0.2vw] border-[#E87E2F]">

                        <div className="flex bg-[#E87E2F] text-white">
                            <div className="w-[10%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">
                                No
                            </div>
                            <div className="w-[35%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">
                                Tanggal Diberikan
                            </div>
                            <div className="w-[35%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">
                                Menu
                            </div>
                            <div className="w-[20%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">
                                Detail
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {weeklyMenus.map((item, index) => (
                                <div key={item.id} className={`flex border-b-[0.15vw] border-[#E87E2F] last:border-b-0 ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'
                                    } hover:opacity-95`}
                                >

                                    <div className="w-[10%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {index + 1}
                                    </div>

                                    <div className="w-[35%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {item.date}
                                    </div>

                                    <div className="w-[35%] py-[1.5vw] px-[1vw] flex justify-center items-center text-center border-r-[0.15vw] border-[#E87E2F] satoshiMedium text-[1.2vw] text-black">
                                        {item.menu}
                                    </div>

                                    <div className="w-[20%] py-[1.5vw] flex justify-center items-center">
                                        <Link
                                            href={`/sekolah/menu-mbg/${item.id}`}
                                            className="text-[#E87E2F] underline satoshiMedium text-[1.2vw] hover:text-[#b06a33] cursor-pointer"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {weeklyMenus.length === 0 && (
                            <div className="p-[2vw] text-center satoshiMedium text-[1.2vw] text-gray-500">
                                Belum ada riwayat menu.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RiwayatMenuPage;