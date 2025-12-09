'use client'
import React, { useState, useEffect } from 'react';

export interface MenuData {
    tanggal: string; 
    nama_menu: string;
    komponen_menu: { nama: string; porsi: string }[];
}

interface CardFormProps {
    hari: string;
    onUpdate: (data: MenuData) => void; 
}

const CardFormMenuMbg = ({ hari, onUpdate }: CardFormProps) => {
    const [tanggalInput, setTanggalInput] = useState(""); 
    const [namaMenu, setNamaMenu] = useState("");
    const [komponenList, setKomponenList] = useState([
        { nama: "", porsi: "" },
        { nama: "", porsi: "" },
        { nama: "", porsi: "" }
    ]);

    useEffect(() => {
        const fullDate = tanggalInput ? `${hari}, ${tanggalInput}` : "";

        onUpdate({
            tanggal: fullDate,
            nama_menu: namaMenu,
            komponen_menu: komponenList.filter(k => k.nama !== "" || k.porsi !== "")
        });
    }, [tanggalInput, namaMenu, komponenList, hari]);

    const addKomponen = () => {
        setKomponenList([...komponenList, { nama: "", porsi: "" }]);
    };

    const removeKomponen = (index: number) => {
        if (komponenList.length > 1) {
            setKomponenList(komponenList.filter((_, i) => i !== index));
        }
    };

    const handleKomponenChange = (index: number, field: 'nama' | 'porsi', value: string) => {
        const newList = [...komponenList];
        newList[index][field] = value;
        setKomponenList(newList);
    };

    return (
        <div className="w-full rounded-[1.5vw] bg-[#E87E2F]"
            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
        >
            <div
                className="w-full py-[0.8vw] flex justify-center items-center rounded-t-[1.5vw]"
                style={{
                    background: 'linear-gradient(180deg, #C86F2C 0%, #D7762E 100%)',
                    boxShadow: '0px 4px 4px 0px #00000025'
                }}
            >
                <h2 className="satoshiBold text-white text-[2.5vw]">{hari}</h2>
            </div>

            <div className="w-full py-[2vw] flex flex-col gap-[1.5vw]">

                <div className="flex flex-col gap-[0.5vw] pl-[2vw] pr-[3vw]">
                    <label className="satoshiMedium text-white text-[1.2vw]">Tanggal</label>
                    <input
                        type="text"
                        value={tanggalInput}
                        onChange={(e) => setTanggalInput(e.target.value)}
                        placeholder="Contoh: 12 Januari 2026"
                        className="w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] bg-white satoshiMedium text-[1.2vw] text-[#E87E2F] outline-none placeholder:text-[#E87E2F]/40"
                    />
                </div>

                <div className="flex flex-col gap-[0.5vw] pl-[2vw] pr-[3vw]">
                    <label className="satoshiMedium text-white text-[1.2vw]">Menu Makanan Utama</label>
                    <input
                        type="text"
                        value={namaMenu}
                        onChange={(e) => setNamaMenu(e.target.value)}
                        placeholder="Masukkan nama menu makanan utama"
                        className="w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] bg-white satoshiMedium text-[1.2vw] text-[#E87E2F] outline-none placeholder:text-[#E87E2F]/40"
                    />
                </div>

                <div className="flex flex-col gap-[0.5vw] pl-[2vw] pr-[3vw] relative">
                    <label className="satoshiMedium text-white text-[1.2vw]">Detail Komponen</label>

                    <div className="flex flex-col gap-[0.8vw]">
                        {komponenList.map((item, index) => (
                            <div key={index} className="flex gap-[1vw] flex-row w-full items-center relative">
                                <input
                                    type="text"
                                    value={item.nama}
                                    onChange={(e) => handleKomponenChange(index, 'nama', e.target.value)}
                                    placeholder="Komponen (Nasi, Ayam, dll)"
                                    className="rounded-[0.8vw] w-[65%] px-[1.5vw] py-[0.8vw] bg-white satoshiMedium text-[1.2vw] text-[#E87E2F] outline-none placeholder:text-[#E87E2F]/40"
                                />
                                
                                <input
                                    type="text"
                                    value={item.porsi}
                                    onChange={(e) => handleKomponenChange(index, 'porsi', e.target.value)}
                                    placeholder="Porsi (100g)"
                                    className="rounded-[0.8vw] w-[25%] px-[1vw] py-[0.8vw] bg-white satoshiMedium text-[1.2vw] text-[#E87E2F] text-center outline-none placeholder:text-[#E87E2F]/40"
                                />

                                <button 
                                    onClick={() => removeKomponen(index)}
                                    className="shrink-0 hover:scale-110 transition-transform ml-auto"
                                    type="button"
                                >
                                    <svg width="2vw" height="2vw" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="12" fill="white"/>
                                        <path d="M7 12H17" stroke="#E87E2F" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-[0.5vw]">
                        <button
                            onClick={addKomponen}
                            className="bg-white text-[#E87E2F] satoshiBold text-[0.9vw] px-[1.5vw] py-[0.5vw] rounded-full hover:bg-orange-50 transition-colors shadow-sm flex items-center gap-[0.5vw]"
                        >
                            + Komponen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardFormMenuMbg;