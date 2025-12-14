'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image';
import bg from "../../../../assets/bg.png";
import loadingSpinner from "../../../../assets/loading.png";

interface MenuData {
    id: string;
    tanggal: string;     
    nama_menu: string;   
    komponen_menu: string[] | string; 
}

// --- Skeleton Responsive ---
const FormPelaporanSkeleton = () => {
    return (
        <div className="w-full min-h-screen p-4 md:p-6 lg:p-[3vw] bg-white animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-6 lg:mb-[2.5vw]">
                <div className="h-8 lg:h-[3vw] w-1/2 lg:w-[20vw] bg-gray-300 rounded mb-2 lg:mb-[0.5vw]"></div>
                <div className="h-4 lg:h-[1vw] w-3/4 lg:w-[30vw] bg-gray-200 rounded"></div>
            </div>

            {/* Content Skeleton: Flex Col on Mobile, Row on Desktop */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-[4vw]">
                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-6 lg:gap-[1.5vw]">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className="h-4 lg:h-[1.2vw] w-32 lg:w-[12vw] bg-gray-300 rounded mb-2 lg:mb-[0.5vw]"></div>
                            <div className="h-3 lg:h-[0.9vw] w-48 lg:w-[18vw] bg-gray-200 rounded mb-2 lg:mb-[0.5vw]"></div>
                            <div className={`w-full bg-gray-300 rounded-lg lg:rounded-[0.8vw] ${i === 3 ? 'h-32 lg:h-[8vw]' : 'h-12 lg:h-[3.5vw]'}`}></div>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col">
                     <div className="flex flex-col h-full">
                        <div className="h-4 lg:h-[1.2vw] w-24 lg:w-[10vw] bg-gray-300 rounded mb-2 lg:mb-[0.5vw]"></div>
                        <div className="h-3 lg:h-[0.9vw] w-56 lg:w-[22vw] bg-gray-200 rounded mb-2 lg:mb-[0.5vw]"></div>
                        <div className="w-full flex-1 bg-gray-300 rounded-lg lg:rounded-[0.8vw] min-h-[200px] lg:min-h-[15vw]"></div>
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="flex justify-end mt-6 lg:mt-[2.5vw]">
                <div className="w-full lg:w-[10vw] h-12 lg:h-[3.5vw] bg-gray-300 rounded-full lg:rounded-[2vw]"></div>
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
    
    // State untuk modal
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setErrorMessage("Mohon lengkapi semua data yang diperlukan.");
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

            setSuccessMessage("Laporan berhasil dikirim!");
            setFormData({ menuId: '', menuUtama: '', komponen: '', catatan: '' });
            setFileObj(null); setFotoName(""); setFotoPreview(null);
            
        } catch (error: any) {
            console.error("Submit Error:", error);
            setErrorMessage(error.message || "Terjadi kesalahan saat mengirim laporan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingMenu) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen bg-white">
                <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">
                    <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                        <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                        <Image src={loadingSpinner} alt="Loading" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Memuat Data</h3>
                        <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                            Sedang mengambil daftar menu...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Wrapper Utama: Padding responsive (p-4 mobile, p-[3vw] desktop)
        <div className="w-full min-h-screen p-4 md:p-6 lg:p-[3vw] bg-white">
            
            {/* Header Section */}
            <div className="mb-6 lg:mb-[2.5vw]">
                {/* Text Size Responsive: text-2xl mobile -> text-[3vw] desktop */}
                <h1 className="satoshiBold text-2xl md:text-3xl lg:text-[3vw] text-black leading-tight">
                    Lapor Menu Makanan
                </h1>
                <p className="satoshiMedium text-sm md:text-base lg:text-[1.1vw] text-black mt-2 lg:mt-[0.5vw]">
                    Pilih menu mingguan dan unggah bukti laporan.
                </p>
            </div>

            {/* Main Grid: Flex Col (Mobile) -> Flex Row (Desktop) */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-[4vw]">
                
                {/* Left Column (Inputs) */}
                <div className="flex-1 flex flex-col gap-5 lg:gap-[1.5vw]">
                    
                    {/* Input Foto */}
                    <div>
                        <label className="block satoshiBold text-sm lg:text-[1.2vw] text-black mb-1 lg:mb-[0.2vw]">
                            Foto Menu Makanan
                        </label>
                        <p className="satoshiMedium text-xs lg:text-[0.9vw] text-gray-500 mb-2 lg:mb-[0.5vw]">
                            Unggah foto menu (Opsional, Max 5MB)
                        </p>
                        
                        <div className={`relative w-full border-2 lg:border-[0.15vw] ${errors.file ? 'border-red-500' : 'border-[#E87E2F]'} rounded-lg lg:rounded-[0.8vw] flex items-center px-3 py-3 lg:px-[1vw] lg:py-[0.8vw] cursor-pointer hover:bg-orange-50 transition-colors`}>
                            <span className="text-[#E87E2F] mr-3 lg:mr-[0.8vw]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 lg:w-[1.5vw] lg:h-[1.5vw]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                            </span>
                            {/* Divider Line */}
                            <span className='bg-[#D7762E] w-[1px] h-6 lg:w-[0.1vw] lg:h-[1.5vw] mr-3 lg:mr-[0.5vw]'/>
                            
                            <span className={`satoshiMedium text-sm lg:text-[1vw] truncate mr-2 lg:mr-[1vw] ${fotoName ? 'text-black' : 'text-gray-400'}`}>
                                {fotoName || "Unggah dokumen .jpg, .png"}
                            </span>
                            <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {errors.file && <p className="text-red-500 text-xs lg:text-[0.9vw] mt-1 lg:mt-[0.3vw] satoshiMedium">{errors.file}</p>}
                        
                        {fotoPreview && (
                            <div className="mt-3 lg:mt-[1vw] w-full h-48 lg:h-[15vw] border-2 lg:border-[0.15vw] border-[#E87E2F] rounded-lg lg:rounded-[0.8vw] overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover"/>
                                <button onClick={() => { setFotoName(""); setFotoPreview(null); setFileObj(null); }} className="absolute top-2 right-2 lg:top-[0.5vw] lg:right-[0.5vw] bg-red-500 text-white rounded-full p-1 lg:p-[0.3vw] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 lg:w-[1vw] lg:h-[1vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dropdown Menu Utama */}
                    <div ref={dropdownRef} className="relative">
                        <label className="block satoshiBold text-sm lg:text-[1.2vw] text-black mb-1 lg:mb-[0.2vw]">
                            Menu Makanan Utama
                        </label>
                        <p className="satoshiMedium text-xs lg:text-[0.9vw] text-gray-500 mb-2 lg:mb-[0.5vw]">
                            Pilih dari daftar menu (Mulai Senin)
                        </p>
                        
                        <div 
                            onClick={() => !loadingMenu && setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full px-3 py-3 lg:px-[1vw] lg:py-[0.8vw] rounded-lg lg:rounded-[0.8vw] flex justify-between items-center border-2 lg:border-[0.15vw] cursor-pointer hover:bg-orange-50 transition-colors ${formData.menuId ? 'border-[#E87E2F]' : 'border-[#E87E2F]'}`}
                        >
                            <div className="flex flex-col w-full">
                                {formData.menuId ? (
                                    <span className="satoshiMedium text-sm lg:text-[1vw] opacity-90 truncate">{formData.menuUtama}</span>
                                ) : (
                                    <span className={`satoshiMedium text-sm lg:text-[1vw] truncate ${fotoName ? 'text-black' : 'text-gray-400'}`}>
                                        {loadingMenu ? "Memuat..." : "Pilih Menu Makanan"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-20 top-full mt-2 lg:mt-[0.5vw] left-0 w-full bg-white border border-gray-200 rounded-lg lg:rounded-[0.5vw] shadow-xl max-h-60 lg:max-h-[15vw] overflow-y-auto">
                                {menuOptions.length > 0 ? (
                                    menuOptions.map((menu) => (
                                        <div 
                                            key={menu.id}
                                            onClick={() => handleSelectMenu(menu)}
                                            className="px-4 py-3 lg:px-[1.5vw] lg:py-[1vw] hover:bg-[#FFF3EB] cursor-pointer border-b border-gray-100 last:border-0 transition-colors group"
                                        >
                                            <p className="satoshiBold text-sm lg:text-[1.1vw] text-[#6A655F] group-hover:text-[#E87E2F]">
                                                {menu.nama_menu}
                                            </p>
                                            <p className="satoshiMedium text-xs lg:text-[0.9vw] text-gray-400">
                                                {menu.tanggal}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 lg:p-[1.5vw] text-center text-gray-500 satoshiMedium text-sm lg:text-[1vw]">
                                        Tidak ada menu tersedia
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {errors.menuId && <p className="text-red-500 text-xs lg:text-[0.9vw] mt-1 lg:mt-[0.3vw] satoshiMedium">{errors.menuId}</p>}
                    </div>

                    {/* Textarea Komponen */}
                    <div>
                        <label className="block satoshiBold text-sm lg:text-[1.2vw] text-black mb-1 lg:mb-[0.2vw]">
                            Komponen Menu Makanan
                        </label>
                        <p className="satoshiMedium text-xs lg:text-[0.9vw] text-gray-500 mb-2 lg:mb-[0.5vw]">
                            Komponen menu (Otomatis terisi, silakan koreksi)
                        </p>
                        <textarea 
                             name="komponen"
                             value={formData.komponen}
                             onChange={handleInputChange}
                             placeholder="Pilih menu terlebih dahulu..."
                             className={`w-full border-2 lg:border-[0.15vw] ${errors.komponen ? 'border-red-500' : 'border-[#E87E2F]'} rounded-lg lg:rounded-[0.8vw] px-3 py-3 lg:px-[1vw] lg:py-[0.8vw] satoshiMedium text-sm lg:text-[1vw] outline-none placeholder-gray-300 h-32 lg:h-[8vw] resize-none focus:ring-1 focus:ring-[#E87E2F]`}
                        />
                        {errors.komponen && <p className="text-red-500 text-xs lg:text-[0.9vw] mt-1 lg:mt-[0.3vw] satoshiMedium">{errors.komponen}</p>}
                    </div>
                </div>

                {/* Right Column (Catatan) */}
                <div className="flex-1 flex flex-col">
                     <div className="flex flex-col h-full">
                        <label className="block satoshiBold text-sm lg:text-[1.2vw] text-black mb-1 lg:mb-[0.2vw]">
                            Catatan
                        </label>
                        <p className="satoshiMedium text-xs lg:text-[0.9vw] text-gray-500 mb-2 lg:mb-[0.5vw]">
                            Masukkan catatan detail mengenai pelaporan ini
                        </p>
                        <textarea 
                             name="catatan"
                             value={formData.catatan}
                             onChange={handleInputChange}
                             placeholder="Tulis catatan di sini..."
                             className={`w-full flex-1 border-2 lg:border-[0.15vw] ${errors.catatan ? 'border-red-500' : 'border-[#E87E2F]'} rounded-lg lg:rounded-[0.8vw] p-3 lg:p-[1vw] satoshiMedium text-sm lg:text-[1vw] outline-none placeholder-gray-300 resize-none focus:ring-1 focus:ring-[#E87E2F] min-h-[150px] lg:min-h-[15vw]`}
                        />
                        {errors.catatan && <p className="text-red-500 text-xs lg:text-[0.9vw] mt-1 lg:mt-[0.3vw] satoshiMedium">{errors.catatan}</p>}
                    </div>
                </div>
            </div>

            {/* Button Section */}
            <div className="flex justify-end mt-6 lg:mt-[2.5vw]">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full lg:w-auto bg-[#E87E2F] text-white satoshiBold text-lg lg:text-[1.3vw] py-3 lg:py-[0.8vw] px-8 lg:px-[5vw] rounded-xl lg:rounded-[2vw] transition-all shadow-md 
                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#b06a33] active:scale-95'}`}
                >
                    {isSubmitting ? "Mengirim..." : "Kirim"}
                </button>
            </div>

            {/* MODAL LOADING */}
            {isSubmitting && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">
                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                            <Image src={loadingSpinner} alt="Loading" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Mengirim Laporan</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                Mohon tunggu, laporan sedang dikirim...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUCCESS */}
            {successMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">
                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] absolute text-[#E87E2F]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-lg lg:text-[2vw] text-[#E87E2F]">Berhasil!</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">{successMessage}</p>
                        </div>
                        <div className="flex w-full gap-4 lg:gap-[1.5vw] mt-2 lg:mt-[1vw]">
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ERROR */}
            {errorMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">
                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" layout="fill" objectFit="contain" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] absolute text-red-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-lg lg:text-[2vw] text-red-500">Gagal!</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 px-4">{errorMessage}</p>
                        </div>
                        <div className="flex w-full gap-4 lg:gap-[1.5vw] mt-2 lg:mt-[1vw]">
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-red-500 text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-red-600 transition-colors shadow-md"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormPelaporan;