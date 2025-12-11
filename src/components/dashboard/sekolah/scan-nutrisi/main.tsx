'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import bg from "../../../../assets/bg.png";
import loadingSpinner from "../../../../assets/loading.png";
import jam from "../../../../assets/dashboard/sppg/jam.png";
import { fetchWithAuth } from '@/src/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const COMPRESSION_QUALITY = 0.8;
const MAX_IMG_WIDTH = 1024;

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = (MAX_IMG_WIDTH / img.width);
                const width = img.width > MAX_IMG_WIDTH ? MAX_IMG_WIDTH : img.width;
                const height = img.width > MAX_IMG_WIDTH ? img.height * scale : img.height;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', COMPRESSION_QUALITY);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
};

const ScanNutrisiSkeleton = () => {
    return (
        <div className="w-full min-h-screen px-4 py-6 lg:px-[3vw] lg:py-[2vw] flex flex-col gap-6 lg:gap-[1vw] relative animate-pulse">

            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0">
                <div className="flex flex-col gap-2 lg:gap-[0.5vw] w-full lg:w-[70%]">
                    <div className="h-8 lg:h-[3.5vw] w-[80%] bg-gray-300 rounded-md"></div>
                    <div className="h-4 lg:h-[2vw] w-full bg-gray-200 rounded-md mt-2 lg:mt-[0.5vw]"></div>
                    <div className="h-4 lg:h-[2vw] w-[90%] bg-gray-200 rounded-md"></div>
                </div>

                <div className="w-12 h-12 lg:w-[3.5vw] lg:h-[3.5vw] bg-gray-300 rounded-full shrink-0 self-end lg:self-start"></div>
            </div>

            <div className="relative w-full lg:w-[90%] h-64 lg:h-[35vw] bg-gray-300 rounded-xl lg:rounded-[1.5vw] mt-4 lg:mt-[1vw] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 lg:gap-[1vw]">
                    <div className="w-16 h-16 lg:w-[6vw] lg:h-[6vw] bg-gray-400 rounded-full"></div>
                    <div className="w-32 lg:w-[15vw] h-4 lg:h-[2vw] bg-gray-400 rounded-full"></div>
                </div>
            </div>

            <div className="h-4 lg:h-[1.5vw] w-[50%] lg:w-[30%] bg-gray-200 rounded-md mt-2 lg:mt-[0.5vw]"></div>

            <div className="flex justify-end mt-4 lg:mt-[1vw]">
                <div className="h-10 lg:h-[3.5vw] w-32 lg:w-[15vw] bg-gray-300 rounded-full lg:rounded-[2vw]"></div>
            </div>
        </div>
    );
};

const ScanNutrisiMain = () => {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) return alert("Mohon unggah file bertipe JPG atau PNG.");
            if (file.size > MAX_FILE_SIZE) return alert("Ukuran file terlalu besar. Maksimal 5MB.");

            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            setFileName(file.name);
            setFileObj(file);
        }
    };


    const handleKirim = async () => {
        if (!imagePreview || !fileObj) return alert("Silakan unggah foto terlebih dahulu.");

        setLoading(true);

        try {
            const token = getCookie('accessToken');
            if (!token) throw new Error("Sesi habis, silakan login ulang.");

            const compressedBlob = await compressImage(fileObj);
            const compressedFile = new File([compressedBlob], fileObj.name, { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('image', compressedFile);

            // PERUBAHAN DISINI:
            // Gunakan URL LENGKAP Backend Asli untuk bypass proxy Next.js
            // Pastikan URL ini sama persis dengan yang ada di Apidog/Postman

            const response = await fetch("/api/scan-proxy", { // <--- Ganti URL ini
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Jangan ada Content-Type
                },
                body: formData
            });

            const responseJson = await response.json();

            if (!response.ok) throw new Error(responseJson.message || `Gagal: ${response.status}`);

            const scanResult = responseJson.data;
            const scanId = scanResult?.id || 'new';

            localStorage.setItem('scan_result_temp', JSON.stringify(scanResult));
            localStorage.removeItem('dummy_scan_image');

            router.push(`/sekolah/scan-nutrisi/${scanId}`);

        } catch (error: any) {
            console.error("Error upload:", error);
            alert(`Pengiriman gagal: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen px-4 pt-6 lg:px-[3vw] lg:py-[2vw] flex flex-col gap-6 lg:gap-[1vw] relative bg-white">

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0">
                <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                    <h1 className="satoshiBold text-2xl lg:text-[3vw] text-black leading-tight">
                        Scan Kandungan Nutrisi pada Makanan
                    </h1>
                    <p className="satoshiBold text-sm lg:text-[1.3vw] text-black text-justify lg:text-left">
                        Unggah foto menu untuk dianalisis secara otomatis oleh AI.<br className="hidden lg:block" />
                        Inkluzi akan mendeteksi jenis makanan, kandungan gizi, tekstur, porsi, serta potensi alergi.
                    </p>
                </div>

                {/* Tombol Riwayat (Fixed di pojok kanan atas di Mobile agar mudah dijangkau atau tetap di flow) */}
                <Link href="/sekolah/riwayat-scan" className="group flex items-center bg-white/50 backdrop-blur-sm rounded-full p-2 lg:p-[0.5vw] hover:bg-white transition-all duration-500 shadow-sm border border-[#E87E2F]/20 h-fit self-end lg:self-auto">
                    <div className="w-8 h-8 lg:w-[3vw] lg:h-[3vw] flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] shrink-0 relative">
                        <Image
                            src={jam}
                            alt="Riwayat"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <span className="max-w-0 overflow-hidden whitespace-nowrap satoshiBold text-[#E87E2F] text-sm lg:text-[1.2vw] transition-all duration-700 ease-in-out group-hover:max-w-[200px] lg:group-hover:max-w-[15vw] pl-0 group-hover:pl-2 lg:group-hover:pl-[0.8vw] pr-0 group-hover:pr-4 lg:group-hover:pr-[1.5vw] opacity-0 group-hover:opacity-100">
                        Riwayat Pemindaian
                    </span>
                </Link>
            </div>

            {/* Upload Area */}
            <div className="relative w-full lg:w-[90%] h-64 lg:h-[35vw] bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] flex items-center justify-center overflow-hidden hover:opacity-95 transition-opacity cursor-pointer shadow-md mt-4 lg:mt-[1vw]">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview Menu" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-white gap-3 lg:gap-[1vw] p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 lg:w-[6vw] lg:h-[6vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-sm lg:text-[1.2vw] font-medium opacity-90 bg-black/10 px-4 py-2 lg:px-[1.5vw] lg:py-[0.5vw] rounded-full">
                            Klik untuk unggah (Max 5MB)
                        </span>
                    </div>
                )}
                <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Unggah foto menu"
                />
            </div>

            {fileName && <p className="text-sm lg:text-[1.2vw] text-gray-600 italic mt-2 lg:mt-[0.5vw] truncate max-w-full">File terpilih: <span className="text-[#E87E2F] font-bold">{fileName}</span></p>}

            <div className="flex justify-end mt-4 lg:mt-[1vw]  lg:pb-0">
                <button
                    onClick={handleKirim}
                    disabled={loading || !fileObj}
                    className={`text-white satoshiBold font-bold text-base lg:text-[1.5vw] py-3 lg:py-[0.8vw] px-8 lg:px-[4vw] rounded-full lg:rounded-[2vw] transition-all shadow-md active:scale-95 w-full lg:w-auto text-center
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E87E2F] hover:bg-[#b06e36]'}
                    `}
                >
                    {loading ? "Menganalisis..." : "Kirim"}
                </button>
            </div>

            {/* Loading Modal */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:w-[35vw] shadow-2xl flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 lg:w-[12vw] lg:h-[12vw] flex items-center justify-center">
                            <Image
                                src={bg}
                                alt="Background Shape"
                                layout="fill"
                                objectFit="contain"
                            />
                            <Image
                                src={loadingSpinner}
                                alt="Spinner"
                                className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] object-contain absolute translate-y-1 lg:translate-y-[0.4vw] translate-x-1 lg:translate-x-[0.4vw] animate-spin"
                            />
                        </div>
                        <h3 className="satoshiBold text-xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                        <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-500 mt-2 lg:mt-[0.5vw]">
                            Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanNutrisiMain;