'use client'
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BASE_URL } from "@/src/lib/api"; // Pastikan path ini sesuai
import logoWhite from "../../../assets/logo-white.png"; // Sesuaikan path asset

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            // Sesuai endpoint di screenshot image_6e5afe.jpg
            const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mengirim permintaan.");
            }

            setMessage("Link reset password telah dikirim ke email Anda.");
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex flex-row h-screen w-full bg-white relative">
            {/* Sisi Kiri (Oranye) */}
            <div className="flex flex-col bg-[#E87E2F] w-[40vw] h-full items-center gap-[1vw] justify-center relative">
                <Image src={logoWhite} alt="logo" className="w-[15vw]" />
                <h1 className="satoshiBold text-[3.5vw] text-white text-center leading-tight">Peduli Gizi, <br />Peduli Inklusi</h1>
            </div>

            {/* Sisi Kanan (Form) */}
            <div className="flex flex-col w-[60vw] h-full justify-center items-center px-[8vw] gap-[3vw] z-10 relative">
                
                {/* Tombol Back */}
                <Link href="/login" className="hover:scale-105 transition-transform left-[1vw] top-[1vw] absolute cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-[3vw] h-[3vw] text-black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>

                <div className="flex flex-col text-[#B56225] items-center leading-none gap-[0.5vw]">
                    <h1 className="satoshiBold text-[4.5vw]">Lupa Password</h1>
                    <p className="satoshiMedium text-[1.5vw]">Masukkan email untuk reset password</p>
                </div>

                <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-[1.5vw]">
                    
                    {/* Pesan Sukses */}
                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-[1vw] py-[0.5vw] rounded-[0.5vw] satoshiMedium text-[1vw] text-center">
                            {message}
                        </div>
                    )}

                    {/* Pesan Error */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-[1vw] py-[0.5vw] rounded-[0.5vw] satoshiMedium text-[1vw] text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-[1.2vw]">Email</label>
                        <input
                            type="email"
                            placeholder="Masukkan Email Anda"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-[0.2vw] border-[#D9833E] rounded-[0.8vw] px-[1.5vw] py-[1vw] text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full cursor-pointer text-white satoshiBold text-[1.5vw] py-[1vw] rounded-[0.8vw] mt-[1vw] transition-colors duration-300 shadow-md
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D9833E] hover:bg-[#c27233]'}
                        `}
                    >
                        {isLoading ? "Mengirim..." : "Kirim Link Reset"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ForgotPassword;