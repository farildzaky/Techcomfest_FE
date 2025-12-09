'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import progressIcon from "@/src/assets/progress.png"; 

const RegisterSppgPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // State UI
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // State Data Form
    const [formData, setFormData] = useState({
        namaInstansi: "",   // nama_instansi
        wilayahKerja: "",   // wilayah_kerja
        alamat: "",         // alamat
        email: "",          // email (Untuk Login)
        password: "",       // password (Untuk Login)
        penanggungJawab: "",// penanggung_jawab
        jabatan: "",        // jabatan (Opsional di API docs, tapi ada di UI)
        nomor: ""           // nomor_kontak
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Handler Input Teks
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Handler Input Angka
    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Validasi Step 1
    const handleNext = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.namaInstansi) newErrors.namaInstansi = "Nama instansi wajib diisi";
        if (!formData.wilayahKerja) newErrors.wilayahKerja = "Wilayah kerja wajib diisi";
        if (!formData.alamat) newErrors.alamat = "Alamat instansi wajib diisi";
        if (!formData.email) newErrors.email = "Email wajib diisi";
        if (!formData.password) newErrors.password = "Password wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            setStep(2);
        }
    };

    // Submit ke API
    const handleSubmit = async () => {
        setApiError("");
        const newErrors: { [key: string]: string } = {};

        if (!formData.penanggungJawab) newErrors.penanggungJawab = "Nama penanggung jawab wajib diisi";
        if (!formData.jabatan) newErrors.jabatan = "Jabatan wajib diisi";
        if (!formData.nomor) newErrors.nomor = "Nomor HP wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Mapping Payload sesuai API Docs
            const payload = {
                email: formData.email,
                password: formData.password,
                nama_instansi: formData.namaInstansi,
                wilayah_kerja: formData.wilayahKerja,
                alamat: formData.alamat,
                penanggung_jawab: formData.penanggungJawab,
                nomor_kontak: formData.nomor,
                // jabatan: formData.jabatan // Field ini dikirim jika backend menerima, jika tidak bisa dihapus
            };

            const res = await fetch("/auth/register/sppg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mendaftar. Silakan coba lagi.");
            }

            // Sukses
            setShowPopup(true);

        } catch (err: any) {
            setApiError(err.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-row h-screen w-full bg-white relative">
            
            {/* Popup Sukses */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-[40vw] rounded-[1.5vw] p-[3vw] flex flex-col items-center justify-center gap-[1.5vw] shadow-2xl animate-in zoom-in duration-300">
                        <Image src={progressIcon} alt="Progress" className="w-[8vw] h-[8vw]" />
                        <div className="text-center">
                            <h2 className="satoshiBold text-[2vw] text-[#B56225] mb-[0.5vw]">Pendaftaran Berhasil!</h2>
                            <p className="satoshiMedium text-[1.1vw] text-[#B56225]">
                                 Akun Anda sedang diproses. Admin akan memverifikasi dalam waktu 1x24 jam.
                            </p>
                        </div>
                        <button 
                            onClick={() => router.push('/login')}
                            className="w-full bg-[#E87E2F] text-white satoshiBold text-[1.2vw] py-[0.8vw] rounded-[0.8vw] hover:bg-[#c27233] transition-colors shadow-md mt-[1vw]"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            )}

            {/* Sisi Kiri */}
            <div className="flex flex-col bg-[#E87E2F] w-[40vw] h-full items-center justify-center gap-[2vw] text-white">
                <h1 className="satoshiBold text-[4vw]">Logo</h1>
                <h2 className="satoshiBold text-[2.5vw]">Tagline</h2>
            </div>

            {/* Sisi Kanan */}
            <div className="flex flex-col w-[60vw] h-full items-center justify-start pt-[4vw] px-[8vw] gap-[3vw] relative overflow-y-auto pb-[5vw]">
                
                {/* Progress Bar */}
                <div className="w-full flex flex-row items-center gap-[1vw] ">
                    <div className="w-full h-[0.8vw] bg-[#FADEC9] rounded-full overflow-hidden">
                        <div className={`h-full bg-[#B56225] transition-all duration-500 ease-in-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                    <span className="satoshiBold text-[1.2vw] text-black">{step}/2</span>
                </div>

                <div className="flex flex-col text-[#B56225] items-center leading-none gap-[0.5vw]">
                    <h1 className="satoshiBold text-[#B56225] text-[4.5vw]">Daftar</h1>
                    <p className="satoshiMedium text-[#B56225] text-[1.5vw]">Daftar SPPG untuk Bergabung!</p>
                </div>

                {/* Error Message */}
                {apiError && (
                    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-[1vw] py-[0.8vw] rounded-[0.5vw] text-center satoshiMedium text-[1vw]">
                        {apiError}
                    </div>
                )}

                <div className="w-full flex flex-col gap-[1vw] ">
                    
                    {/* STEP 1: Identitas Instansi & Akun */}
                    {step === 1 && (
                        <>
                            <h3 className="satoshiBold text-[#E87E2F] text-[1.5vw] mb-[0.5vw]">Identitas Instansi SPPG</h3>
                            
                            <InputGroup 
                                label="Nama Instansi/Dinas" 
                                name="namaInstansi" 
                                value={formData.namaInstansi} 
                                onChange={handleChange} 
                                placeholder="Masukkan nama instansi" 
                                error={errors.namaInstansi} 
                            />
                            
                            <InputGroup 
                                label="Wilayah Kerja" 
                                name="wilayahKerja" 
                                value={formData.wilayahKerja} 
                                onChange={handleChange} 
                                placeholder="Contoh: Kota Malang" 
                                error={errors.wilayahKerja} 
                            />
                            
                            <InputGroup 
                                label="Alamat Lengkap" 
                                name="alamat" 
                                value={formData.alamat} 
                                onChange={handleChange} 
                                placeholder="Jl. Veteran No. 10" 
                                error={errors.alamat} 
                            />

                            {/* FIELD AKUN (Wajib untuk API) */}
                            <InputGroup 
                                label="Email Instansi " 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="email@instansi.com" 
                                type="email"
                                error={errors.email} 
                            />
                            <InputGroup 
                                label="Password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="Minimal 6 karakter" 
                                type="password"
                                error={errors.password} 
                            />

                            <div className="flex justify-end mt-[1vw]">
                                <button onClick={handleNext} className="satoshiBold text-[#E87E2F] text-[1.2vw] hover:text-[#B56225] transition-colors">Lanjut</button>
                            </div>
                        </>
                    )}

                    {/* STEP 2: Penanggung Jawab */}
                    {step === 2 && (
                        <>
                            <h3 className="satoshiBold text-[#E87E2F] text-[1.5vw] mb-[0.5vw]">Identitas Penanggung Jawab</h3>
                            
                            <InputGroup 
                                label="Nama Penanggung Jawab" 
                                name="penanggungJawab" 
                                value={formData.penanggungJawab} 
                                onChange={handleChange} 
                                placeholder="Nama lengkap" 
                                error={errors.penanggungJawab} 
                            />
                            
                            <InputGroup 
                                label="Jabatan" 
                                name="jabatan" 
                                value={formData.jabatan} 
                                onChange={handleChange} 
                                placeholder="Contoh: Staff Admin" 
                                error={errors.jabatan} 
                            />
                            
                            <InputGroup 
                                label="Nomor WhatsApp Aktif" 
                                name="nomor" 
                                value={formData.nomor} 
                                onChange={handleNumberChange} 
                                placeholder="08123456789" 
                                type="text"
                                error={errors.nomor} 
                            />

                            <div className="flex justify-start mt-[0.5vw] mb-[1vw]">
                                <button onClick={() => setStep(1)} className="satoshiBold text-[#E87E2F] text-[1.2vw] hover:text-[#B56225] transition-colors">Kembali</button>
                            </div>

                            <button 
                                onClick={handleSubmit} 
                                disabled={isLoading}
                                className={`w-full text-white satoshiBold text-[1.5vw] py-[1vw] rounded-[1vw] shadow-md mt-[1vw] transition-colors
                                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E87E2F] hover:bg-[#c27233]'}
                                `}
                            >
                                {isLoading ? "Memproses..." : "Daftar Sekarang"}
                            </button>
                        </>
                    )}
                </div>

                <div className="pb-[4vw]">
                    <p className="satoshiMedium text-[#E87E2F] text-[1.1vw]">
                        Sudah punya akun? <Link href="/login" className="satoshiBold underline cursor-pointer hover:text-[#B56225]">Masuk</Link>
                    </p>
                </div>

            </div>
        </section>
    );
}

// Reusable Input Component
interface InputGroupProps {
    label: string;
    placeholder: string;
    type?: string;
    name?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const InputGroup = ({ label, placeholder, type = "text", name, value, onChange, error }: InputGroupProps) => {
    return (
        <div className="flex flex-col gap-[0.5vw]">
            <label className="satoshiMedium text-[#E87E2F] text-[1.1vw]">{label}</label>
            <input 
                type={type} 
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder} 
                className={`w-full border-[0.15vw] ${error ? 'border-red-500 focus:ring-red-200' : 'border-[#E87E2F] focus:ring-[#E87E2F]'} rounded-[0.6vw] px-[1vw] py-[0.8vw] text-[1vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.15vw]`}
            />
            {error && <span className="text-red-500 text-[0.8vw] satoshiMedium">{error}</span>}
        </div>
    )
}

export default RegisterSppgPage;