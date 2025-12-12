'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import progress from "@/src/assets/progress.png";
import { BASE_URL } from "@/src/lib/api";
import logoWhite from "../../../../assets/logo-white.png";

const RegisterSekolahPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const [formData, setFormData] = useState({
        namaSekolah: "",
        jenisSekolah: "",
        npsn: "",
        alamat: "",
        jumlahSiswa: "",
        penanggungJawab: "",
        jabatan: "",
        email: "",
        password: "",
        nomor: ""
    });

    const [disabilitasList, setDisabilitasList] = useState([
        { jenis: "", jumlah: "" }
    ]);

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

    const handleDisabilitasChange = (index: number, field: 'jenis' | 'jumlah', value: string) => {
        const newList = [...disabilitasList];
        if (field === 'jumlah') {
            newList[index][field] = value.replace(/[^0-9]/g, '');
        } else {
            newList[index][field] = value;
        }
        setDisabilitasList(newList);
    };

    const addDisabilitasRow = () => {
        setDisabilitasList([...disabilitasList, { jenis: "", jumlah: "" }]);
    };

    const handleNext = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.namaSekolah) newErrors.namaSekolah = "Nama sekolah wajib diisi";
        if (!formData.jenisSekolah) newErrors.jenisSekolah = "Jenis sekolah wajib diisi";
        if (!formData.npsn) newErrors.npsn = "NPSN wajib diisi";
        if (!formData.alamat) newErrors.alamat = "Alamat wajib diisi";

        if (!formData.email) newErrors.email = "Email wajib diisi";
        if (!formData.password) newErrors.password = "Password wajib diisi";

        if (!formData.jumlahSiswa) newErrors.jumlahSiswa = "Total siswa wajib diisi";
        const validDisabilitas = disabilitasList.filter(d => d.jenis !== "" && d.jumlah !== "");
        if (validDisabilitas.length === 0) {
            alert("Mohon isi minimal satu jenis disabilitas dominan.");
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        setApiError("");
        const newErrors: { [key: string]: string } = {};

        if (!formData.penanggungJawab) newErrors.penanggungJawab = "Nama wajib diisi";
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
                nama_sekolah: formData.namaSekolah,
                npsn: formData.npsn,
                jenis_sekolah: formData.jenisSekolah,
                alamat: formData.alamat,
                total_siswa: parseInt(formData.jumlahSiswa),
                penanggung_jawab: formData.penanggungJawab,
                nomor_kontak: formData.nomor,
                disability_types: disabilitasList
                    .filter(d => d.jenis && d.jumlah)
                    .map(d => ({
                        jenis_disabilitas: d.jenis,
                        jumlah_siswa: parseInt(d.jumlah)
                    }))
            };

            const res = await fetch(`${BASE_URL}/auth/register/sekolah`, {
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
        <section className="flex flex-col md:flex-row min-h-screen w-full bg-white relative overflow-x-hidden">

            {/* --- POPUP SUKSES --- */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-sm md:w-[40vw] md:max-w-none rounded-xl md:rounded-[1.5vw] p-6 md:p-[3vw] flex flex-col items-center justify-center gap-4 md:gap-[1.5vw] shadow-2xl animate-in zoom-in duration-300">
                        <Image src={progress} alt="Progress" className="w-16 h-16 md:w-[8vw] md:h-[8vw]" />
                        <div className="text-center">
                            <h2 className="satoshiBold text-xl md:text-[2vw] text-[#B56225] mb-2 md:mb-[0.5vw]">Pendaftaran Berhasil!</h2>
                            <p className="satoshiMedium text-sm md:text-[1.1vw] text-[#B56225]">
                                Akun Anda sedang diproses. Admin akan memverifikasi dalam waktu 1x24 jam.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-[#D9833E] text-white satoshiBold text-base md:text-[1.2vw] py-3 md:py-[0.8vw] rounded-lg md:rounded-[0.8vw] hover:bg-[#c27233] transition-colors shadow-md mt-4 md:mt-[1vw]"
                        >
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            )}

    

            {/* --- BAGIAN KANAN (FORM) --- */}
            <div className="flex flex-col w-full md:w-[60vw] md:h-screen items-center justify-start pt-8 px-6 pb-10 md:pt-[4vw] md:px-[8vw] gap-6 md:gap-[3vw] relative overflow-y-auto bg-white">

                {/* TOMBOL BACK (PANAH) */}
                <Link href="/register" className="md:absolute fixed top-4 left-4 md:top-[2vw] md:left-[2vw] hover:scale-110 transition-transform z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 md:w-[2.5vw] md:h-[2.5vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>

                {/* Progress Bar */}
                <div className="w-full flex flex-row items-center gap-2 md:gap-[1vw]">
                    <div className="w-full h-2 md:h-[0.8vw] bg-[#FADEC9] rounded-full overflow-hidden">
                        <div className={`h-full bg-[#B56225] transition-all duration-500 ease-in-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                    <span className="satoshiBold text-sm md:text-[1.2vw] text-black whitespace-nowrap">{step}/2</span>
                </div>

                {/* Header */}
                <div className="flex flex-col text-[#B56225] items-center leading-none gap-2 md:gap-[0.5vw]">
                    <h1 className="satoshiBold text-[#B56225] text-4xl md:text-[4.5vw]">Daftar</h1>
                    <p className="satoshiMedium text-[#B56225] text-base md:text-[1.5vw]">Daftar Sekolah untuk Bergabung!</p>
                </div>

                {/* Error Box */}
                {apiError && (
                    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 md:px-[1vw] md:py-[0.8vw] rounded-md md:rounded-[0.5vw] text-center satoshiMedium text-sm md:text-[1vw]">
                        {apiError}
                    </div>
                )}

                <div className="w-full flex flex-col gap-4 md:gap-[1vw]">

                    {/* --- STEP 1 --- */}
                    {step === 1 && (
                        <>
                            <h3 className="satoshiBold text-[#D9833E] text-lg md:text-[1.5vw] mb-1 md:mb-[0.5vw]">Identitas Sekolah</h3>
                            
                            <InputGroup label="Nama Sekolah" name="namaSekolah" value={formData.namaSekolah} onChange={handleChange} placeholder="Masukkan nama sekolah" error={errors.namaSekolah} />
                            <InputGroup label="Jenis Sekolah" name="jenisSekolah" value={formData.jenisSekolah} onChange={handleChange} placeholder="Masukkan jenis sekolah" error={errors.jenisSekolah} />
                            <InputGroup label="NPSN" name="npsn" value={formData.npsn} onChange={handleNumberChange} placeholder="Masukkan NPSN sekolah" type="text" error={errors.npsn} />
                            <InputGroup label="Alamat Lengkap" name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Masukkan alamat sekolah" error={errors.alamat} />

                            <InputGroup label="Email Sekolah" name="email" value={formData.email} onChange={handleChange} placeholder="Masukkan email sekolah (untuk login)" type="email" error={errors.email} />
                            <InputGroup label="Buat Password" name="password" value={formData.password} onChange={handleChange} placeholder="Masukkan password (untuk login)" type="password" error={errors.password} />

                            {/* Bagian Disabilitas */}
                            <div className="flex flex-col gap-2 md:gap-[0.5vw] mt-2 md:mt-[0.5vw]">
                                <label className="satoshiMedium text-[#D9833E] text-sm md:text-[1.1vw]">Detail Jenis Disabilitas Dominan</label>
                                <div className="flex flex-col gap-3 md:gap-[0.8vw]">
                                    {disabilitasList.map((item, index) => (
                                        <div key={index} className="flex flex-row gap-2 md:gap-[1vw] items-start">
                                            <input 
                                                type="text" 
                                                value={item.jenis} 
                                                onChange={(e) => handleDisabilitasChange(index, 'jenis', e.target.value)} 
                                                placeholder={`Masukkan jenis disabilitas `} 
                                                className="w-[70%] border-2 md:border-[0.15vw] border-[#D9833E] rounded-lg md:rounded-[0.6vw] px-4 md:px-[1vw] py-3 md:py-[0.8vw] text-base md:text-[1vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 md:focus:ring-[0.15vw] focus:ring-[#E87E2F]" 
                                            />
                                            <input 
                                                type="text" 
                                                value={item.jumlah} 
                                                onChange={(e) => handleDisabilitasChange(index, 'jumlah', e.target.value)} 
                                                placeholder="Jumlah siswa" 
                                                className="w-[30%] border-2 md:border-[0.15vw] border-[#D9833E] rounded-lg md:rounded-[0.6vw] px-2 md:px-[1vw] py-3 md:py-[0.8vw] text-base md:text-[1vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 md:focus:ring-[0.15vw] focus:ring-[#E87E2F] text-center" 
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-2 md:mt-[0.5vw]">
                                    <button onClick={addDisabilitasRow} className="bg-[#D9833E] text-white text-xs md:text-[0.9vw] px-4 md:px-[1.5vw] py-2 md:py-[0.5vw] rounded-full satoshiMedium hover:bg-[#c27233] shadow-sm transition-colors">
                                        + Tambah Jenis
                                    </button>
                                </div>
                            </div>

                            <InputGroup label="Total Siswa Keseluruhan" name="jumlahSiswa" value={formData.jumlahSiswa} onChange={handleNumberChange} placeholder="Masukkan jumlah siswa keseluruhan" type="text" error={errors.jumlahSiswa} />

                            <div className="flex justify-end mt-4 md:mt-[1vw]">
                                <button onClick={handleNext} className="satoshiBold text-[#D9833E] text-base md:text-[1.2vw] hover:text-[#B56225] transition-colors">Lanjut</button>
                            </div>
                        </>
                    )}

                    {/* --- STEP 2 --- */}
                    {step === 2 && (
                        <>
                            <h3 className="satoshiBold text-[#D9833E] text-lg md:text-[1.5vw] mb-1 md:mb-[0.5vw]">Identitas Penanggung Jawab</h3>
                            <InputGroup label="Nama Penanggung Jawab" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange} placeholder="Masukkan nama penanggung jawab" error={errors.penanggungJawab} />
                            <InputGroup label="Jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange} placeholder="Masukkan jabatan penanggung jawab" error={errors.jabatan} />
                            <InputGroup label="Nomor WhatsApp Aktif" name="nomor" value={formData.nomor} onChange={handleNumberChange} placeholder="Masukkan nomor" type="text" error={errors.nomor} />

                            <div className="flex justify-start mt-2 md:mt-[0.5vw] mb-4 md:mb-[1vw]">
                                <button onClick={() => setStep(1)} className="satoshiBold text-[#D9833E] text-base md:text-[1.2vw] hover:text-[#B56225] transition-colors">Kembali</button>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`w-full text-white satoshiBold text-lg md:text-[1.5vw] py-3 md:py-[1vw] rounded-xl md:rounded-[1vw] shadow-md mt-2 md:mt-[1vw] transition-colors
                                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9833E] hover:bg-[#c27233]'}
                                `}
                            >
                                {isLoading ? "Memproses..." : "Daftar Sekarang"}
                            </button>
                        </>
                    )}
                </div>

                <div className="pb-8 md:pb-[4vw]">
                    <p className="satoshiMedium text-[#D9833E] text-sm md:text-[1.1vw] text-center md:text-left">
                        Sudah punya akun? <Link href="/login" className="satoshiBold underline cursor-pointer hover:text-[#B56225]">Masuk</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

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
            <label className="satoshiMedium text-[#D9833E] text-sm md:text-[1.1vw]">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full border-2 md:border-[0.15vw] ${error ? 'border-red-500 focus:ring-red-200' : 'border-[#D9833E] focus:ring-[#E87E2F]'} 
                rounded-lg md:rounded-[0.6vw] px-4 md:px-[1vw] py-3 md:py-[0.8vw] 
                text-base md:text-[1vw] text-[#B56225] placeholder:text-gray-400 
                focus:outline-none focus:ring-2 md:focus:ring-[0.15vw] transition-all`}
            />
            {error && <span className="text-red-500 text-xs md:text-[0.8vw] satoshiMedium">{error}</span>}
        </div>
    )
}

export default RegisterSekolahPage;