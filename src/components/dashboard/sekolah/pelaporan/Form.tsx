'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image';

interface MenuData {
    id: string;
    tanggal: string;     
    nama_menu: string;   
    komponen_menu: string[] | string; 
}

const FormPelaporanSkeleton = () => {
    return (
        <div className="w-full h-full p-[3vw] bg-white animate-pulse">
            <div className="mb-[2.5vw]">
                <div className="h-[3vw] w-[20vw] bg-gray-300 rounded mb-[0.5vw]"></div>
                <div className="h-[1vw] w-[30vw] bg-gray-200 rounded"></div>
            </div>

            <div className="flex gap-[4vw]">
                <div className="flex-1 flex flex-col gap-[1.5vw]">
                    <div>
                        <div className="h-[1.2vw] w-[12vw] bg-gray-300 rounded mb-[0.5vw]"></div>
                        <div className="h-[0.9vw] w-[18vw] bg-gray-200 rounded mb-[0.5vw]"></div>
                        <div className="w-full h-[3.5vw] bg-gray-300 rounded-[0.8vw]"></div>
                    </div>

                    <div>
                        <div className="h-[1.2vw] w-[12vw] bg-gray-300 rounded mb-[0.5vw]"></div>
                        <div className="h-[0.9vw] w-[18vw] bg-gray-200 rounded mb-[0.5vw]"></div>
                        <div className="w-full h-[3.5vw] bg-gray-300 rounded-[0.8vw]"></div>
                    </div>

                    <div>
                        <div className="h-[1.2vw] w-[15vw] bg-gray-300 rounded mb-[0.5vw]"></div>
                        <div className="h-[0.9vw] w-[20vw] bg-gray-200 rounded mb-[0.5vw]"></div>
                        <div className="w-full h-[8vw] bg-gray-300 rounded-[0.8vw]"></div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                     <div className="flex flex-col h-full">
                        <div className="h-[1.2vw] w-[10vw] bg-gray-300 rounded mb-[0.5vw]"></div>
                        <div className="h-[0.9vw] w-[22vw] bg-gray-200 rounded mb-[0.5vw]"></div>
                        <div className="w-full flex-1 bg-gray-300 rounded-[0.8vw] min-h-[15vw]"></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-[2.5vw]">
                <div className="w-[10vw] h-[3.5vw] bg-gray-300 rounded-[2vw]"></div>
            </div>
        </div>
    );
};

const FormPelaporan = () => {
    const [formData, setFormData] = useState({
        menuId: '',      
        menuUtama: '',   
        komponen: '',    
        catatan: ''      
    });

    const [menuOptions, setMenuOptions] = useState<MenuData[]>([]);
    const [loadingMenu, setLoadingMenu] = useState(true);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [fileObj, setFileObj] = useState<File | null>(null);
    const [fotoName, setFotoName] = useState("");
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchMenus = async () => {
            setLoadingMenu(true);
            try {
                const response = await fetchWithAuth('/school/menus', { method: 'GET' });
                if (response.ok) {
                    const result = await response.json();
                    const allMenus: MenuData[] = result.data || [];

                    const sortedMenus = allMenus.slice(0, 10); 

                    setMenuOptions(sortedMenus);
                }
            } catch (error) {
                console.error("Error fetching menus:", error);
            } finally {
                setLoadingMenu(false);
            }
        };
        fetchMenus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectMenu = (menu: MenuData) => {
        let komponenString = "";
        if (Array.isArray(menu.komponen_menu)) {
            komponenString = menu.komponen_menu.join(', ');
        } else if (typeof menu.komponen_menu === 'string') {
            komponenString = menu.komponen_menu;
        }

        setFormData(prev => ({
            ...prev,
            menuId: menu.id,
            menuUtama: `${menu.nama_menu} — ${menu.tanggal}`,
            komponen: komponenString
        }));
        
        setErrors(prev => ({ ...prev, menuId: '' }));
        setIsDropdownOpen(false); 
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setErrors(prev => ({ ...prev, file: '' }));
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, file: "Format harus JPG/PNG." }));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, file: "Maksimal 5MB." }));
                return;
            }

            setFileObj(file);
            setFotoName(file.name);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.menuId) newErrors.menuId = "Wajib memilih menu makanan.";
        if (!formData.komponen.trim()) newErrors.komponen = "Komponen wajib diisi.";
        if (!formData.catatan.trim()) newErrors.catatan = "Catatan wajib diisi.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Mohon lengkapi data.");
            return;
        }

        setIsSubmitting(true);
        try {

            const combinedNote = `Komponen: ${formData.komponen}\n\nCatatan: ${formData.catatan}`;

            const payload = new FormData();
            payload.append('menu_id', formData.menuId);
            
            payload.append('catatan', combinedNote);


            if (fileObj) {
                payload.append('foto_menu', fileObj); 
            }

            const response = await fetchWithAuth('/school/reports', {
                method: 'POST',
                body: payload 
            });

            const responseJson = await response.json();

            if (!response.ok) {
                const errorMsg = responseJson.message || "Gagal kirim data.";
                throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
            }

            alert("Laporan berhasil dikirim!");
            setFormData({ menuId: '', menuUtama: '', komponen: '', catatan: '' });
            setFileObj(null); setFotoName(""); setFotoPreview(null);
            
        } catch (error: any) {
            console.error("Submit Error:", error);
            alert(`Gagal: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingMenu) return <FormPelaporanSkeleton />;

    return (
        <div className="w-full h-full p-[3vw] bg-white">
            
            <div className="mb-[2.5vw]">
                <h1 className="satoshiBold text-[3vw] text-black leading-tight">Lapor Menu Makanan</h1>
                <p className="satoshiMedium text-[1.1vw] text-black mt-[0.5vw]">
                    Pilih menu mingguan dan unggah bukti laporan.
                </p>
            </div>

            <div className="flex gap-[4vw]">
                
                <div className="flex-1 flex flex-col gap-[1.5vw]">
                    
                    <div>
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Foto Menu Makanan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Unggah foto menu (Opsional, Max 5MB)</p>
                        
                        <div className={`relative w-full border-[0.15vw] ${errors.file ? 'border-red-500' : 'border-[#E87E2F]'} rounded-[0.8vw] flex items-center px-[1vw] py-[0.8vw] cursor-pointer hover:bg-orange-50 transition-colors`}>
                            <span className="text-[#E87E2F] mr-[0.8vw]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.5vw] h-[1.5vw]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                            </span>
                            <span className='bg-[#D7762E] w-[0.1vw] h-[1.5vw] mr-[0.5vw] '/>
                            <span className={`satoshiMedium text-[1vw] truncate mr-[1vw] ${fotoName ? 'text-black' : 'text-gray-400'}`}>
                                {fotoName || "Unggah dokumen .jpg, .png"}
                            </span>
                            <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {errors.file && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.file}</p>}
                        
                        {fotoPreview && (
                            <div className="mt-[1vw] w-full h-[15vw] border-[0.15vw] border-[#E87E2F] rounded-[0.8vw] overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover"/>
                                <button onClick={() => { setFotoName(""); setFotoPreview(null); setFileObj(null); }} className="absolute top-[0.5vw] right-[0.5vw] bg-red-500 text-white rounded-full p-[0.3vw] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1vw] h-[1vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div ref={dropdownRef} className="relative">
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Menu Makanan Utama</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Pilih dari daftar menu (Mulai Senin)</p>
                        
                        <div 
                            onClick={() => !loadingMenu && setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full px-[1vw] py-[0.8vw] rounded-[0.8vw] flex justify-between items-center border-[0.15vw] cursor-pointer hover:bg-orange-50 transition-colors ${formData.menuId ? 'border-[#E87E2F]' : 'border-[#E87E2F]'}`}
                        >
                            <div className="flex flex-col">
                                {formData.menuId ? (
                                    <span className="satoshiMedium text-[1vw] opacity-90">{formData.menuUtama}</span>
                                ) : (
                                    <span className={`satoshiMedium text-[1vw] truncate mr-[1vw] ${fotoName ? 'text-black' : 'text-gray-400'}`}>{loadingMenu ? "Memuat..." : "Pilih Menu Makanan"}</span>
                                )}
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-10 top-full mt-[0.5vw] left-0 w-full bg-white border border-gray-200 rounded-[0.5vw] shadow-xl max-h-[15vw] overflow-y-auto">
                                {menuOptions.length > 0 ? (
                                    menuOptions.map((menu) => (
                                        <div 
                                            key={menu.id}
                                            onClick={() => handleSelectMenu(menu)}
                                            className="px-[1.5vw] py-[1vw] hover:bg-[#FFF3EB] cursor-pointer border-b border-gray-100 last:border-0 transition-colors group"
                                        >
                                            <p className="satoshiBold text-[1.1vw] text-[#6A655F] group-hover:text-[#E87E2F]">
                                                {menu.nama_menu}
                                            </p>
                                            <p className="satoshiMedium text-[0.9vw] text-gray-400">
                                                {menu.tanggal}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-[1.5vw] text-center text-gray-500 satoshiMedium text-[1vw]">
                                        Tidak ada menu tersedia
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {errors.menuId && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.menuId}</p>}
                    </div>

                    <div>
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Komponen Menu Makanan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Komponen menu (Otomatis terisi, silakan koreksi)</p>
                        <textarea 
                             name="komponen"
                             value={formData.komponen}
                             onChange={handleInputChange}
                             placeholder="Pilih menu terlebih dahulu..."
                             className={`w-full border-[0.15vw] ${errors.komponen ? 'border-red-500' : 'border-[#E87E2F]'} rounded-[0.8vw] px-[1vw] py-[0.8vw] satoshiMedium text-[1vw] outline-none placeholder-gray-300 h-[8vw] resize-none focus:ring-1 focus:ring-[#E87E2F]`}
                        />
                        {errors.komponen && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.komponen}</p>}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                     <div className="flex flex-col h-full">
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Catatan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Masukkan catatan detail mengenai pelaporan ini</p>
                        <textarea 
                             name="catatan"
                             value={formData.catatan}
                             onChange={handleInputChange}
                             placeholder="Tulis catatan di sini..."
                             className={`w-full flex-1 border-[0.15vw] ${errors.catatan ? 'border-red-500' : 'border-[#E87E2F]'} rounded-[0.8vw] p-[1vw] satoshiMedium text-[1vw] outline-none placeholder-gray-300 resize-none focus:ring-1 focus:ring-[#E87E2F] min-h-[15vw]`}
                        />
                        {errors.catatan && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.catatan}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-[2.5vw]">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`bg-[#E87E2F] text-white satoshiBold text-[1.3vw] py-[0.8vw] px-[5vw] rounded-[2vw] transition-all shadow-md 
                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#b06a33] active:scale-95'}`}
                >
                    {isSubmitting ? "Mengirim..." : "Kirim"}
                </button>
            </div>
        </div>
    );
}

export default FormPelaporan;