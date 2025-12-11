'use client'
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image';
import bg from "../../../../assets/bg.png"; 
import loadingSpinner from "../../../../assets/loading.png"; 

const InformasiInstansiPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false); 
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        namaInstansi: "",
        wilayahKerja: "",
        alamat: "",
        email: "",
        penanggungJawab: "",
        nomorKontak: ""
    });

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setLoadingData(true);
                const response = await fetchWithAuth("/profile", {
                    method: "GET"
                });

                if (!response.ok) throw new Error("Gagal memuat data profil.");

                const result = await response.json();
                const profile = result.data.profile_data || {};
                const userEmail = result.data.email || ''; 
                
                setFormData({
                    namaInstansi: profile.nama_instansi || '',
                    wilayahKerja: profile.wilayah_kerja || '',
                    alamat: profile.alamat || '',
                    email: userEmail,
                    penanggungJawab: profile.penanggung_jawab || '', 
                    nomorKontak: profile.nomor_kontak || profile.no_kontak || '' 
                });

            } catch (err: any) {
                setFetchError("Gagal mengambil data: " + (err.message || "Kesalahan jaringan."));
            } finally {
                setLoadingData(false);
            }
        };

        loadProfileData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSuccessConfirm = () => {
        setSuccessMessage(null);
        setIsEditing(false); 
    };

    const handleSave = async () => {
        setIsSaving(true); 
        try {
            const response = await fetchWithAuth("/profile", {
                method: "PATCH", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama_instansi: formData.namaInstansi,
                    wilayah_kerja: formData.wilayahKerja,
                    alamat: formData.alamat,
                    penanggung_jawab: formData.penanggungJawab,
                    nomor_kontak: formData.nomorKontak 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal menyimpan perubahan.");
            }

            setSuccessMessage("Data profil instansi berhasil diperbarui!");

        } catch (error: any) {
            alert(error.message); 
        } finally {
            setIsSaving(false); 
        }
    };

    if (loadingData) {
        return (
            <div className="w-full min-h-screen p-[3vw] font-sans">
                <div className="flex flex-col gap-[2vw]">
                    <div className="flex flex-col gap-[0.5vw]">
                        <div className="h-[3vw] w-[25vw] bg-white/30 rounded-[0.5vw] animate-pulse"></div>
                        <div className="h-[1.5vw] w-[5vw] bg-white/30 rounded-[0.5vw] animate-pulse"></div>
                    </div>
                    <div className="flex flex-col gap-[1.5vw] w-[80%]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-[0.5vw]">
                                <div className="h-[1.5vw] w-[15vw] bg-white/30 rounded-[0.4vw] animate-pulse"></div>
                                <div className="h-[3.5vw] w-full bg-white/30 rounded-[0.8vw] animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-red-100 satoshiBold text-[2vw]">{fetchError}</div>;
    }

    return (
        <div className="w-full min-h-screen  p-[3vw] font-sans">
            
            <div className="flex flex-col gap-[2vw]">
                
                <div className="flex flex-col">
                    <h1 className="satoshiBold text-[2.5vw] text-white leading-tight">
                        Informasi Instansi
                    </h1>
                    
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-white italic text-[1vw] opacity-80 hover:opacity-100 hover:underline w-fit mt-[0.2vw]"
                        >
                            Edit
                        </button>
                    )}
                    {isEditing && (
                        <span className="text-white italic text-[1vw] opacity-80 mt-[0.2vw]">
                            Mode Edit Aktif
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-[1.5vw] w-[80%]">
                    
                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            readOnly={true} 
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                bg-white/90 cursor-default opacity-80`}
                        />
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Nama Instansi</label>
                        <input 
                            type="text" 
                            name="namaInstansi"
                            value={formData.namaInstansi}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing 
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50' 
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Wilayah Kerja</label>
                        <input 
                            type="text" 
                            name="wilayahKerja"
                            value={formData.wilayahKerja}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing 
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50' 
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Penanggung Jawab</label>
                        <input 
                            type="text" 
                            name="penanggungJawab"
                            value={formData.penanggungJawab}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing 
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50' 
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Nomor Kontak</label>
                        <input 
                            type="text" 
                            name="nomorKontak"
                            value={formData.nomorKontak}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing 
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50' 
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>


                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiBold text-[1.2vw] text-white">Alamat</label>
                        <input 
                            type="text" 
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing 
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50' 
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                </div>

                {isEditing && (
                    <div className="flex justify-end w-[80%] mt-[2vw] ">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-white text-[#D9833E] satoshiBold text-[1.2vw] py-[0.8vw] px-[4vw] rounded-full shadow-lg transition-transform active:scale-95
                                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100'}
                            `}
                        >
                            {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                )}

            </div>
            
            {isSaving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[2vw] p-[3vw] w-[35vw] shadow-2xl flex flex-col items-center text-center">
                        
                        <div className="relative w-[12vw] h-[12vw] flex items-center justify-center">
                            <Image 
                                src={bg} 
                                alt="Background Shape" 
                                layout="fill"
                                objectFit="contain"
                            />
                            <Image 
                                src={loadingSpinner} 
                                alt="Spinner" 
                                className="w-[5vw] h-[5vw] object-contain absolute inset-0 m-auto animate-spin"
                            />
                        </div>
                        
                        <h3 className="satoshiBold text-[2.5vw] text-[#E87E2F] mt-[2vw]">Sedang Diproses</h3>
                        <p className="satoshiMedium text-[1.2vw] text-gray-500 mt-[0.5vw]">
                            Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                        </p>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[1.5vw] p-[3vw] w-[28vw] shadow-2xl flex flex-col items-center text-center gap-[2vw]">
                        
                        <div className="w-[5vw] h-[5vw] rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[3vw] h-[3vw] text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        
                        <h3 className="satoshiBold text-[1.8vw] text-gray-800">{successMessage}</h3>
                        
                        <button
                            onClick={handleSuccessConfirm}
                            className="py-[0.8vw] px-[3vw] rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                        >
                            OKE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InformasiInstansiPage;