'use client'
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_URL } from "@/src/lib/api";
import logoWhite from "../../assets/logo-white.png";

const Login = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login gagal.");

            const user = data.data.user;
            const userRole = user.role;

            // Set Cookies & LocalStorage
            document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
            if (data.data.refresh_token) {
                document.cookie = `refreshToken=${data.data.refresh_token}; path=/; max-age=604800; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
            }
            document.cookie = `userRole=${userRole}; path=/; max-age=86400; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
            localStorage.setItem("user", JSON.stringify(user));

            // Redirect
            if (userRole === "sekolah") router.push("/sekolah/dashboard");
            else if (userRole === "sppg") router.push("/sppg/dashboard");
            else if (userRole === "admin") router.push("/admin/dashboard");
            else setError("Role akun tidak dikenali.");

        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Container Utama: Flex Column di HP, Row di Desktop
        <section className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-x-hidden">

            {/* --- BAGIAN KIRI (ORANYE) --- */}
            <div className="flex flex-col bg-[#E87E2F] w-full md:w-[40vw] md:h-screen items-center justify-center gap-4 md:gap-[1vw] py-10 md:py-0 shrink-0">
                {/* Logo: Ukuran tetap di HP, VW di Desktop */}
                <Image 
                    src={logoWhite} 
                    alt="logo" 
                    className="w-24 md:w-[15vw] h-auto object-contain" 
                />
                <h1 className="satoshiBold text-2xl md:text-[3.5vw] text-white text-center leading-tight px-4">
                    Peduli Gizi, <br />Peduli Inklusi
                </h1>
            </div>

            {/* --- BAGIAN KANAN (FORM) --- */}
            <div className="flex flex-col w-full md:w-[60vw] md:h-screen justify-center items-center px-6 py-10 md:px-[8vw] gap-6 md:gap-[3vw] relative bg-white">

                {/* Tombol Back */}
                <Link href="/" className="fixed md:absolute cursor-pointer top-4 left-4 md:top-[2vw] md:left-[2vw] hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-8 h-8 md:w-[3vw] md:h-[3vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>

                {/* Judul Form */}
                <div className="flex flex-col text-[#B56225] items-center leading-none gap-2 md:gap-[0.5vw] mt-8 md:mt-0">
                    <h1 className="satoshiBold text-4xl md:text-[4.5vw]">Masuk</h1>
                    <p className="satoshiMedium text-base md:text-[1.5vw]">Masuk ke dalam akun Anda</p>
                </div>

                {/* Form Input */}
                <form onSubmit={handleLogin} className="w-full max-w-md md:max-w-none flex flex-col gap-4 md:gap-[1.5vw]">

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm md:text-[1vw] text-center satoshiMedium">
                            {error}
                        </div>
                    )}

                    {/* Input Email */}
                    <div className="flex flex-col gap-2 md:gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-sm md:text-[1.2vw]">Email</label>
                        <input
                            type="text"
                            placeholder="Masukkan Email Anda"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // Mobile: Text-base (agar tidak zoom), Desktop: Text-vw
                            className="w-full border-2 md:border-[0.2vw] border-[#D9833E] rounded-lg md:rounded-[0.8vw] px-4 py-3 md:px-[1.5vw] md:py-[1vw] text-base md:text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 md:focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Input Password */}
                    <div className="flex flex-col gap-2 md:gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-sm md:text-[1.2vw]">Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 md:border-[0.2vw] border-[#D9833E] rounded-lg md:rounded-[0.8vw] px-4 py-3 md:px-[1.5vw] md:py-[1vw] text-base md:text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 md:focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                        <div className="flex justify-end mt-1 md:mt-[0.2vw]">
                            <Link href="/forgot-password" className="satoshiMedium text-[#D9833E] text-sm md:text-[1.1vw] hover:underline cursor-pointer">
                                Lupa Password?
                            </Link>
                        </div>
                    </div>

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full cursor-pointer text-white satoshiBold text-lg md:text-[1.5vw] py-3 md:py-[1vw] rounded-lg md:rounded-[0.8vw] mt-2 md:mt-[1vw] transition-colors duration-300 shadow-md
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9833E] hover:bg-[#c27233]'}
                        `}
                    >
                        {isLoading ? "Memproses..." : "Masuk"}
                    </button>

                    <p className="satoshiMedium text-sm md:text-[1.2vw] text-[#D9833E] text-center">
                        Belum punya akun?{" "}
                        <Link href="/register" className="hover:text-[#B56225] underline cursor-pointer">
                            Daftar
                        </Link>
                    </p>
                </form>
            </div>
        </section>
    )
}

export default Login;