'use client';
import React, { useState } from 'react';

interface NutritionItem {
    label: string;
    value: string;
}

interface CardMenuProps {
    menu: string;
    date: string;
    day: string;
    status: string;
    components: string[];
    risk: string[];
    nutrition: NutritionItem[];
}

const CardDetail: React.FC<CardMenuProps> = ({ menu, date, day, status, components, risk, nutrition }) => {

    const [bgColor] = useState<string>(() => {
        switch (status.toLowerCase()) {
            case 'aman':
                return '#07B563'; 
            case 'perlu perhatian':
                return '#FCCF34'; 
            case 'tidak aman':
                return '#EF0E20'; 
            default:
                return '#07B563'; 
        }
    });

    return (
        // Mobile: Flex Column, Padding standar (p-4), Rounded standar
        // Desktop (lg): Flex Row, Padding VW, Rounded VW, Tinggi Auto
        <div className="relative flex flex-col-reverse lg:flex-row w-full h-auto rounded-xl lg:rounded-[1vw] p-4 lg:p-[2vw] bg-[#E87E2F] gap-4 lg:gap-[2vw] cursor-pointer hover:bg-[#d67329] transition-colors mb-4 lg:mb-0">
            
            {/* Label "Detail Informasi" - Hidden di Mobile agar tidak menutupi, Muncul di Desktop */}
            <h1 className='hidden lg:block absolute bottom-[0.5vw] right-[1vw] text-white satoshiBold text-[1.5vw]'>Detail Informasi</h1>
            
            {/* Bagian Kiri (Konten Teks) */}
            <div className='flex flex-col w-full lg:w-4/5 gap-2 lg:gap-[0.5vw]'>
                
                {/* Judul Menu */}
                <h1 className='satoshiBold text-white text-2xl lg:text-[3vw] leading-none'>{menu}</h1>
                
                {/* Tanggal */}
                <h4 className='satoshiRegular text-white text-sm lg:text-[1vw]'> {date}</h4>

                {/* Komponen & Status */}
                <div className='flex flex-col lg:flex-row items-start lg:items-end gap-2 lg:gap-0'>
                    <ul className="grid grid-cols-2 gap-x-4 lg:gap-x-[2vw] w-full lg:w-[70%] list-disc list-inside text-white satoshiBold text-base lg:text-[1.3vw]">
                        {components.map((component, index) => (
                            <li key={index}>{component}</li>
                        ))}
                    </ul>

                    {/* Status Badge */}
                    <h2 
                        className={`satoshiBold text-white text-sm lg:text-[1.2vw] rounded-full lg:rounded-[2vw] px-3 py-1 lg:p-[0.5vw] text-nowrap w-fit lg:w-[30%] flex items-center justify-center mt-2 lg:mt-0`} 
                        style={{ backgroundColor: bgColor }}
                    >
                        {status}
                    </h2>
                </div>

                {/* Grid Risiko & Gizi */}
                <div className='grid grid-cols-1 lg:grid-cols-9 gap-4 lg:gap-[1vw] mt-4 lg:mt-[1vw] h-auto lg:h-[10vw]'>
                    
                    {/* Risiko Umum */}
                    <div className='bg-[#FFF3EB] rounded-lg lg:rounded-[1vw] col-span-1 lg:col-span-5 p-3 lg:p-[0.5vw] gap-[0.5vw] overflow-y-auto min-h-[100px] lg:min-h-0'>
                        <h2 className='satoshiBold text-base lg:text-[1.2vw] mb-1'>Risiko Umum</h2>
                        <ul className="list-disc list-inside text-black satoshiRegular text-sm lg:text-[1.2vw]">
                            {risk.map((riskItem, index) => (
                                <li key={index}>{riskItem}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Ringkasan Gizi */}
                    <div className='bg-[#FFF3EB] rounded-lg lg:rounded-[1vw] col-span-1 lg:col-span-4 p-3 lg:p-[0.5vw] overflow-y-auto min-h-[100px] lg:min-h-0'>
                        <h2 className='satoshiBold text-base lg:text-[1.2vw] mb-1'>Ringkasan Gizi</h2>
                        <ul className="list-disc list-inside text-black satoshiRegular text-sm lg:text-[1.2vw]">
                            {nutrition.map((nutritionItem, index) => (
                                <li key={index}>{nutritionItem.label}: {nutritionItem.value}</li>
                            ))}
                        </ul>    
                    </div>
                </div>
            </div>
            
            {/* Bagian Kanan (Hari) - Di mobile pindah ke atas (flex-col-reverse parent) */}
            <div className='w-full lg:w-2/5 flex justify-center items-center bg-white rounded-xl lg:rounded-[1vw] mb-2 lg:mb-[1vw] py-4 lg:py-0'>
                <h1 className='satoshiBold text-4xl lg:text-[3vw] text-[#E87E2F] lg:text-black'>{day}</h1>
            </div>

        </div>
    );
}

export default CardDetail;