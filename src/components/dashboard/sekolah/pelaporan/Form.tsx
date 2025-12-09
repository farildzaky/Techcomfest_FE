'use client'
import React, { useState, ChangeEvent, useEffect } from 'react';

const FormPelaporan = () => {
    // State untuk Data Form
    const [formData, setFormData] = useState({
        menuUtama: '',
        komponen: '',
        catatan: ''
    });

    // State untuk File
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [fotoName, setFotoName] = useState("");
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    // State untuk Error Handling
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Handler input teks
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Hapus error saat user mengetik
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handler File Upload dengan Validasi Lengkap
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Reset error file sebelumnya
        setErrors(prev => ({ ...prev, file: '' }));

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // 1. Validasi Tipe File (JPG/PNG)
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, file: "Format file harus JPG, JPEG, atau PNG." }));
                return;
            }

            // 2. Validasi Ukuran File (Maksimal 5MB)
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSizeInBytes) {
                setErrors(prev => ({ ...prev, file: "Ukuran file terlalu besar. Maksimal 5MB." }));
                return;
            }

            // Jika lolos validasi
            setFileObj(file);
            setFotoName(file.name);
            const objectUrl = URL.createObjectURL(file);
            setFotoPreview(objectUrl);
        }
    };

    // Bersihkan memory preview
    useEffect(() => {
        return () => {
            if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        };
    }, [fotoPreview]);

    // Handler Tombol Kirim
    const handleSubmit = () => {
        const newErrors: { [key: string]: string } = {};

        // Validasi Field Wajib (Selain foto yang opsional "jika ada")
        if (!formData.menuUtama.trim()) newErrors.menuUtama = "Nama menu utama wajib diisi.";
        if (!formData.komponen.trim()) newErrors.komponen = "Komponen menu wajib diisi.";
        // Catatan boleh opsional atau wajib, disini saya buat wajib agar contoh validasi terlihat
        // Jika ingin opsional, hapus baris di bawah ini:
        if (!formData.catatan.trim()) newErrors.catatan = "Catatan wajib diisi.";

        // Jika ada error file yang belum selesai
        if (!fileObj && fotoName && errors.file) {
             // Case: User upload file invalid, tapi belum ganti file
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("Mohon lengkapi data yang salah/kosong.");
            return;
        }

        // --- SIMULASI KIRIM DATA SUKSES ---
        console.log("Data Siap Dikirim:", { ...formData, file: fileObj });
        alert("Laporan berhasil dikirim!");
        // Reset Form disini jika perlu
    };

    return (
        <div className="w-full h-full p-[3vw] bg-white ">
            
            {/* --- HEADER --- */}
            <div className="mb-[2.5vw]">
                <h1 className="satoshiBold text-[3vw] text-black leading-tight">Lapor Menu Makanan</h1>
                <p className="satoshiMedium text-[1.1vw] text-black mt-[0.5vw]">
                    Unggah data berikut agar dapat dilaporkan ke SPPG.
                </p>
            </div>

            {/* --- FORM CONTENT (2 Kolom) --- */}
            <div className="flex gap-[4vw]">
                
                {/* KOLOM KIRI: Input Data */}
                <div className="flex-1 flex flex-col gap-[1.5vw]">
                    
                    {/* 1. Foto Menu Makanan */}
                    <div>
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Foto Menu Makanan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Unggah file foto menu makanan (jika ada, Max 5MB)</p>
                        
                        <div className={`relative w-full border-[0.15vw] ${errors.file ? 'border-red-500 bg-red-50' : 'border-[#E87E2F] bg-white'} rounded-[0.8vw] flex items-center px-[1vw] py-[0.8vw] cursor-pointer hover:bg-orange-50 transition-colors`}>
                            <span className="text-[#E87E2F] mr-[0.8vw]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.5vw] h-[1.5vw]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                            </span>
                            <span className='bg-[#D7762E] w-[0.1vw] h-[1.5vw] mr-[0.5vw] '/>
                            <span className={`satoshiMedium text-[1vw] truncate mr-[1vw] ${fotoName ? 'text-black' : 'text-gray-400'}`}>
                                {fotoName || "Unggah dokumen dalam .jpg, .jpeg, .png"}
                            </span>
                            <input 
                                type="file" 
                                accept=".jpg, .jpeg, .png"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        {/* Pesan Error File */}
                        {errors.file && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.file}</p>}

                        {/* PREVIEW GAMBAR */}
                        {fotoPreview && !errors.file && (
                            <div className="mt-[1vw] w-full h-[15vw] border-[0.15vw] border-[#E87E2F] rounded-[0.8vw] overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover"/>
                                <button 
                                    onClick={() => {
                                        setFotoName("");
                                        setFotoPreview(null);
                                        setFileObj(null);
                                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                        if (fileInput) fileInput.value = '';
                                    }}
                                    className="absolute top-[0.5vw] right-[0.5vw] bg-red-500 text-white rounded-full p-[0.3vw] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1vw] h-[1vw]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Menu Makanan Utama */}
                    <div>
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Menu Makanan Utama</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Nama menu utama</p>
                        <input 
                            type="text"
                            name="menuUtama"
                            value={formData.menuUtama}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama menu utama"
                            className={`w-full border-[0.15vw] ${errors.menuUtama ? 'border-red-500 focus:ring-red-500' : 'border-[#E87E2F] focus:ring-[#E87E2F]'} rounded-[0.8vw] px-[1vw] py-[0.8vw] satoshiMedium text-[1vw] outline-none placeholder-gray-300 focus:ring-1 transition-all`}
                        />
                        {errors.menuUtama && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.menuUtama}</p>}
                    </div>

                    {/* 3. Komponen Menu Makanan */}
                    <div>
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Komponen Menu Makanan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Nama komponen menu makanan</p>
                        <textarea 
                             name="komponen"
                             value={formData.komponen}
                             onChange={handleInputChange}
                             placeholder="Masukkan komponen menu makanan"
                             className={`w-full border-[0.15vw] ${errors.komponen ? 'border-red-500 focus:ring-red-500' : 'border-[#E87E2F] focus:ring-[#E87E2F]'} rounded-[0.8vw] px-[1vw] py-[0.8vw] satoshiMedium text-[1vw] outline-none placeholder-gray-300 h-[8vw] resize-none focus:ring-1 transition-all`}
                        />
                        {errors.komponen && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.komponen}</p>}
                    </div>

                </div>

                {/* KOLOM KANAN: Catatan */}
                <div className="flex-1 flex flex-col">
                     <div className="flex flex-col h-full">
                        <label className="block satoshiBold text-[1.2vw] text-black mb-[0.2vw]">Catatan</label>
                        <p className="satoshiMedium text-[0.9vw] text-gray-500 mb-[0.5vw]">Masukkan catatan detail mengenai pelaporan ini</p>
                        <textarea 
                             name="catatan"
                             value={formData.catatan}
                             onChange={handleInputChange}
                             placeholder="Tulis catatan di sini..."
                             className={`w-full flex-1 border-[0.15vw] ${errors.catatan ? 'border-red-500 focus:ring-red-500' : 'border-[#E87E2F] focus:ring-[#E87E2F]'} rounded-[0.8vw] p-[1vw] satoshiMedium text-[1vw] outline-none placeholder-gray-300 resize-none focus:ring-1 transition-all min-h-[15vw]`}
                        />
                        {errors.catatan && <p className="text-red-500 text-[0.9vw] mt-[0.3vw] satoshiMedium">{errors.catatan}</p>}
                    </div>
                </div>
            </div>

            {/* --- TOMBOL KIRIM --- */}
            <div className="flex justify-end mt-[2.5vw]">
                <button 
                    onClick={handleSubmit}
                    className="bg-[#E87E2F] text-white satoshiBold text-[1.3vw] py-[0.8vw] px-[5vw] rounded-[2vw] hover:bg-[#b06a33] transition-colors shadow-md"
                >
                    Kirim
                </button>
            </div>

        </div>
    );
}

export default FormPelaporan;