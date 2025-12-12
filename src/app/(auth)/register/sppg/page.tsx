'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import progressIcon from "@/src/assets/progress.png";
import { BASE_URL } from "@/src/lib/api";
import logoWhite from "../../../../assets/logo-white.png";

const RegisterSppgPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const [formData, setFormData] = useState({
        namaInstansi: "",   
        wilayahKerja: "",  
        alamat: "",        
        email: "",          
        password: "",      
        penanggungJawab: "",
        jabatan: "",        
        nomor: ""           
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleNext = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.namaInstansi) newErrors.namaInstansi = "Nama instansi wajib diisi";
        if (!formData.wilayahKerja) newErrors.wilayahKerja = "Wilayah kerja wajib diisi";
        if (!formData.alamat) newErrors.alamat = "Alamat instansi wajib diisi";
        if (!formData.email) newErrors.email = "Email wajib diisi";
        if (!formData.password) newErrors.password = "Password wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll ke atas agar user melihat error di mobile
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        setApiError("");
        const newErrors: { [key: string]: string } = {};

        if (!formData.penanggungJawab) newErrors.penanggungJawab = "Nama penanggung jawab wajib diisi";
        if (!formData.jabatan) newErrors.jabatan = "Jabatan wajib diisi";
        if (!formData.nomor) newErrors.nomor = "Nomor HP wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                nama_instansi: formData.namaInstansi,
                wilayah_kerja: formData.wilayahKerja,
                alamat: formData.alamat,
                penanggung_jawab: formData.penanggungJawab,
                nomor_kontak: formData.nomor,
            };

            const res = await fetch(`${BASE_URL}/auth/register/sppg`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mendaftar. Silakan coba lagi.");
            }

            setShowPopup(true);

        } catch (err: any) {
            setApiError(err.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Container Utama: Flex-col (HP), Flex-row (Desktop)
        <section className="flex flex-col md:flex-row min-h-screen w-full bg-white relative overflow-x-hidden">

            {/* --- POPUP SUCCESS --- */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-sm md:w-[40vw] md:max-w-none rounded-xl md:rounded-[1.5vw] p-6 md:p-[3vw] flex flex-col items-center justify-center gap-4 md:gap-[1.5vw] shadow-2xl animate-in zoom-in duration-300">
                        <Image src={progressIcon} alt="Progress" className="w-16 h-16 md:w-[8vw] md:h-[8vw]" />
                        <div className="text-center">
                            <h2 className="satoshiBold text-xl md:text-[2vw] text-[#B56225] mb-2 md:mb-[0.5vw]">Pendaftaran Berhasil!</h2>
                            <p className="satoshiMedium text-sm md:text-[1.1vw] text-[#B56225]">
                                Akun Anda sedang diproses. Admin akan memverifikasi dalam waktu 1x24 jam.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-[#E87E2F] text-white satoshiBold text-base md:text-[1.2vw] py-3 md:py-[0.8vw] rounded-lg md:rounded-[0.8vw] hover:bg-[#c27233] transition-colors shadow-md mt-4 md:mt-[1vw]"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            )}



            {/* --- BAGIAN KANAN (FORM) --- */}
            {/* Menggunakan min-h di HP agar bisa scroll jika konten panjang */}
            <div className="flex flex-col w-full md:w-[60vw] md:h-screen items-center justify-start pt-8 px-6 pb-10 md:pt-[4vw] md:px-[8vw] gap-6 md:gap-[3vw] relative overflow-y-auto bg-white">

                {/* Progress Bar */}
                <div className="w-full flex flex-row items-center gap-2 md:gap-[1vw]">
                    <div className="w-full h-2 md:h-[0.8vw] bg-[#FADEC9] rounded-full overflow-hidden">
                        <div className={`h-full bg-[#B56225] transition-all duration-500 ease-in-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                    <span className="satoshiBold text-sm md:text-[1.2vw] text-black whitespace-nowrap">{step}/2</span>
                </div>

                <Link href="/register" className="md:absolute fixed top-4 left-4 md:top-[2vw] md:left-[2vw] hover:scale-110 transition-transform z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 md:w-[2.5vw] md:h-[2.5vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>

                {/* Judul Halaman */}
                <div className="flex flex-col text-[#B56225] items-center leading-none gap-2 md:gap-[0.5vw]">
                    <h1 className="satoshiBold text-[#B56225] text-4xl md:text-[4.5vw]">Daftar</h1>
                    <p className="satoshiMedium text-[#B56225] text-base md:text-[1.5vw]">Daftar SPPG untuk Bergabung!</p>
                </div>

                {/* Error Message */}
                {apiError && (
                    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 md:px-[1vw] md:py-[0.8vw] rounded-md md:rounded-[0.5vw] text-center satoshiMedium text-sm md:text-[1vw]">
                        {apiError}
                    </div>
                )}

                {/* Form Container */}
                <div className="w-full flex flex-col gap-4 md:gap-[1vw]">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <>
                            <h3 className="satoshiBold text-[#E87E2F] text-lg md:text-[1.5vw] mb-1 md:mb-[0.5vw]">Identitas Instansi SPPG</h3>

                            <InputGroup label="Nama Instansi/Dinas" name="namaInstansi" value={formData.namaInstansi} onChange={handleChange} placeholder="Masukkan nama instansi atau Dinas anda" error={errors.namaInstansi} />
                            <InputGroup label="Wilayah Kerja" name="wilayahKerja" value={formData.wilayahKerja} onChange={handleChange} placeholder="Masukkan wilayah kecamatan Instansi/Dinas" error={errors.wilayahKerja} />
                            <InputGroup label="Alamat Instansi" name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Masukkan alamat lengkap Instansi/Dinas" error={errors.alamat} />
                            <InputGroup label="Email Instansi" name="email" value={formData.email} onChange={handleChange} placeholder="Masukkan email Instansi (untuk login)" type="email" error={errors.email} />
                            <InputGroup label="Password" name="password" value={formData.password} onChange={handleChange} placeholder="Masukkan password (untuk login)" type="password" error={errors.password} />

                            <div className="flex justify-end mt-4 md:mt-[1vw]">
                                <button onClick={handleNext} className="satoshiBold text-[#E87E2F] text-base md:text-[1.2vw] hover:text-[#B56225] transition-colors">Lanjut</button>
                            </div>
                        </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <>
                            <h3 className="satoshiBold text-[#E87E2F] text-lg md:text-[1.5vw] mb-1 md:mb-[0.5vw]">Identitas Penanggung Jawab</h3>

                            <InputGroup label="Nama Penanggung Jawab" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange} placeholder="Masukkan nama penanggung jawab" error={errors.penanggungJawab} />
                            <InputGroup label="Jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange} placeholder="Masukkan jabatan penanggung jawab" error={errors.jabatan} />
                            <InputGroup label="Nomor WhatsApp Aktif" name="nomor" value={formData.nomor} onChange={handleNumberChange} placeholder="Masukkan nomor" type="text" error={errors.nomor} />

                            <div className="flex justify-start mt-2 md:mt-[0.5vw] mb-4 md:mb-[1vw]">
                                <button onClick={() => setStep(1)} className="satoshiBold text-[#E87E2F] text-base md:text-[1.2vw] hover:text-[#B56225] transition-colors">Kembali</button>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`w-full text-white satoshiBold text-lg md:text-[1.5vw] py-3 md:py-[1vw] rounded-xl md:rounded-[1vw] shadow-md mt-2 md:mt-[1vw] transition-colors
                                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E87E2F] hover:bg-[#c27233]'}
                                `}
                            >
                                {isLoading ? "Memproses..." : "Daftar Sekarang"}
                            </button>
                        </>
                    )}
                </div>

                {/* Footer Login Link */}
                <div className="pb-8 md:pb-[4vw]">
                    <p className="satoshiMedium text-[#E87E2F] text-sm md:text-[1.1vw] text-center md:text-left">
                        Sudah punya akun? <Link href="/login" className="satoshiBold underline cursor-pointer hover:text-[#B56225]">Masuk</Link>
                    </p>
                </div>

            </div>
        </section>
    );
}

// --- INPUT COMPONENT (Responsive) ---
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
        <div className="flex flex-col gap-2 md:gap-[0.5vw]">
            <label className="satoshiMedium text-[#E87E2F] text-sm md:text-[1.1vw]">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                // Mobile: border-2, text-base (biar ga zoom), py-3
                // Desktop: border-[0.15vw], text-[1vw], py-[0.8vw]
                className={`w-full border-2 md:border-[0.15vw] ${error ? 'border-red-500 focus:ring-red-200' : 'border-[#E87E2F] focus:ring-[#E87E2F]'} 
                rounded-lg md:rounded-[0.6vw] px-4 md:px-[1vw] py-3 md:py-[0.8vw] 
                text-base md:text-[1vw] text-[#B56225] placeholder:text-gray-400 
                focus:outline-none focus:ring-2 md:focus:ring-[0.15vw] transition-all`}
            />
            {error && <span className="text-red-500 text-xs md:text-[0.8vw] satoshiMedium">{error}</span>}
        </div>
    )
}

export default RegisterSppgPage;