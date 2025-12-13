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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[2vw] w-full max-w-sm lg:max-w-none lg:w-[30vw] shadow-2xl flex flex-col items-center text-center gap-3 lg:gap-[1vw]">

                        <div className="relative w-20 h-20 lg:w-[8vw] lg:h-[8vw] flex items-center justify-center">
                            <Image
                                src={bg}
                                alt="Background Shape"
                                fill
                                sizes="(max-width: 1024px) 80px, 8vw"
                                className="object-contain"
                            />
                            <Image
                                src={loadingSpinner}
                                alt="Spinner"
                                width={80}
                                height={80}
                                sizes="(max-width: 1024px) 32px, 4vw"
                                className="w-8 h-8 lg:w-[4vw] lg:h-[4vw] object-contain absolute inset-0 m-auto animate-spin"
                            />
                        </div>

                        <h3 className="satoshiBold text-xl lg:text-[1.8vw] text-[#E87E2F]">Sedang Diproses</h3>
                        <p className="satoshiMedium text-sm lg:text-[1vw] text-gray-500">
                            Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                        </p>
                    </div>
                </div>
            )}

            {/* Success Modal Overlay */}
            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-2xl lg:rounded-[1.5vw] p-6 lg:p-[2vw] w-full max-w-sm lg:max-w-none lg:w-[25vw] shadow-2xl flex flex-col items-center text-center gap-3 lg:gap-[1vw]">

                        <div className="w-14 h-14 lg:w-[4vw] lg:h-[4vw] rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 lg:w-[2.5vw] lg:h-[2.5vw] text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>

                        <h3 className="satoshiBold text-lg lg:text-[1.5vw] text-gray-800">{successMessage}</h3>

                        <button
                            onClick={handleSuccessConfirm}
                            className="py-2 px-6 lg:py-[0.6vw] lg:px-[2vw] rounded-lg lg:rounded-[0.6vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1vw] hover:bg-[#c27233] transition-colors shadow-md"
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