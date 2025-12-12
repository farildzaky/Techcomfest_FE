'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_URL } from "@/src/lib/api";
import Image from 'next/image';
// Ganti path ini sesuai lokasi logo Anda sebenarnya
import logoWhite from "../../../../assets/logo-white.png";

const LoginAdmin = () => {
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login gagal. Periksa kembali email dan password.");
            }

            const user = data.data.user;
            const userRole = user.role;

            if (userRole !== "admin") {
                throw new Error("Akses ditolak. Akun ini bukan akun Administrator.");
            }

            document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Lax`;

            if (data.data.refresh_token) {
                document.cookie = `refreshToken=${data.data.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
            }

            document.cookie = `userRole=${userRole}; path=/; max-age=86400; SameSite=Lax`;

            localStorage.setItem("user", JSON.stringify(user));

            router.push("/admin/dashboard");

        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan pada sistem.");
            document.cookie = "accessToken=; Max-Age=0; path=/;";
            document.cookie = "userRole=; Max-Age=0; path=/;";
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Layout Utama: Column di Mobile, Row di Desktop
        <section className="flex flex-col lg:flex-row min-h-screen w-full bg-white">
            
            {/* Bagian Kiri (Oranye/Logo) */}
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

            {/* Bagian Kanan (Form Login) */}
            <div className="flex flex-col w-full md:w-[60vw] md:h-screen justify-center items-center px-6  md:px-[8vw] gap-6 md:gap-[3vw] relative bg-white">
                
                {/* Judul Form */}
                <div className="flex flex-col text-[#B56225] items-center leading-none gap-2 lg:gap-[0.5vw]">
                    <h1 className="satoshiBold text-4xl lg:text-[4.5vw]">Admin Portal</h1>
                    <p className="satoshiMedium text-lg lg:text-[1.5vw]">Masuk sebagai Administrator</p>
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-md lg:max-w-none flex flex-col gap-4 lg:gap-[1.5vw]">

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 lg:px-[1vw] lg:py-[0.5vw] rounded-md lg:rounded-[0.5vw] satoshiMedium text-sm lg:text-[1vw] text-center">
                            {error}
                        </div>
                    )}

                    {/* Input Email */}
                    <div className="flex flex-col gap-1 lg:gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-base lg:text-[1.2vw]">Email Admin</label>
                        <input
                            type="email"
                            placeholder="Masukkan Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 lg:border-[0.2vw] border-[#D9833E] rounded-xl lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[1vw] text-base lg:text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 lg:focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Input Password */}
                    <div className="flex flex-col gap-1 lg:gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-base lg:text-[1.2vw]">Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 lg:border-[0.2vw] border-[#D9833E] rounded-xl lg:rounded-[0.8vw] px-4 py-3 lg:px-[1.5vw] lg:py-[1vw] text-base lg:text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-2 lg:focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white cursor-pointer satoshiBold text-lg lg:text-[1.5vw] py-3 lg:py-[1vw] rounded-xl lg:rounded-[0.8vw] mt-4 lg:mt-[1vw] transition-colors duration-300 shadow-md
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9833E] hover:bg-[#c27233]'}
                        `}
                    >
                        {isLoading ? "Memproses..." : "Masuk Dashboard Admin"}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default LoginAdmin;