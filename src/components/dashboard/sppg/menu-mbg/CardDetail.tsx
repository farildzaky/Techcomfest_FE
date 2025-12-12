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
    // Tambahkan prop onDelete
    onDelete?: () => void;
}

const CardDetailSppg: React.FC<CardMenuProps> = ({ 
    menu, date, day, components, onSave, onDelete 
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

    // Handler untuk tombol delete utama
    const handleDeleteMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Mencegah navigasi Link
        e.stopPropagation(); // Mencegah event bubbling
        if (onDelete) {
            // Konfirmasi sederhana sebelum menghapus (opsional, bisa juga di parent)
            if (window.confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
                onDelete();
            }
        }
    };

    return (
        <div className={`
            relative flex flex-col-reverse lg:flex-row w-full 
            bg-[#E87E2F] 
            p-6 gap-6 rounded-2xl
            lg:rounded-[1vw] lg:p-[2vw] lg:gap-[2vw] 
            cursor-default lg:cursor-pointer 
            group hover:bg-[#d67329] transition-all duration-300
            ${isEditing ? 'h-auto' : 'h-auto'}
        `}>
            
            {/* TOMBOL DELETE MENU (Pojok Kanan Atas Container) */}
            {onDelete && (
                <button
                    onClick={handleDeleteMenu}
                    className="absolute top-4 right-4 lg:top-[1vw] lg:right-[1vw] z-20 
                               w-8 h-8 lg:w-[3vw] lg:h-[3vw] 
                               flex items-center justify-center 
                               bg-white/20 hover:bg-red-500 text-white 
                               rounded-full backdrop-blur-sm transition-all duration-200
                               shadow-sm hover:shadow-md group/delete"
                    title="Hapus Menu Ini"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            )}

            {/* --- ELEMEN 1: KONTEN UTAMA --- */}
            <div className='flex flex-col w-full lg:w-3/5 gap-2 lg:gap-[0.5vw]'>
                
                <div className="flex flex-col items-start pr-8 lg:pr-[3vw]"> {/* Padding right agar tidak ketutup tombol delete di mobile jika judul panjang */}
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
                            // MODE EDIT (Sama seperti sebelumnya)
                            <div className="flex flex-col gap-3 lg:gap-[1vw] py-2 lg:py-[0.5vw]">
                                {editableComponents?.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 lg:gap-[0.8vw] items-start sm:items-end bg-white/10 p-3 lg:p-[0.8vw] rounded-lg lg:rounded-[0.8vw] border border-white/20 relative group/row">
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
            <div className='flex-grow flex justify-center items-center bg-white rounded-[1vw] p-[1vw] shadow-sm'>
                <h1 className='satoshiBold text-4xl lg:text-[3vw] text-[#E87E2F] uppercase tracking-wide'>
                    {day}
                </h1>
            </div>

        </div>
    );
}

export default CardDetailSppg;