'use client';
import React, { useState, useEffect } from 'react';

interface ComponentItem {
    nama: string;
    porsi: string;
}

interface NutritionItem {
    label: string;
    value: string | number;
}

interface CardMenuProps {
    menu: string;
    date: string;
    day: string;
    status: string; 
    components: ComponentItem[]; 
    risk: string[];        
    nutrition: NutritionItem[]; 
    onSave?: (updatedComponents: ComponentItem[]) => void;
}

const CardDetailSppg: React.FC<CardMenuProps> = ({ 
    menu, date, day, components, onSave 
}) => {
    
    const [editableComponents, setEditableComponents] = useState<ComponentItem[]>(components || []);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setEditableComponents(components || []);
    }, [components]);

    const handleInputChange = (index: number, field: keyof ComponentItem, value: string) => {
        const updated = [...editableComponents];
        updated[index] = { ...updated[index], [field]: value };
        setEditableComponents(updated);
    };

    const handleAddRow = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setEditableComponents([...editableComponents, { nama: "", porsi: "" }]);
    };

    const handleDeleteRow = (index: number, e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const updated = editableComponents.filter((_, i) => i !== index);
        setEditableComponents(updated);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsEditing(false);
        if (onSave) {
            const validData = editableComponents.filter(item => item.nama.trim() !== "");
            onSave(validData);
        }
    };

    const toggleEdit = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (isEditing) setEditableComponents(components || []);
        setIsEditing(!isEditing);
    };

    return (
        // CONTAINER UTAMA
        // Mobile: flex-col-reverse (Elemen ke-2 naik ke atas)
        // Desktop: lg:flex-row (Kiri ke Kanan, ukuran VW TETAP)
        <div className={`
            relative flex flex-col-reverse lg:flex-row w-full 
            bg-[#E87E2F] 
            p-6 gap-6 rounded-2xl
            lg:rounded-[1vw] lg:p-[2vw] lg:gap-[2vw] 
            cursor-default lg:cursor-pointer 
            group hover:bg-[#d67329] transition-all duration-300
            ${isEditing ? 'h-auto' : 'h-auto'}
        `}>
            
            {/* --- ELEMEN 1: KONTEN UTAMA --- */}
            {/* Desktop: Di Kiri. Mobile: Di Bawah (karena reverse) */}
            <div className='flex flex-col w-full lg:w-3/5 gap-2 lg:gap-[0.5vw]'>
                
                <div className="flex flex-col items-start">
                    <h1 className='satoshiBold text-white text-3xl lg:text-[3vw] leading-tight lg:leading-none'>
                        {menu}
                    </h1>
                    
                    <button 
                        onClick={toggleEdit}
                        className={`
                            mt-2 lg:mt-[0.5vw] text-sm lg:text-[1vw] italic cursor-pointer z-10 transition-colors 
                            ${isEditing ? 'text-white satoshiBold underline decoration-2 underline-offset-4' : 'text-white/80 hover:text-white underline'}
                        `}
                    >
                        {isEditing ? "Batal & Kembali" : "Edit Komponen"}
                    </button>
                </div>
                
                <h4 className='satoshiRegular text-white text-sm lg:text-[1vw] mb-2 lg:mb-[0.5vw] opacity-90'>
                    {date}
                </h4>

                {/* List Komponen / Form Edit */}
                <div className='flex flex-row items-start gap-4 lg:gap-[2vw] mt-2 lg:mt-[0.5vw] flex-grow'>
                    <div className={`w-full overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${isEditing ? 'max-h-[300px] lg:max-h-[25vw]' : 'max-h-[200px] lg:max-h-[15vw]'}`}>
                        
                        {isEditing ? (
                            // MODE EDIT
                            <div className="flex flex-col gap-3 lg:gap-[1vw] py-2 lg:py-[0.5vw]">
                                {editableComponents?.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 lg:gap-[0.8vw] items-start sm:items-end bg-white/10 p-3 lg:p-[0.8vw] rounded-lg lg:rounded-[0.8vw] border border-white/20 relative group/row">
                                        
                                        {/* Input Nama */}
                                        <div className="flex flex-col gap-1 lg:gap-[0.3vw] w-full sm:w-[55%]">
                                            <label className="text-white/70 text-xs lg:text-[0.8vw] satoshiRegular ml-1">Nama Menu</label>
                                            <input 
                                                type="text" 
                                                value={item.nama}
                                                onChange={(e) => handleInputChange(index, 'nama', e.target.value)}
                                                className="w-full rounded-md lg:rounded-[0.5vw] px-3 py-2 lg:px-[0.8vw] lg:py-[0.6vw] text-sm lg:text-[1vw] text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-[#E87E2F]/50 outline-none transition-all placeholder-gray-400"
                                                placeholder="Contoh: Nasi Putih"
                                                onClick={(e) => e.preventDefault()}
                                            />
                                        </div>

                                        {/* Input Porsi */}
                                        <div className="flex flex-col gap-1 lg:gap-[0.3vw] w-full sm:w-[30%]">
                                            <label className="text-white/70 text-xs lg:text-[0.8vw] satoshiRegular ml-1">Porsi</label>
                                            <input 
                                                type="text" 
                                                value={item.porsi}
                                                onChange={(e) => handleInputChange(index, 'porsi', e.target.value)}
                                                className="w-full rounded-md lg:rounded-[0.5vw] px-3 py-2 lg:px-[0.8vw] lg:py-[0.6vw] text-sm lg:text-[1vw] text-gray-800 bg-white text-center shadow-sm focus:ring-2 focus:ring-[#E87E2F]/50 outline-none transition-all placeholder-gray-400"
                                                placeholder="100g"
                                                onClick={(e) => e.preventDefault()}
                                            />
                                        </div>

                                        {/* Tombol Hapus */}
                                        <button 
                                            onClick={(e) => handleDeleteRow(index, e)}
                                            className="w-8 h-8 lg:w-[2.5vw] lg:h-[2.5vw] bg-white/20 hover:bg-red-500 text-white rounded-full text-sm lg:text-[1vw] flex justify-center items-center transition-all duration-200 self-end sm:mb-[2px]"
                                            title="Hapus baris ini"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                
                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-[1vw] mt-4 lg:mt-[1vw] pt-4 lg:pt-[1vw] border-t border-white/20">
                                    <button 
                                        onClick={handleAddRow}
                                        className="flex-grow flex items-center justify-center gap-2 border-2 border-white/50 text-white satoshiBold text-sm lg:text-[1vw] py-2 lg:py-[0.6vw] rounded-lg lg:rounded-[0.8vw] hover:bg-white/20 transition-all active:scale-[0.98]"
                                    >
                                        <span>+</span> Tambah Item
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex-grow bg-white text-[#E87E2F] satoshiBold text-sm lg:text-[1vw] py-2 lg:py-[0.6vw] rounded-lg lg:rounded-[0.8vw] hover:bg-gray-50 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // MODE VIEW
                            <ul className="grid grid-cols-1 gap-y-1 lg:gap-y-[0.5vw] w-full list-disc list-inside text-white satoshiBold text-base lg:text-[1.3vw]">
                                {editableComponents && editableComponents.length > 0 ? (
                                    editableComponents.map((component, index) => (
                                        <li key={index} className="truncate leading-relaxed">
                                            <span>{component.nama}</span> 
                                            <span className="opacity-90 font-normal ml-1 text-sm lg:text-[1.1vw]">
                                                {component.porsi && component.porsi !== '-' ? `(${component.porsi})` : ''}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-none text-sm lg:text-[1vw] italic opacity-70 py-2">Belum ada komponen yang terdaftar.</li>
                                )}
                            </ul>
                        )}
                        
                        {!isEditing && (
                            <h2 className='text-white satoshiBold mt-4 lg:mt-0 lg:ml-auto flex justify-start lg:justify-end text-sm lg:text-[1vw] underline decoration-white/50 underline-offset-4'>
                                Detail Informasi &gt;
                            </h2>
                        )}
                    </div>
                </div>
            </div>
            
            {/* --- ELEMEN 2: KOTAK HARI --- */}
            {/* Desktop: Di Kanan (lg:w-2/5). Mobile: Di Atas (karena flex-col-reverse) */}
            {/* mb-4 di mobile agar ada jarak ke konten di bawahnya. lg:mb-0 agar nempel di desktop */}
            <div className='flex-grow flex justify-center items-center bg-white rounded-[1vw] p-[1vw] shadow-sm'>
                <h1 className='satoshiBold text-4xl lg:text-[3vw] text-[#E87E2F] uppercase tracking-wide'>
                    {day}
                </h1>
            </div>

        </div>
    );
}

export default CardDetailSppg;