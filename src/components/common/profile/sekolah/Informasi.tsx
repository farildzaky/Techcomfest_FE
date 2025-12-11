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

    // --- HELPER COMPONENT ---
    const FormField = ({ label, name, value, readOnly, type = "text", placeholder }: any) => (
        <div className="flex flex-col gap-[0.5vw] w-full">
            <label className="satoshiBold text-[1.2vw] text-white tracking-wide">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={placeholder || `Masukkan ${label}`}
                // Menambahkan class 'remove-arrow' jika type adalah number
                className={`
                    w-full h-[3.5vw] rounded-[0.8vw] px-[1.5vw] 
                    satoshiMedium text-[1.1vw] text-[#E87E2F] outline-none 
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

    if (loading) return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-white satoshiBold text-[2vw]">Memuat data...</div>;
    if (error) return <div className="w-full min-h-screen flex justify-center items-center bg-[#D9833E] text-white satoshiBold text-[2vw]">{error}</div>;

    return (
        <div className="w-full min-h-screen  p-[3vw] font-sans flex flex-col gap-[2vw]">
            
            {/* --- CSS HACK UNTUK MENGHILANGKAN PANAH INPUT NUMBER --- */}
            <style jsx global>{`
                /* Chrome, Safari, Edge, Opera */
                .remove-arrow::-webkit-outer-spin-button,
                .remove-arrow::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                /* Firefox */
                .remove-arrow {
                    -moz-appearance: textfield;
                }
            `}</style>

            {/* --- HEADER --- */}
            <div className="flex flex-col items-start">
                <h1 className="satoshiBold text-[3vw] text-white leading-tight">
                    Informasi Sekolah
                </h1>
                
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-white/80 italic text-[1vw] hover:text-white hover:underline mt-[0.2vw]"
                    >
                        Edit 
                    </button>
                ) : (
                    <span className="text-white/90 italic text-[1vw] mt-[0.2vw] animate-pulse">Mode Edit Aktif</span>
                )}
            </div>

            {/* --- FORM CONTAINER --- */}
            <div className="flex flex-col gap-[1.5vw] w-[80%]">
                
                <FormField label="Email" name="email" value={email} readOnly={true} />
                <FormField label="Nama Sekolah" name="nama_sekolah" value={formData.nama_sekolah} readOnly={!isEditing} />
                <FormField label="NPSN" name="npsn" value={formData.npsn} readOnly={!isEditing} />
                <FormField label="Jenis Sekolah" name="jenis_sekolah" value={formData.jenis_sekolah} readOnly={!isEditing} />
                <FormField label="Penanggung Jawab" name="penanggung_jawab" value={formData.penanggung_jawab} readOnly={!isEditing} />
                <FormField label="Nomor Kontak" name="nomor_kontak" value={formData.nomor_kontak} readOnly={!isEditing} />
                <FormField label="Alamat" name="alamat" value={formData.alamat} readOnly={!isEditing} />

                {/* --- CUSTOM DISABILITY INPUT (SESUAI GAMBAR) --- */}
                <div className="flex flex-col gap-[1vw] mt-[0.5vw]">
                    <label className="satoshiBold text-[1.4vw] text-white">
                        Detail Jenis Disabilitas Dominan
                    </label>

                    <div className="flex flex-col gap-[1vw]">
                        {disabilityList.map((item, index) => (
                            <div key={index} className="flex gap-[1vw] w-full items-center">
                                
                                {/* 1. INPUT JENIS (KIRI) */}
                                <div className="flex-[3]">
                                    <input 
                                        type="text"
                                        value={item.jenis_disabilitas}
                                        onChange={(e) => handleDisabilityChange(index, 'jenis_disabilitas', e.target.value)}
                                        readOnly={!isEditing}
                                        placeholder="Jenis Disabilitas (cth: Tunarungu)"
                                        className={`w-full h-[3.8vw] rounded-[0.8vw] px-[1.5vw] satoshiMedium text-[1.2vw] text-[#E87E2F] outline-none placeholder-[#E87E2F]/40 bg-white shadow-sm border-none`}
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
                                        // Styling agar ada ruang untuk text "Siswa" + CLASS remove-arrow
                                        className={`w-full h-[3.8vw] rounded-[0.8vw] pl-[1.5vw] pr-[4vw] satoshiMedium text-[1.2vw] text-[#E87E2F] outline-none bg-white shadow-sm border-none remove-arrow`}
                                    />
                                    {/* Suffix "Siswa" Statis */}
                                    <span className="absolute right-[1.5vw] top-1/2 -translate-y-1/2 text-[#E87E2F] satoshiMedium text-[1.1vw] pointer-events-none">
                                        Siswa
                                    </span>
                                </div>

                                {/* 3. TOMBOL HAPUS (Lingkaran Minus) */}
                                {isEditing && (
                                    <button 
                                        onClick={() => removeDisabilityRow(index)}
                                        className="w-[2.5vw] h-[2.5vw] hover:scale-110 transition-transform flex-shrink-0"
                                        title="Hapus baris ini"
                                    >
                                        <MinusCircleIcon />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* TOMBOL TAMBAH */}
                        {isEditing && (
                            <div className="flex justify-end mt-[0.5vw]">
                                <button 
                                    onClick={addDisabilityRow}
                                    className="bg-white hover:bg-white/30 text-[#E87E2F] px-[1.5vw] py-[0.5vw] rounded-[1vw] satoshiBold text-[1vw] transition-colors"
                                >
                                    + Tambah Jenis Disabilitas
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TOTAL SISWA (READ ONLY - AUTO CALCULATED) --- */}
                <div className="">
                    <FormField 
                        label="Jumlah Total Siswa" 
                        name="total_siswa" 
                        value={formData.total_siswa} 
                        readOnly={true} 
                        type="number"
                        placeholder="0" 
                    />
  
                </div>

                {/* --- TOMBOL AKSI --- */}
                {isEditing && (
                    <div className="flex justify-end gap-[1.5vw] mt-[2vw] mb-[5vw]">
                        <button 
                            onClick={() => { setIsEditing(false); window.location.reload(); }} 
                            className="bg-transparent border border-white text-white satoshiBold text-[1.2vw] py-[0.8vw] px-[3vw] rounded-full hover:bg-white/10 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-white text-[#D9833E] satoshiBold text-[1.2vw] py-[0.8vw] px-[4vw] rounded-full shadow-lg transition-transform active:scale-95
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[2vw] p-[3vw] w-[35vw] shadow-2xl flex flex-col items-center text-center">
                        <div className="relative w-[12vw] h-[12vw]">
                            <Image src={bg} alt="bg" layout="fill" objectFit="contain" />
                            <Image src={loadingSpinner} alt="spinner" className="w-[5vw] h-[5vw] object-contain absolute inset-0 m-auto animate-spin" />
                        </div>
                        <h3 className="satoshiBold text-[2.5vw] text-[#E87E2F] mt-[2vw]">Sedang Diproses</h3>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[1.5vw] p-[3vw] w-[28vw] shadow-2xl flex flex-col items-center text-center gap-[2vw]">
                        <div className="w-[5vw] h-[5vw] rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[2vw]">✓</div>
                        <h3 className="satoshiBold text-[1.8vw] text-gray-800">{successMessage}</h3>
                        <button onClick={() => setSuccessMessage(null)} className="py-[0.8vw] px-[3vw] rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-[1.2vw] hover:bg-[#c27233] transition-colors shadow-md">OKE</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InformasiSekolah;