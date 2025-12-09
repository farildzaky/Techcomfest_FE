import Link from "next/link";

const Register = () => {
    return (
        <section className="flex flex-row h-screen w-full bg-white">

            <div className="flex flex-col bg-[#D9833E] w-[40vw] h-full items-center justify-center gap-[10vw] text-white">
                <h1 className="satoshiBold text-[3vw]">Logo</h1>
                <h2 className="satoshiBold text-[2.5vw]">Tagline</h2>
            </div>

            <div className="flex flex-col w-[60vw] h-full items-center justify-center relative px-[8vw] gap-[3vw]">

                <div className="flex flex-col text-[#B56225] items-center leading-none gap-[0.5vw]">
                    <h1 className="satoshiBold text-[4.5vw]">Daftar</h1>
                    <p className="satoshiMedium text-[1.5vw]">Daftar untuk Bergabung!</p>
                </div>

                <div className="w-full flex flex-col gap-[2vw]">
                    <p className="text-black satoshiMedium text-[1.2vw]">Pilih sesuai peran Anda</p>

                    <div className="flex flex-col gap-[0.5vw]">
                        <Link href="/register/sekolah" className="w-full">
                            <button className="w-full bg-[#D9833E] text-white satoshiBold text-[1.5vw] py-[1vw] rounded-[1vw] hover:bg-[#c27233] transition-colors shadow-md">
                                Masuk sebagai Sekolah
                            </button>
                        </Link>
                        <p className="text-black satoshiMedium text-[1vw] text-center">
                            Untuk mengelola menu MBG, analisis gizi, & pelaporan.
                        </p>
                    </div>

                    <div className="flex flex-col gap-[0.5vw]">
                        <Link href="/register/sppg" className="w-full">
                            <button className="w-full bg-[#D9833E] text-white satoshiBold text-[1.5vw] py-[1vw] rounded-[1vw] hover:bg-[#c27233] transition-colors shadow-md">
                                Masuk sebagai SPPG
                            </button>
                        </Link>
                        <p className="text-black satoshiMedium text-[1vw] text-center">
                            Untuk menerima laporan & mengirim menu mingguan.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-[4vw]">
                    <p className="satoshiMedium text-[#D9833E] text-[1.1vw]">
                        Sudah punya akun? <Link href="/login" className="satoshiBold underline cursor-pointer hover:text-[#B56225]">Masuk</Link>
                    </p>
                </div>

            </div>
        </section>
    )
}

export default Register;