import Image from "next/image";
import Link from "next/link"; // Gunakan Link untuk navigasi internal
import logoWhite from "../../assets/logo-white.png";

const Footer = () => {
    return (
        <footer className="bg-[#E87E2F] w-full text-white font-sans">

            {/* --- Bagian Utama (Atas) --- */}
            <div className="px-6 py-12 lg:px-16 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* 1. KOLOM KIRI (Logo & Slogan) */}
                    <div className="flex flex-col items-center lg:w-1/4 gap-6">
                        <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                            <Image
                                src={logoWhite}
                                alt="Logo Inkluzi"
                                fill
                                sizes="(max-width: 1024px) 128px, 160px"
                                className="object-contain"
                            />
                        </div>
                        {/* Slogan */}
                        <h1 className="satoshiBold text-2xl lg:text-3xl text-center leading-tight">
                            Peduli Gizi<br />Peduli Inklusi
                        </h1>
                    </div>

                    {/* 2. KOLOM KANAN (Konten) */}
                    <div className="flex flex-col lg:w-3/4 gap-10">

                        {/* Baris 1: Tentang Kami */}
                        <div className="flex flex-col gap-3">
                            <h3 className="satoshiBold text-xl lg:text-2xl">Tentang Kami</h3>
                            <p className="satoshiRegular text-base lg:text-lg opacity-90 leading-relaxed max-w-3xl">
                                Memastikan setiap menu MBG aman, inklusif, dan sesuai kebutuhan anak di sekolah dengan dukungan AI.
                            </p>
                        </div>

                        {/* Baris 2: Grid Link (Menu, Sekolah, SPPG) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-4">


                            {/* Sekolah */}
                            <div className="flex flex-col gap-4">
                                <h3 className="satoshiBold text-xl lg:text-2xl">Sekolah</h3>
                                <ul className="flex flex-col gap-2 satoshiRegular text-base lg:text-lg opacity-90">
                                    <li><Link href="#" className="hover:underline">Validasi Menu</Link></li>
                                    <li><Link href="#" className="hover:underline">Scan Nutrisi</Link></li>
                                    <li><Link href="#" className="hover:underline">Pelaporan</Link></li>
                                    <li><Link href="#" className="hover:underline">Rekap Menu</Link></li>
                                </ul>
                            </div>

                            {/* SPPG */}
                            <div className="flex flex-col gap-4">
                                <h3 className="satoshiBold text-xl lg:text-2xl">SPPG</h3>
                                <ul className="flex flex-col gap-2 satoshiRegular text-base lg:text-lg opacity-90">
                                    <li><Link href="#" className="hover:underline">Terima Laporan</Link></li>
                                    <li><Link href="#" className="hover:underline">Kirim Menu Mingguan</Link></li>
                                    <li><Link href="#" className="hover:underline">Rekap Wilayah</Link></li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* --- Bagian Bawah (Copyright & Legal) --- */}
            <div className="border-t-2 border-white/30 px-6 py-6 lg:px-16">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm lg:text-base satoshiRegular opacity-90 text-center md:text-left">
                    <p>© Copyright. Semua hak dilindungi.</p>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                        <Link href="#" className="hover:text-white/100 hover:underline transition-colors">Kebijakan Privasi</Link>
                        <Link href="#" className="hover:text-white/100 hover:underline transition-colors">Syarat & Ketentuan</Link>
                        <Link href="#" className="hover:text-white/100 hover:underline transition-colors">Keamanan Data</Link>
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default Footer;