'use client'
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import SidebarProfile from "@/src/components/common/profile/SidebarProfile"; // Sidebar Profile untuk SPPG

interface DetailData {
    namaInstansi: string;
    wilayahKerja: string;
    alamat: string;
    email: string;
    penanggungJawab: string;
    nomorKontak: string;
}


const SppgDetailInformasiPage = () => {
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const userId = pathSegments[3] || ''; 

    const [data, setData] = useState<DetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError("ID pengguna tidak ditemukan di URL.");
            return;
        }

        const loadData = async () => {
            try {
                const response = await fetchWithAuth(`/admin/users/${userId}`, {
                    method: "GET"
                });
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Gagal memuat detail SPPG.");
                }

                const profile = result.data.profile_data;
                
                // Mapping data
                setData({
                    namaInstansi: profile.nama_instansi || 'N/A',
                    wilayahKerja: profile.wilayah_kerja || 'N/A',
                    alamat: profile.alamat || 'N/A',
                    email: result.data.email || 'N/A', 
                    penanggungJawab: profile.penanggung_jawab || 'N/A',
                    nomorKontak: profile.nomor_kontak || 'N/A',
                });

            } catch (err: any) {
                setError(err.message || "Terjadi kesalahan saat mengambil data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    if (loading) {
        return (
            <div className="grid grid-cols-9 min-h-screen bg-white w-full">
                <div className="col-span-3"></div> 
                <div className="col-span-6 flex justify-center items-center h-screen text-[#D9833E] satoshiBold text-[1.5vw]">
                    Memuat Detail Informasi...
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="grid grid-cols-9 min-h-screen bg-white w-full">
                <div className="col-span-3"></div> 
                <div className="col-span-6 flex justify-center items-center h-screen text-red-500 satoshiBold text-[1.5vw]">
                    Error: {error}
                </div>
            </div>
        );
    }
    
    const DataField = ({ label, value }: { label: string, value: string }) => (
        <div className="flex flex-col gap-[0.5vw]">
            <label className="satoshiBold text-[1.2vw] text-white opacity-90">{label}</label>
            <div className="w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] bg-white/90 cursor-default">
                {value}
            </div>
        </div>
    );


    return (
         <div className="grid grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            <div className="col-span-3 sticky top-0 h-screen z-50">
                <SidebarProfile/>
            </div>

            <div className="col-span-6 overflow-y-auto h-screen ">
                <div className="p-[3vw] flex flex-col gap-[2vw]">
                    <h1 className="satoshiBold text-[2.5vw] text-white leading-tight">
                        Detail Informasi Instansi
                    </h1>
                    
                    <div className="flex flex-col gap-[1.5vw] w-[80%]">
                        <DataField label="Nama Instansi" value={data?.namaInstansi || ''} />
                        <DataField label="Wilayah Kerja" value={data?.wilayahKerja || ''} />
                        <DataField label="Alamat" value={data?.alamat || ''} />
                        <DataField label="Email" value={data?.email || ''} />
                        <DataField label="Penanggung Jawab" value={data?.penanggungJawab || ''} />
                        <DataField label="Nomor Kontak" value={data?.nomorKontak || ''} />
                    </div>

                </div>
            </div>

        </div>
    )
}
export default SppgDetailInformasiPage;