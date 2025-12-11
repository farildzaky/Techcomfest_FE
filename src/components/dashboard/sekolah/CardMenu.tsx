import React from 'react';
interface CardMenuProps {
    menu: string;
    day: string;
}

const CardMenu: React.FC<CardMenuProps> = ({ menu, day }) => {
    return (
        <div className="relative flex flex-col justify-center items-center w-full h-[20vw] lg:h-[11vw] rounded-[1vw] pt-[4vw] px-[1vw] pb-[4vw] bg-[#D7762E]">
            <div className='absolute top-[-3vw] lg:w-[6vw] lg:h-[6vw]  w-[9vw] h-[9vw] flex justify-center items-center text-black satoshiBold  text-[2.5vw] lg:text-[1.5vw] bg-[#FAF6E6] px-[0.5vw] rounded-full'
                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}

            >
                {day}
            </div>
            <h1 className='text-white satoshiBold text-center text-[3vw] lg:text-[1vw] pt-[1vw]'>{menu}</h1>
            <div className="absolute bottom-[0.2vw] right-[0.5vw] text-white  satoshiRegular text-[1.2vw]">
                detail
            </div>

        </div>
    );
};

export default CardMenu;