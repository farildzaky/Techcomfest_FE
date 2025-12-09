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
        <div className="relative flex flex-row w-full h-auto rounded-[1vw] p-[2vw] bg-[#E87E2F] gap-[2vw] cursor-pointer hover:bg-[#d67329] transition-colors">
            <h1 className='absolute bottom-[0.5vw] right-[1vw] text-white satoshiBold text-[1.5vw]'>Detail Informasi</h1>
            <div className='flex flex-col w-4/5 gap-[0.5vw]'>
                <h1 className='satoshiBold text-white text-[3vw] leading-none'>{menu}</h1>
                <h4 className='satoshiRegular text-white text-[1vw]'> {date}</h4>

                <div className='flex flex-row items-end'>
                    <ul className="grid grid-cols-2 gap-x-[2vw] w-full list-disc list-inside text-white satoshiBold text-[1.3vw] w-[70%]">
                        {components.map((component, index) => (
                            <li key={index}>{component}</li>
                        ))}
                    </ul>

                    <h2 className={`satoshiBold text-white text-[1.2vw] rounded-[2vw] p-[0.5vw] text-nowrap w-[30%] flex items-center justify-center`} style={{ backgroundColor: bgColor }}>{status}</h2>
                </div>

                <div className='grid-cols-9 grid gap-[1vw] mt-[1vw] h-[10vw]'>
                    <div className='bg-[#FFF3EB] rounded-[1vw] col-span-5 p-[0.5vw] gap-[0.5vw] overflow-y-auto'>
                        <h2 className='satoshiBold text-[1.2vw]'>Risiko Umum</h2>
                        <ul className="list-disc list-inside text-black satoshiRegular text-[1.2vw]">
                            {risk.map((riskItem, index) => (
                                <li key={index}>{riskItem}</li>
                            ))}
                        </ul>
                    </div>
                    <div className='bg-[#FFF3EB] rounded-[1vw] col-span-4 p-[0.5vw] overflow-y-auto'>
                        <h2 className='satoshiBold text-[1.2vw] '>Ringkasan Gizi</h2>
                        <ul className="list-disc list-inside text-black satoshiRegular text-[1.2vw]">
                            {nutrition.map((nutritionItem, index) => (
                                <li key={index}>{nutritionItem.label}: {nutritionItem.value}</li>
                            ))}
                        </ul>    
                    </div>
                </div>
            </div>
            
            <div className='w-2/5 flex justify-center items-center bg-white rounded-[1vw] mb-[1vw]'>
                <h1 className='satoshiBold text-[3vw]'>{day}</h1>
            </div>

        </div>
    );
}

export default CardDetail;