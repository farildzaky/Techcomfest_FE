import React from 'react';

interface CardMenuProps {
    menu: string;
    day: string;
}

const CardMenu: React.FC<CardMenuProps> = ({ menu, day }) => {
    return (
        <div className="relative flex flex-col justify-center items-center w-full bg-[#D7762E]
            
            h-[30vw] rounded-[3vw] pt-[5vw] mt-[4vw] lg:mt-0 px-[2vw] pb-[2vw] md:h-[22vw] md:pt-0
        
            lg:h-[11vw] lg:rounded-[1vw] lg:pt-[4vw] lg:px-[1vw] lg:pb-[4vw]"
        >
            {/* Lingkaran Hari */}
            <div className='absolute bg-[#FAF6E6] flex justify-center items-center text-black satoshiBold rounded-full shadow-md
              
                top-[-6vw] w-[16vw] h-[16vw] text-[4.5vw] px-[1vw] md:h-[12vw] md:w-[12vw] md:text-[3vw]
   
                lg:top-[-3vw] lg:w-[6vw] lg:h-[6vw] lg:text-[1.5vw] lg:px-[0.5vw]'
                style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
            >
                {day}
            </div>

            {/* Judul Menu */}
            <h1 className='text-white satoshiBold text-center leading-tight

                text-[3vw] md:text-[2.5vw]
     
                lg:text-[1vw] lg:pt-[1vw]'
            >
                {menu}
            </h1>

            {/* Tulisan Detail */}
            <div className="absolute text-white satoshiRegular
     
                bottom-[2vw] right-[3vw] text-[3vw]
   
                lg:bottom-[0.2vw] lg:right-[0.5vw] lg:text-[1.2vw]"
            >
                detail
            </div>
        </div>
    );
};

export default CardMenu;