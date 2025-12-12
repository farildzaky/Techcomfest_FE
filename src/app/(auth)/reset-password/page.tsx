'use client'
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { BASE_URL } from "@/src/lib/api"; 
import logoWhite from "../../../assets/logo-white.png"; 

// Komponen Content dipisah agar bisa dibungkus Suspense (Wajib di Next.js App Router)
const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Ambil token dari URL (?token=...)
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok.");
            return;
        }

        if (!token) {
            setError("Token tidak ditemukan. Silakan ulangi proses lupa password.");
            return;
        }

        setIsLoading(true);

        try {
            // Sesuai endpoint di screenshot API (Screenshot...14.53.44.jpg)
            const res = await fetch(`${BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    token: token,
                    new_password: password 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mereset password. Token mungkin sudah kadaluarsa.");
            }

            setSuccess(true);
            
            // Redirect otomatis setelah 3 detik
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-[60vw] h-full justify-center items-center px-[8vw] gap-[3vw] z-10 relative">
            <div className="flex flex-col text-[#B56225] items-center leading-none gap-[0.5vw]">
                <h1 className="satoshiBold text-[3.5vw]">Buat Password Baru</h1>
                <p className="satoshiMedium text-[1.2vw] text-gray-500">Silakan masukkan password baru Anda.</p>
            </div>

            <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-[1.5vw]">
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-[1vw] py-[0.8vw] rounded-[0.5vw] satoshiMedium text-[1vw] text-center">
                        Sukses! Password berhasil diubah. Mengalihkan ke halaman login...
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-[1vw] py-[0.8vw] rounded-[0.5vw] satoshiMedium text-[1vw] text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-[0.5vw]">
                    <label className="satoshiMedium text-[#D9833E] text-[1.2vw]">Password Baru</label>
                    <input
                        type="password"
                        placeholder="Masukkan password baru"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-[0.2vw] border-[#D9833E] rounded-[0.8vw] px-[1.5vw] py-[1vw] text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                        required
                        disabled={isLoading || success}
                    />
                </div>

                <div className="flex flex-col gap-[0.5vw]">
                    <label className="satoshiMedium text-[#D9833E] text-[1.2vw]">Konfirmasi Password</label>
                    <input
                        type="password"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border-[0.2vw] border-[#D9833E] rounded-[0.8vw] px-[1.5vw] py-[1vw] text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                        required
                        disabled={isLoading || success}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || success}
                    className={`w-full cursor-pointer text-white satoshiBold text-[1.5vw] py-[1vw] rounded-[0.8vw] mt-[1vw] transition-colors duration-300 shadow-md
                        ${isLoading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9833E] hover:bg-[#c27233]'}
                    `}
                >
                    {isLoading ? "Memproses..." : "Ubah Password"}
                </button>
            </form>
        </div>
    );
};

// Halaman Utama Wrapper
const ResetPasswordPage = () => {
    return (
        <section className="flex flex-row h-screen w-full bg-white relative">
            
            
            {/* Suspense diperlukan karena useSearchParams */}
            <Suspense fallback={<div className="w-[60vw] flex justify-center items-center text-[#D9833E] satoshiBold text-[1.5vw]">Memuat...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </section>
    )
}

export default ResetPasswordPage;