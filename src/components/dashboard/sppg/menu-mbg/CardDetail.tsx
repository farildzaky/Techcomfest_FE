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
        e.preventDefault();
        e.stopPropagation();
        setEditableComponents([...editableComponents, { nama: "", porsi: "" }]);
    };

    const handleDeleteRow = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const updated = editableComponents.filter((_, i) => i !== index);
        setEditableComponents(updated);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        setIsEditing(false);
        if (onSave) {
            const validData = editableComponents.filter(item => item.nama.trim() !== "");
            onSave(validData);
        }
    };

    const toggleEdit = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (isEditing) {
            setEditableComponents(components || []);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className={`relative flex flex-row w-full ${isEditing ? 'h-auto' : 'h-auto'} rounded-[1vw] p-[2vw] bg-[#E87E2F] gap-[2vw] cursor-pointer hover:bg-[#d67329] transition-all duration-300 group`}>
            
            <div className='flex flex-col w-3/5 gap-[0.5vw]'>
                <div className="flex flex-col items-start">
                    <h1 className='satoshiBold text-white text-[3vw] leading-none'>{menu}</h1>
                    
                    <button 
                        onClick={toggleEdit}
                        className={`mt-[0.5vw] text-[1vw] italic cursor-pointer z-10 transition-colors ${isEditing ? 'text-white satoshiBold underline decoration-2 underline-offset-4' : 'text-white/80 hover:text-white underline'}`}
                    >
                        {isEditing ? "Batal & Kembali" : "Edit Komponen"}
                    </button>
                </div>
                
                <h4 className='satoshiRegular text-white text-[1vw] mb-[0.5vw]'>{date}</h4>

                <div className='flex flex-row items-start gap-[2vw] mt-[0.5vw] flex-grow'>
                    <div className={`w-full overflow-y-auto pr-[0.5vw] custom-scrollbar transition-all duration-300 ${isEditing ? 'max-h-[25vw]' : 'max-h-[15vw]'}`}>
                        
                        {isEditing ? (
                            <div className="flex flex-col gap-[1vw] py-[0.5vw]">
                                {editableComponents?.map((item, index) => (
                                    <div key={index} className="flex gap-[0.8vw] items-end bg-white/10 p-[0.8vw] rounded-[0.8vw] border border-white/20 relative group/row">
                                        
                                        <div className="flex flex-col gap-[0.3vw] w-[55%]">
                                            <label className="text-white/70 text-[0.8vw] satoshiRegular ml-[0.2vw]">Nama Menu</label>
                                            <input 
                                                type="text" 
                                                value={item.nama}
                                                onChange={(e) => handleInputChange(index, 'nama', e.target.value)}
                                                className="w-full rounded-[0.5vw] px-[0.8vw] py-[0.6vw] text-[1vw] text-gray-800 bg-white shadow-sm border-transparent focus:border-[#E87E2F]/30 focus:ring-2 focus:ring-[#E87E2F]/50 focus:outline-none transition-all placeholder-gray-400"
                                                placeholder="Contoh: Nasi Putih"
                                                onClick={(e) => e.preventDefault()}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-[0.3vw] w-[30%]">
                                            <label className="text-white/70 text-[0.8vw] satoshiRegular ml-[0.2vw]">Porsi/Gram</label>
                                            <input 
                                                type="text" 
                                                value={item.porsi}
                                                onChange={(e) => handleInputChange(index, 'porsi', e.target.value)}
                                                className="w-full rounded-[0.5vw] px-[0.8vw] py-[0.6vw] text-[1vw] text-gray-800 bg-white shadow-sm border-transparent focus:border-[#E87E2F]/30 focus:ring-2 focus:ring-[#E87E2F]/50 focus:outline-none transition-all placeholder-gray-400 text-center"
                                                placeholder="Contoh: 100g"
                                                onClick={(e) => e.preventDefault()}
                                            />
                                        </div>

                                        <button 
                                            onClick={(e) => handleDeleteRow(index, e)}
                                            className="w-[2.5vw] h-[2.5vw] mb-[0.2vw] bg-white/20 hover:bg-red-500 text-white/80 hover:text-white rounded-full text-[1vw] flex justify-center items-center transition-all duration-200 hover:scale-110 active:scale-95"
                                            title="Hapus baris ini"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                
                                <div className="flex gap-[1vw] mt-[1vw] pt-[1vw] border-t border-white/20">
                                    <button 
                                        onClick={handleAddRow}
                                        className="flex-grow flex items-center justify-center gap-[0.5vw] border-2 border-white/50 text-white satoshiBold text-[1vw] py-[0.6vw] rounded-[0.8vw] hover:bg-white/20 transition-all active:scale-[0.98]"
                                    >
                                        <span className="text-[1.2vw] leading-none">+</span> Tambah Item
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex-grow bg-white text-[#E87E2F] satoshiBold text-[1vw] py-[0.6vw] rounded-[0.8vw] hover:bg-gray-50 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 gap-y-[0.5vw] w-full list-disc list-inside text-white satoshiBold text-[1.3vw]">
                                {editableComponents && editableComponents.length > 0 ? (
                                    editableComponents.map((component, index) => (
                                        <li key={index} className="truncate leading-relaxed">
                                            <span>{component.nama}</span> 
                                            <span >
                                                {component.porsi && component.porsi !== '-' ? ` ${component.porsi}` : ''}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-none text-[1vw] italic opacity-70 py-[1vw]">Belum ada komponen yang terdaftar.</li>
                                )}
                            </ul>
                        )}
                        <h2 className='text-white satoshiBold ml-auto flex justify-end text-[1vw]'>Detail Informasi</h2>
                    </div>
                    
                </div>
            </div>
            
            <div className='flex-grow flex justify-center items-center bg-white rounded-[1vw] p-[1vw] shadow-sm'>
                <h1 className='satoshiBold text-[3vw] text-[#E87E2F]'>{day}</h1>
            </div>

        </div>
    );
}

export default CardDetailSppg;