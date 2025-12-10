'use client'
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import SidebarProfile from "@/src/components/common/profile/SidebarProfile"; 

interface DetailData {
    namaSekolah: string;
    jenisSekolah: string;
    npsn: string;
    alamat: string;
    email: string;
    disabilities: { jenis: string, jumlah: number }[];
    jumlahTotalSiswa: string;
}

const SekolahDetailInformasiPage = () => {
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
                    throw new Error(result.message || "Gagal memuat detail Sekolah.");
                }

                const profile = result.data.profile_data;
                const userEmail = result.data.email || 'N/A';
                
                const mappedDisabilities = (profile.disability_types || []).map((d: any) => ({
                    jenis: d.jenis_disabilitas,
                    jumlah: d.jumlah_siswa
                }));

                setData({
                    namaSekolah: profile.nama_sekolah || 'N/A',
                    jenisSekolah: profile.jenis_sekolah || 'N/A',
                    npsn: profile.npsn || 'N/A',
                    alamat: profile.alamat || 'N/A',
                    email: userEmail, 
                    disabilities: mappedDisabilities,
                    jumlahTotalSiswa: profile.total_siswa || 'N/A', 
                });

            } catch (err: any) {
                setError(err.message || "Terjadi kesalahan saat mengambil data.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const DataField = ({ label, value }: { label: string, value: string }) => (
        <div className="flex flex-col gap-[0.5vw]">
            <label className="satoshiBold text-[1.2vw] text-white opacity-90">{label}</label>
            <div className="w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] bg-white/90 cursor-default">
                {value}
            </div>
        </div>
    );
    
    const DisabilityField = ({ disabilitasList }: { disabilitasList: { jenis: string, jumlah: number }[] }) => (
        <div className="flex flex-col gap-[0.5vw] mt-[0.5vw]">
            <label className="satoshiBold text-[1.2vw] text-white opacity-90">Detail Jenis Disabilitas Dominan</label>
            <div className="flex flex-col gap-[0.8vw]">
                {disabilitasList.map((item, index) => (
                    <div key={index} className="flex flex-row gap-[1vw] items-center w-full">
                        <div className="w-[70%] rounded-[0.6vw] px-[1vw] py-[0.8vw] text-[1vw] text-[#B56225] bg-white/90">
                            {item.jenis}
                        </div>
                        <div className="w-[30%] rounded-[0.6vw] px-[1vw] py-[0.8vw] text-[1vw] text-[#B56225] bg-white/90 text-center">
                            {item.jumlah} Siswa
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid grid-cols-9 min-h-screen bg-white w-full">
                <div className="col-span-3"></div> 
                <div className="col-span-6 flex justify-center items-center h-screen text-[#D9833E] satoshiBold text-[1.5vw]">
                    Memuat Detail Informasi Sekolah...
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
    

    return (
         <div className="grid grid-cols-9 min-h-screen bg-[#E87E2F] w-full">
            
            <div className="col-span-3 sticky top-0 h-screen z-50">
                <SidebarProfile/>
            </div>

            <div className="col-span-6 overflow-y-auto h-screen bg-[#E87E2F]">
                <div className="p-[3vw] flex flex-col gap-[2vw]">
                    <h1 className="satoshiBold text-[2.5vw] text-white leading-tight">
                        Informasi Sekolah
                    </h1>
                    
                    <div className="flex flex-col gap-[1.5vw] w-[80%]">
                        <DataField label="Nama Sekolah" value={data?.namaSekolah || ''} />
                        <DataField label="Jenis Sekolah" value={data?.jenisSekolah || ''} />
                        <DataField label="NPSN" value={data?.npsn || ''} />
                        <DataField label="Alamat" value={data?.alamat || ''} />
                        <DataField label="Email" value={data?.email || ''} />
                        
                        {data && data.disabilities.length > 0 && (
                            <DisabilityField disabilitasList={data.disabilities} />
                        )}

                        <div className="flex flex-col gap-[0.5vw] mt-[1.5vw]">
                            <label className="satoshiBold text-[1.2vw] text-white opacity-90">Jumlah Total Siswa</label>
                            <div className="w-full rounded-[0.8vw] px-[1.5vw] py-[0.8vw] satoshiMedium text-[1.1vw] text-[#B56225] bg-white/90 cursor-default">
                                {data?.jumlahTotalSiswa} Siswa
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    )
}
export default SekolahDetailInformasiPage;