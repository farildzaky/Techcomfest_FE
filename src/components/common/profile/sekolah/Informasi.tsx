'use client'
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; 
import Image from 'next/image';
import bg from "../../../../assets/bg.png"; 
import loadingSpinner from "../../../../assets/loading.png"; 

// --- INTERFACES ---
interface DisabilityType {
    jenis_disabilitas: string;
    jumlah_siswa: number;
}

// --- HELPER COMPONENT (Dipindah ke luar agar performa lebih baik & fokus tidak hilang) ---
const FormField = ({ label, name, value, onChange, readOnly, type = "text", placeholder }: any) => (
    <div className="flex flex-col gap-2 lg:gap-[0.5vw] w-full">
        <label className="satoshiBold text-base lg:text-[1.2vw] text-white tracking-wide">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder || `Masukkan ${label}`}
            // RESPONSIF: h-12 (Mobile) -> h-[3.5vw] (Desktop)
            className={`
                w-full h-12 lg:h-[3.5vw] rounded-lg lg:rounded-[0.8vw] px-4 lg:px-[1.5vw] 
                satoshiMedium text-base lg:text-[1.1vw] text-[#E87E2F] outline-none 
                transition-all duration-300 placeholder-[#E87E2F]/50
                ${type === 'number' ? 'remove-arrow' : ''} 
                ${readOnly 
                    ? 'bg-white/90 cursor-default' 
                    : 'bg-white shadow-md focus:ring-2 focus:ring-white/50'
                }
                ${name === 'email' ? 'opacity-80 cursor-not-allowed' : ''}
            `}
        />
    </div>
);

const InformasiSekolah = () => {
    // --- STATE UI ---
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- STATE DATA ---
    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState({
        nama_sekolah: "",
        npsn: "",
        jenis_sekolah: "",
        alamat: "",
        penanggung_jawab: "",
        nomor_kontak: "",
        total_siswa: 0
    });
    const [disabilityList, setDisabilityList] = useState<DisabilityType[]>([]);

    // --- 1. FETCH DATA (GET) ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchWithAuth("/profile", { method: "GET" });

                if (!response.ok) throw new Error("Gagal memuat data.");

                const result = await response.json();
                
                if (result.success && result.data) {
                    const profile = result.data.profile_data;
                    
                    setEmail(result.data.email || "");
                    
                    setFormData({
                        nama_sekolah: profile.nama_sekolah || "",
                        npsn: profile.npsn || "",
                        jenis_sekolah: profile.jenis_sekolah || "",
                        alamat: profile.alamat || "",
                        penanggung_jawab: profile.penanggung_jawab || "",
                        nomor_kontak: profile.nomor_kontak || "",
                        total_siswa: profile.total_siswa || 0
                    });

                    if (Array.isArray(profile.disability_types)) {
                        setDisabilityList(profile.disability_types);
                    }
                }
            } catch (err: any) {
                setError("Terjadi kesalahan jaringan.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // --- 2. AUTO CALCULATE TOTAL SISWA ---
    useEffect(() => {
        const total = disabilityList.reduce((acc, curr) => acc + (Number(curr.jumlah_siswa) || 0), 0);
        
        setFormData(prev => ({
            ...prev,
            total_siswa: total
        }));
    }, [disabilityList]);


    // --- 3. HANDLERS ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'total_siswa') return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDisabilityChange = (index: number, field: keyof DisabilityType, value: string | number) => {
        const updatedList = [...disabilityList];
        updatedList[index] = {
            ...updatedList[index],
            [field]: field === 'jumlah_siswa' ? Number(value) : value
        };
        setDisabilityList(updatedList);
    };

    const addDisabilityRow = () => {
        setDisabilityList([...disabilityList, { jenis_disabilitas: "", jumlah_siswa: 0 }]);
    };

    const removeDisabilityRow = (index: number) => {
        const updatedList = disabilityList.filter((_, i) => i !== index);
        setDisabilityList(updatedList);
    };

    // --- 4. SAVE DATA (PATCH) ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                total_siswa: Number(formData.total_siswa),
                disability_types: disabilityList
            };

            const response = await fetchWithAuth("/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errRes = await response.json();
                throw new Error(errRes.message || "Gagal menyimpan perubahan.");
            }

            setSuccessMessage("Data profil sekolah berhasil diperbarui!");
            setIsEditing(false);

        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- ICONS ---
    const MinusCircleIcon = () => (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="white"/>
            <path d="M7 12H17" stroke="#D9833E" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-white satoshiBold text-xl lg:text-[2vw]">Memuat data...</div>;
    if (error) return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-white satoshiBold text-xl lg:text-[2vw]">{error}</div>;

    return (
        // Container Utama: p-6 (Mobile) -> p-[3vw] (Desktop)
        <div className="w-full min-h-screen p-6 lg:p-[3vw] font-sans flex flex-col gap-6 lg:gap-[2vw]">
            
            <style jsx global>{`
                .remove-arrow::-webkit-outer-spin-button,
                .remove-arrow::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .remove-arrow {
                    -moz-appearance: textfield;
                }
            `}</style>

            {/* --- HEADER --- */}
            <div className="flex flex-col items-start">
                <h1 className="satoshiBold text-3xl lg:text-[3vw] text-white leading-tight">
                    Informasi Sekolah
                </h1>
                
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-white/80 italic text-sm lg:text-[1vw] hover:text-white hover:underline mt-1 lg:mt-[0.2vw]"
                    >
                        Edit 
                    </button>
                ) : (
                    <span className="text-white/90 italic text-sm lg:text-[1vw] mt-1 lg:mt-[0.2vw] animate-pulse">Mode Edit Aktif</span>
                )}
            </div>

            {/* --- FORM CONTAINER --- */}
            {/* Width: Full (Mobile) -> 80% (Desktop) */}
            <div className="flex flex-col gap-4 lg:gap-[1.5vw] w-full lg:w-[80%]">
                
                <FormField label="Email" name="email" value={email} onChange={handleChange} readOnly={true} />
                <FormField label="Nama Sekolah" name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} readOnly={!isEditing} />
                <FormField label="NPSN" name="npsn" value={formData.npsn} onChange={handleChange} readOnly={!isEditing} />
                <FormField label="Jenis Sekolah" name="jenis_sekolah" value={formData.jenis_sekolah} onChange={handleChange} readOnly={!isEditing} />
                <FormField label="Penanggung Jawab" name="penanggung_jawab" value={formData.penanggung_jawab} onChange={handleChange} readOnly={!isEditing} />
                <FormField label="Nomor Kontak" name="nomor_kontak" value={formData.nomor_kontak} onChange={handleChange} readOnly={!isEditing} />
                <FormField label="Alamat" name="alamat" value={formData.alamat} onChange={handleChange} readOnly={!isEditing} />

                {/* --- CUSTOM DISABILITY INPUT --- */}
                <div className="flex flex-col gap-3 lg:gap-[1vw] mt-2 lg:mt-[0.5vw]">
                    <label className="satoshiBold text-lg lg:text-[1.4vw] text-white">
                        Detail Jenis Disabilitas Dominan
                    </label>

                    <div className="flex flex-col gap-3 lg:gap-[1vw]">
                        {disabilityList.map((item, index) => (
                            <div key={index} className="flex gap-2 lg:gap-[1vw] w-full items-center">
                                
                                {/* 1. INPUT JENIS (KIRI) */}
                                <div className="flex-[3]">
                                    <input 
                                        type="text"
                                        value={item.jenis_disabilitas}
                                        onChange={(e) => handleDisabilityChange(index, 'jenis_disabilitas', e.target.value)}
                                        readOnly={!isEditing}
                                        placeholder="Jenis Disabilitas"
                                        className={`w-full h-12 lg:h-[3.8vw] rounded-lg lg:rounded-[0.8vw] px-4 lg:px-[1.5vw] satoshiMedium text-base lg:text-[1.2vw] text-[#E87E2F] outline-none placeholder-[#E87E2F]/40 bg-white shadow-sm border-none`}
                                    />
                                </div>

                                {/* 2. INPUT JUMLAH (KANAN) */}
                                <div className="flex-[1.5] relative">
                                    <input 
                                        type="number"
                                        value={item.jumlah_siswa}
                                        onChange={(e) => handleDisabilityChange(index, 'jumlah_siswa', e.target.value)}
                                        readOnly={!isEditing}
                                        placeholder="0"
                                        className={`w-full h-12 lg:h-[3.8vw] rounded-lg lg:rounded-[0.8vw] pl-4 lg:pl-[1.5vw] pr-12 lg:pr-[4vw] satoshiMedium text-base lg:text-[1.2vw] text-[#E87E2F] outline-none bg-white shadow-sm border-none remove-arrow`}
                                    />
                                    {/* Suffix "Siswa" */}
                                    <span className="absolute right-3 lg:right-[1.5vw] top-1/2 -translate-y-1/2 text-[#E87E2F] satoshiMedium text-sm lg:text-[1.1vw] pointer-events-none">
                                        Siswa
                                    </span>
                                </div>

                                {/* 3. TOMBOL HAPUS */}
                                {isEditing && (
                                    <button 
                                        onClick={() => removeDisabilityRow(index)}
                                        className="w-8 h-8 lg:w-[2.5vw] lg:h-[2.5vw] hover:scale-110 transition-transform flex-shrink-0"
                                        title="Hapus baris ini"
                                    >
                                        <MinusCircleIcon />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* TOMBOL TAMBAH */}
                        {isEditing && (
                            <div className="flex justify-end mt-1 lg:mt-[0.5vw]">
                                <button 
                                    onClick={addDisabilityRow}
                                    className="bg-white hover:bg-white/30 text-[#E87E2F] px-4 py-2 lg:px-[1.5vw] lg:py-[0.5vw] rounded-lg lg:rounded-[1vw] satoshiBold text-sm lg:text-[1vw] transition-colors"
                                >
                                    + Tambah Jenis Disabilitas
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TOTAL SISWA --- */}
                <div className="">
                    <FormField 
                        label="Jumlah Total Siswa" 
                        name="total_siswa" 
                        value={formData.total_siswa} 
                        onChange={handleChange}
                        readOnly={true} 
                        type="number"
                        placeholder="0" 
                    />
                </div>

                {/* --- TOMBOL AKSI --- */}
                {isEditing && (
                    <div className="flex justify-end gap-4 lg:gap-[1.5vw] mt-6 lg:mt-[2vw] mb-10 lg:mb-[5vw]">
                        <button 
                            onClick={() => { setIsEditing(false); window.location.reload(); }} 
                            className="bg-transparent border border-white text-white satoshiBold text-base lg:text-[1.2vw] py-3 px-6 lg:py-[0.8vw] lg:px-[3vw] rounded-full hover:bg-white/10 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-white text-[#D9833E] satoshiBold text-base lg:text-[1.2vw] py-3 px-8 lg:py-[0.8vw] lg:px-[4vw] rounded-full shadow-lg transition-transform active:scale-95
                                ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
                            `}
                        >
                            {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                )}

            </div>

            {/* --- MODALS (Loading & Success) --- */}
            {isSaving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-2xl lg:rounded-[2vw] p-6 lg:p-[3vw] w-full max-w-sm lg:max-w-none lg:w-[35vw] shadow-2xl flex flex-col items-center text-center">
                        <div className="relative w-24 h-24 lg:w-[12vw] lg:h-[12vw]">
                            <Image src={bg} alt="bg" layout="fill" objectFit="contain" />
                            <Image src={loadingSpinner} alt="spinner" className="w-10 h-10 lg:w-[5vw] lg:h-[5vw] object-contain absolute inset-0 m-auto animate-spin" />
                        </div>
                        <h3 className="satoshiBold text-2xl lg:text-[2.5vw] text-[#E87E2F] mt-4 lg:mt-[2vw]">Sedang Diproses</h3>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl lg:rounded-[1.5vw] p-6 lg:p-[3vw] w-full max-w-sm lg:max-w-none lg:w-[28vw] shadow-2xl flex flex-col items-center text-center gap-4 lg:gap-[2vw]">
                        <div className="w-12 h-12 lg:w-[5vw] lg:h-[5vw] rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl lg:text-[2vw]">✓</div>
                        <h3 className="satoshiBold text-xl lg:text-[1.8vw] text-gray-800">{successMessage}</h3>
                        <button onClick={() => setSuccessMessage(null)} className="py-2 px-6 lg:py-[0.8vw] lg:px-[3vw] rounded-lg lg:rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md">OKE</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InformasiSekolah;