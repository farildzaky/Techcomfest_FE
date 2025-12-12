import React from 'react';
import Image from "next/image";
// Sesuaikan path ini dengan lokasi aset Anda yang sebenarnya
import logoWhite from "@/src/assets/logo-white.png"; 

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col md:flex-row min-h-screen w-full bg-white overflow-x-hidden font-sans">

      {/* --- BAGIAN KIRI (STATIC - DI LAYOUT) --- */}
      {/* Bagian ini akan tetap diam dan tidak reload saat ganti halaman */}
      <div className="relative flex flex-col bg-[#E87E2F] w-full md:w-[40vw] md:h-screen items-center justify-center gap-4 md:gap-[1vw] py-16 md:py-0 shrink-0 overflow-hidden">
          
          {/* --- ORB KIRI ATAS --- */}
          <div 
              className="
              absolute rounded-full z-0 pointer-events-none
              
              /* Posisi & Ukuran Mobile */
              top-[-25%] left-[-25%] w-[100%] pb-[100%] opacity-60
              
              /* Posisi & Ukuran Desktop (md) */
              md:top-[-20%] md:left-[-20%] md:w-[80%] md:pb-[80%] md:opacity-80

              /* Style Gradient & Shadow */
              bg-[radial-gradient(circle_at_left_bottom,_#ffdac2_0%,_transparent_70%)]
              shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
          ></div>

          {/* --- ORB KANAN BAWAH --- */}
          <div 
              className="
              absolute rounded-full z-0 pointer-events-none
              
              /* Posisi & Ukuran Mobile */
              bottom-[-30%] right-[-30%] w-[100%] pb-[100%] opacity-60
              
              /* Posisi & Ukuran Desktop (md) */
              md:bottom-[-30%] md:right-[-30%] md:w-[90%] md:pb-[90%] md:opacity-80

              /* Style Gradient & Shadow */
              bg-[radial-gradient(circle_at_right_top,_#ffdac2_0%,_transparent_70%)]
              shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          ></div>

          {/* --- KONTEN LOGO & TEKS --- */}
          <div className="relative z-10 flex flex-col items-center gap-4 md:gap-[1vw]">
              <Image 
                  src={logoWhite} 
                  alt="logo" 
                  className="w-24 md:w-[15vw] h-auto object-contain drop-shadow-sm" 
                  priority // Tambahkan priority agar logo dimuat duluan
              />
              <h1 className="satoshiBold text-2xl md:text-[3.5vw] text-white text-center leading-tight px-4 drop-shadow-sm">
                  Peduli Gizi, <br />Peduli Inklusi
              </h1>
          </div>

      </div>

      {/* --- BAGIAN KANAN (DYNAMIC CHILDREN) --- */}
      {/* Halaman Login/Register akan dirender di sini */}
      <div className="flex-1 bg-white flex flex-col justify-center relative">
          {children}
      </div>

    </section>
  );
}