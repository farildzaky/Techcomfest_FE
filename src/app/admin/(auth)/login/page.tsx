'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_URL } from "@/src/lib/api";

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
        <section className="flex flex-row h-screen w-full bg-white">
            <div className="flex flex-col bg-[#E87E2F] w-[40vw] h-full"></div>

            <div className="flex flex-col w-[60vw] h-full justify-center items-center px-[8vw] gap-[3vw]">
                <div className="flex flex-col text-[#B56225] items-center leading-none gap-[0.5vw]">
                    <h1 className="satoshiBold text-[4.5vw]">Admin Portal</h1>
                    <p className="satoshiMedium text-[1.5vw]">Masuk sebagai Administrator</p>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-[1.5vw]">

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-[1vw] py-[0.5vw] rounded-[0.5vw] satoshiMedium text-[1vw] text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-[1.2vw]">Email Admin</label>
                        <input
                            type="email"
                            placeholder="contoh: admininkluzi@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-[0.2vw] border-[#D9833E] rounded-[0.8vw] px-[1.5vw] py-[1vw] text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <label className="satoshiMedium text-[#D9833E] text-[1.2vw]">Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-[0.2vw] border-[#D9833E] rounded-[0.8vw] px-[1.5vw] py-[1vw] text-[1.2vw] text-[#B56225] placeholder:text-gray-400 focus:outline-none focus:ring-[0.2vw] focus:ring-[#E87E2F]"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white cursor-pointer satoshiBold text-[1.5vw] py-[1vw] rounded-[0.8vw] mt-[1vw] transition-colors duration-300 shadow-md
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