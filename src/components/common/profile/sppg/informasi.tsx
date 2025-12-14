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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setErrorMessage(error.message || "Gagal menyimpan perubahan.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Loading State Responsif ---
    if (loadingData) {
        return (
            <div className="w-full min-h-screen p-6 lg:p-[3vw] font-sans">
                <div className="flex flex-col gap-6 lg:gap-[2vw]">
                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        {/* Skeleton Title */}
                        <div className="h-10 lg:h-[3vw] w-48 lg:w-[25vw] bg-white/30 rounded-lg lg:rounded-[0.5vw] animate-pulse"></div>
                        {/* Skeleton Subtitle */}
                        <div className="h-4 lg:h-[1.5vw] w-20 lg:w-[5vw] bg-white/30 rounded lg:rounded-[0.5vw] animate-pulse"></div>
                    </div>
                    <div className="flex flex-col gap-4 lg:gap-[1.5vw] w-full lg:w-[80%]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 lg:gap-[0.5vw]">
                                {/* Skeleton Label */}
                                <div className="h-5 lg:h-[1.5vw] w-32 lg:w-[15vw] bg-white/30 rounded lg:rounded-[0.4vw] animate-pulse"></div>
                                {/* Skeleton Input */}
                                <div className="h-12 lg:h-[3.5vw] w-full bg-white/30 rounded-lg lg:rounded-[0.8vw] animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-red-100 satoshiBold text-xl lg:text-[2vw] text-center px-4">{fetchError}</div>;
    }

    // --- Main Content ---
    return (
        // Padding: 24px (mobile) -> 3vw (desktop)
        <div className="w-full min-h-screen p-6 lg:p-[3vw] font-sans">

            <div className="flex flex-col gap-6 lg:gap-[2vw]">

                {/* Header Section */}
                <div className="flex flex-col">
                    {/* H1: Text 30px (mobile) -> 2.5vw (desktop) */}
                    <h1 className="satoshiBold text-3xl lg:text-[2.5vw] text-white leading-tight">
                        Informasi Instansi
                    </h1>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            // Text small (mobile) -> 1vw (desktop)
                            className="text-white italic text-sm lg:text-[1vw] opacity-80 hover:opacity-100 hover:underline w-fit mt-1 lg:mt-[0.2vw]"
                        >
                            Edit
                        </button>
                    )}
                    {isEditing && (
                        <span className="text-white italic text-sm lg:text-[1vw] opacity-80 mt-1 lg:mt-[0.2vw]">
                            Mode Edit Aktif
                        </span>
                    )}
                </div>

                {/* Form Container: Width Full (mobile) -> 80% (desktop) */}
                <div className="flex flex-col gap-4 lg:gap-[1.5vw] w-full lg:w-[80%]">

                    {/* Input Field Component (Repeated Logic) */}
                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly={true}
                            // Input Styles: Rounded-lg, Text-base, Padding standard -> VW on desktop
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                bg-white/90 cursor-default opacity-80`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Nama Instansi</label>
                        <input
                            type="text"
                            name="namaInstansi"
                            value={formData.namaInstansi}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Wilayah Kerja</label>
                        <input
                            type="text"
                            name="wilayahKerja"
                            value={formData.wilayahKerja}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Penanggung Jawab</label>
                        <input
                            type="text"
                            name="penanggungJawab"
                            value={formData.penanggungJawab}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Nomor Kontak</label>
                        <input
                            type="text"
                            name="nomorKontak"
                            value={formData.nomorKontak}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <label className="satoshiBold text-base lg:text-[1.2vw] text-white">Alamat</label>
                        <input
                            type="text"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[0.8vw] 
                                satoshiMedium text-base lg:text-[1.1vw] text-[#B56225] outline-none transition-all duration-300
                                ${isEditing
                                    ? 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                                    : 'bg-white/90 cursor-default'
                                }`}
                        />
                    </div>

                </div>

                {isEditing && (
                    <div className="flex justify-end w-full lg:w-[80%] mt-6 lg:mt-[2vw]">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-white text-[#D9833E] satoshiBold text-base lg:text-[1.2vw] 
                                py-2 px-8 lg:py-[0.8vw] lg:px-[4vw] 
                                rounded-full shadow-lg transition-transform active:scale-95
                                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100'}
                            `}
                        >
                            {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                )}

            </div>

            {/* Loading Modal Overlay */}
            {isSaving && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" fill sizes="(max-width: 1024px) 96px, 15vw" className="object-contain" />
                            <Image src={loadingSpinner} alt="Loading" width={128} height={128} className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] object-contain absolute animate-spin" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                            <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                                Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal Overlay */}
            {successMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" fill sizes="(max-width: 1024px) 96px, 15vw" className="object-contain" />
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
                                onClick={handleSuccessConfirm}
                                className="w-full py-3 lg:py-[1vw] rounded-xl lg:rounded-[1vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal Overlay */}
            {errorMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setErrorMessage(null)}></div>
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[1.5vw] animate-in zoom-in duration-200">

                        <div className="relative w-24 h-24 lg:w-[15vw] lg:h-[15vw] flex items-center justify-center">
                            <Image src={bg} alt="Background Shape" fill sizes="(max-width: 1024px) 96px, 15vw" className="object-contain" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 lg:w-[8vw] lg:h-[8vw] translate-y-[-0.3vw] absolute text-red-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="satoshiBold text-lg lg:text-[2vw] text-red-500">Terjadi Kesalahan</h3>
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

export default InformasiInstansiPage;