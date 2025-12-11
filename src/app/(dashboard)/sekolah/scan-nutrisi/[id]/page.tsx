'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import warning from '../../../../../assets/dashboard/sekolah/warning-orange.png'; 

interface ScanResultData {
    image_url: string;
    cloudinary_public_id: string;
    nama_makanan: string;
    komponen_menu: { nama: string; porsi: string }[];
    kandungan_gizi: {
        kalori_total: number;
        karbohidrat: number;
        protein: number;
        lemak: number;
        gula: number;
        serat: number;
        sodium: number;
    };
    deteksi_risiko: {
        nutrisi: string[];
        pencernaan: string[];
        alergi: string[];
        porsi: string[];
    };
    rekomendasi: string;
    ml_confidence?: number;
    id?: string;
}

const HasilDeteksiSkeleton = () => {
    return (
        <div className="w-full min-h-screen bg-[#E87E2F] py-[6vw] lg:py-[2vw] flex flex-col gap-[6vw] lg:gap-[2vw] animate-pulse">
            
            {/* Title Skeleton */}
            <div className='w-[70vw] lg:w-[30vw] h-[12vw] lg:h-[6vw] bg-[#FFF3EB] rounded-r-[6vw] lg:rounded-r-[3vw] -ml-[3vw] mb-[2vw] shadow-md'></div>
            
            {/* Main Content Skeleton */}
            <div className='w-full px-[5vw] lg:px-[3vw] flex flex-col lg:grid lg:grid-cols-7 gap-[6vw] lg:gap-[1vw]'>
                {/* Image Placeholder */}
                <div className='w-full lg:col-span-3 h-[60vw] lg:h-[25vw] bg-white/30 rounded-[3vw] lg:rounded-[1vw]'></div>

                {/* Form Placeholder */}
                <div className='w-full lg:col-span-4 flex flex-col gap-[3vw] lg:gap-[1vw]'>
                    <div>
                        <div className='h-[4vw] lg:h-[1.5vw] w-[40%] lg:w-[20%] bg-white/50 rounded mb-[1vw] lg:mb-[0.5vw]'></div>
                        <div className='w-full h-[10vw] lg:h-[3.5vw] bg-white rounded-[2vw] lg:rounded-[0.8vw]'></div>
                    </div>

                    <div className='flex flex-col gap-[2vw] lg:gap-[0.8vw] mt-[2vw] lg:mt-[1vw]'>
                        <div className='h-[4vw] lg:h-[1.5vw] w-[50%] lg:w-[30%] bg-white/50 rounded mb-[1vw] lg:mb-[0.5vw]'></div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='flex gap-[2vw] lg:gap-[1vw]'>
                                <div className='flex-1 h-[10vw] lg:h-[3vw] bg-white rounded-[2vw] lg:rounded-[0.8vw]'></div>
                                <div className='w-[25%] h-[10vw] lg:h-[3vw] bg-white rounded-[2vw] lg:rounded-[0.8vw]'></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Content Skeleton */}
            <div className='flex flex-col lg:grid lg:grid-cols-5 gap-[6vw] lg:gap-[2vw] px-[5vw] lg:px-[3vw] w-full'>
                <div className='lg:col-span-2 flex flex-col gap-[3vw] lg:gap-[1vw]'>
                    <div className='h-[6vw] lg:h-[2.5vw] w-[60%] bg-white/50 rounded'></div>
                    <div className='w-full rounded-[2vw] lg:rounded-[1vw] overflow-hidden border-[0.5vw] lg:border-[0.15vw] border-white/20 bg-white shadow-md'>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className='h-[8vw] lg:h-[3vw] border-b border-gray-200'></div>
                        ))}
                    </div>
                </div>

                <div className='lg:col-span-3 flex flex-col gap-[3vw] lg:gap-[1vw]'>
                    <div className='h-[6vw] lg:h-[2.5vw] w-[40%] bg-white/50 rounded'></div>
                    <div className='bg-white rounded-[2vw] lg:rounded-[1vw] shadow-md h-[50vw] lg:h-[25vw]'></div>
                    <div className='w-full h-[12vw] lg:h-[4vw] bg-white rounded-[2vw] lg:rounded-[1vw] shadow-md'></div>
                </div>
            </div>

            {/* Buttons Skeleton */}
            <div className='flex flex-col-reverse lg:flex-row justify-between px-[5vw] lg:px-[3vw] items-center mt-[4vw] lg:mt-[2vw] gap-[4vw] lg:gap-0'>
                <div className='h-[8vw] lg:h-[2.5vw] w-[40vw] lg:w-[15vw] bg-white/20 rounded-full'></div>
                <div className='flex gap-[3vw] lg:gap-[1.5vw] ml-auto w-full lg:w-auto justify-end'>
                    <div className='h-[12vw] lg:h-[4vw] w-full lg:w-[12vw] bg-[#FFF3EB] rounded-[6vw] lg:rounded-[2vw]'></div>
                    <div className='h-[12vw] lg:h-[4vw] w-full lg:w-[12vw] bg-[#FFF3EB] rounded-[6vw] lg:rounded-[2vw]'></div>
                </div>
            </div>
        </div>
    );
};

const HasilDeteksiPage = () => {
    const router = useRouter();
    const params = useParams(); 
    const scanId = params?.id as string | undefined;

    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [isHistoryView, setIsHistoryView] = useState(false); 
    
    const [menuData, setMenuData] = useState({
        namaMakanan: "",
        komponen: [] as { nama: string, berat: string }[],
        gizi: [] as { label: string, value: string, rawValue: number, unit: string }[],
        risiko: {
            alergi: [] as string[],
            tekstur: [] as string[], 
            porsi: [] as string[]
        },
        rekomendasi: "",
        confidence: 0 
    });

    const [rawData, setRawData] = useState<ScanResultData | null>(null);

   useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (scanId && scanId !== 'new') {
                setIsHistoryView(true);
                try {
                    const response = await fetchWithAuth(`/school/food-scans/${scanId}`, { method: 'GET' });
                    if (!response.ok) throw new Error("Gagal mengambil detail scan");
                    const result = await response.json();
                    const data = result.data;

                    setRawData(data);
                    setImageSrc(data.image_url);
                    setMenuData({
                        namaMakanan: data.nama_makanan,
                        komponen: data.komponen_menu ? data.komponen_menu.map((k: any) => ({ nama: k.nama, berat: k.porsi })) : [],
                        gizi: [
                            { label: "Kalori Total", value: `${data.kandungan_gizi?.kalori_total || 0} kkal`, rawValue: data.kandungan_gizi?.kalori_total || 0, unit: "kkal" },
                            { label: "Karbohidrat", value: `${data.kandungan_gizi?.karbohidrat || 0} g`, rawValue: data.kandungan_gizi?.karbohidrat || 0, unit: "g" },
                            { label: "Protein", value: `${data.kandungan_gizi?.protein || 0} g`, rawValue: data.kandungan_gizi?.protein || 0, unit: "g" },
                            { label: "Lemak", value: `${data.kandungan_gizi?.lemak || 0} g`, rawValue: data.kandungan_gizi?.lemak || 0, unit: "g" },
                            { label: "Gula", value: `${data.kandungan_gizi?.gula || 0} g`, rawValue: data.kandungan_gizi?.gula || 0, unit: "g" },
                            { label: "Serat", value: `${data.kandungan_gizi?.serat || 0} g`, rawValue: data.kandungan_gizi?.serat || 0, unit: "g" },
                            { label: "Sodium", value: `${data.kandungan_gizi?.sodium || 0} mg`, rawValue: data.kandungan_gizi?.sodium || 0, unit: "mg" },
                        ],
                        risiko: {
                            alergi: data.deteksi_risiko?.alergi || [],
                            tekstur: data.deteksi_risiko?.pencernaan || [],
                            porsi: data.deteksi_risiko?.porsi || []
                        },
                        rekomendasi: data.rekomendasi || "",
                        confidence: data.ml_confidence || 0
                    });

                } catch (error) {
                    console.error("Error fetching detail:", error);
                    alert("Gagal memuat data riwayat.");
                } finally {
                    setLoading(false);
                }
            } else {
                setIsHistoryView(false);
                const storedResult = localStorage.getItem('scan_result_temp');
                if (storedResult) {
                    const parsedData: ScanResultData = JSON.parse(storedResult);
                    setRawData(parsedData);
                    setImageSrc(parsedData.image_url);
                    setMenuData({
                        namaMakanan: parsedData.nama_makanan,
                        komponen: parsedData.komponen_menu.map(k => ({ nama: k.nama, berat: k.porsi })),
                        gizi: [
                            { label: "Kalori Total", value: `${parsedData.kandungan_gizi.kalori_total} kkal`, rawValue: parsedData.kandungan_gizi.kalori_total, unit: "kkal" },
                            { label: "Karbohidrat", value: `${parsedData.kandungan_gizi.karbohidrat} g`, rawValue: parsedData.kandungan_gizi.karbohidrat, unit: "g" },
                            { label: "Protein", value: `${parsedData.kandungan_gizi.protein} g`, rawValue: parsedData.kandungan_gizi.protein, unit: "g" },
                            { label: "Lemak", value: `${parsedData.kandungan_gizi.lemak} g`, rawValue: parsedData.kandungan_gizi.lemak, unit: "g" },
                            { label: "Gula", value: `${parsedData.kandungan_gizi.gula} g`, rawValue: parsedData.kandungan_gizi.gula, unit: "g" },
                            { label: "Serat", value: `${parsedData.kandungan_gizi.serat} g`, rawValue: parsedData.kandungan_gizi.serat, unit: "g" },
                            { label: "Sodium", value: `${parsedData.kandungan_gizi.sodium} mg`, rawValue: parsedData.kandungan_gizi.sodium, unit: "mg" },
                        ],
                        risiko: {
                            alergi: parsedData.deteksi_risiko.alergi || [],
                            tekstur: parsedData.deteksi_risiko.pencernaan || [], 
                            porsi: parsedData.deteksi_risiko.porsi || []
                        },
                        rekomendasi: parsedData.rekomendasi,
                        confidence: parsedData.ml_confidence || 0
                    });
                }
                setLoading(false);
            }
        };
        loadData();
    }, [scanId]); 

    const handleKomponenChange = (index: number, field: 'nama' | 'berat', value: string) => {
        const newKomponen = [...menuData.komponen];
        if (field === 'nama') newKomponen[index].nama = value;
        else newKomponen[index].berat = value; 
        setMenuData(prev => ({ ...prev, komponen: newKomponen }));
    };

    const handleSimpanHasil = async () => {
        if (!rawData) return alert("Data tidak ditemukan.");
        try {
            const payload = {
                image_url: rawData.image_url,
                cloudinary_public_id: rawData.cloudinary_public_id,
                nama_makanan: menuData.namaMakanan,
                komponen_menu: menuData.komponen.map(k => ({
                    nama: k.nama,
                    porsi: k.berat
                })),
                kandungan_gizi: menuData.gizi.reduce((acc, curr) => {
                    const key = curr.label.toLowerCase().replace(' ', '_');
                    if (key === 'kalori_total') acc.kalori_total = curr.rawValue;
                    else acc[key as keyof typeof acc] = curr.rawValue;
                    return acc;
                }, {} as any),
                deteksi_risiko: {
                    alergi: menuData.risiko.alergi,
                    pencernaan: menuData.risiko.tekstur, 
                    porsi: menuData.risiko.porsi,
                    nutrisi: rawData.deteksi_risiko?.nutrisi || []
                },
                rekomendasi: menuData.rekomendasi,
                ml_confidence: rawData.ml_confidence || 0
            };

            const response = await fetchWithAuth("/school/food-scans/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.message || "Gagal menyimpan hasil scan.");
            }

            localStorage.removeItem('scan_result_temp');
            localStorage.removeItem('dummy_scan_image');
            alert("Hasil scan berhasil disimpan!");
            router.push('/sekolah/riwayat-scan'); 
        } catch (error: any) {
            console.error("Save Error:", error);
            alert(`Gagal menyimpan: ${error.message}`);
        }
    };

    if (loading) return <HasilDeteksiSkeleton />;

    return (
        <div className="w-full min-h-screen bg-[#E87E2F] py-[6vw] lg:py-[2vw] flex flex-col gap-[6vw] lg:gap-[2vw]">
            
            {/* Header / Title */}
            <div className='w-full lg:w-fit bg-[#FFF3EB] rounded-r-[5vw] lg:rounded-r-[3vw] py-[3vw] lg:py-[1.5vw] px-[6vw] lg:px-[4vw] -ml-[3vw] mb-[2vw] shadow-md'>
                <h1 className='satoshiBold text-[5vw] lg:text-[3vw] text-[#E87E2F]'>
                    {isHistoryView ? "Detail Riwayat Makanan" : "Hasil Deteksi Makanan"}
                </h1>
            </div>            
            
            {/* Main Content Grid */}
            <div className='w-full px-[5vw] lg:px-[3vw] flex flex-col lg:grid lg:grid-cols-7 gap-[6vw] lg:gap-[1vw]'>
                
                {/* Image Section */}
                <div className='lg:col-span-3 border-[1vw] lg:border-5 border-white rounded-[3vw] lg:rounded-[1vw] flex flex-col items-center p-[2vw] lg:p-[1vw] justify-center shadow-sm'>
                    {imageSrc ? (
                        <img src={imageSrc} alt="Uploaded Food" className='w-full h-auto lg:h-full max-h-[60vh] rounded-[2vw] lg:rounded-[1vw] object-cover'/>
                    ) : (
                        <div className='w-full h-[50vw] lg:h-[20vw] bg-gray-200 flex items-center justify-center rounded-[2vw] lg:rounded-[1vw]'>
                            <p className='satoshiMedium text-[4vw] lg:text-[1.5vw] text-gray-500'>Tidak ada gambar</p>
                        </div>
                    )}
                </div>

                {/* Form Section */}
                <div className='lg:col-span-4 flex flex-col gap-[4vw] lg:gap-[1vw]'>
                    {/* Nama Makanan */}
                    <div>
                        <label className='block text-white satoshiBold text-[4vw] lg:text-[1.2vw] mb-[1.5vw] lg:mb-[0.5vw]'>Nama Makanan</label>
                        <input
                            type="text"
                            value={menuData.namaMakanan}
                            onChange={(e) => setMenuData(prev => ({ ...prev, namaMakanan: e.target.value }))}
                            readOnly={!isEditing}
                            className={`w-full bg-white rounded-[2vw] lg:rounded-[0.8vw] px-[3vw] lg:px-[1.5vw] py-[2vw] lg:py-[0.8vw] text-[3.5vw] lg:text-[1.1vw] text-[#E87E2F] satoshiBold outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' : 'border-transparent'}`}
                        />
                    </div>

                    {/* Komponen Menu */}
                    <div className='flex flex-col'>
                        <div className='flex justify-between items-end mb-[1.5vw] lg:mb-[0.5vw]'>
                            <label className='text-white satoshiBold text-[4vw] lg:text-[1.2vw]'>Komponen Menu</label>
                        </div>
                        <div className='flex flex-col gap-[2vw] lg:gap-[0.8vw]'>
                            {menuData.komponen.map((comp, idx) => (
                                <div key={idx} className='flex gap-[2vw] lg:gap-[1vw]'>
                                    <input
                                        type="text"
                                        value={comp.nama}
                                        onChange={(e) => handleKomponenChange(idx, 'nama', e.target.value)}
                                        readOnly={!isEditing}
                                        className={`flex-1 bg-white rounded-[2vw] lg:rounded-[0.8vw] px-[3vw] lg:px-[1.5vw] py-[2vw] lg:py-[0.6vw] text-[3.5vw] lg:text-[1.1vw] text-[#E87E2F] satoshiBold outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400' : 'border-transparent'}`}
                                    />
                                    <input
                                        type="text"
                                        value={comp.berat}
                                        onChange={(e) => handleKomponenChange(idx, 'berat', e.target.value)}
                                        readOnly={!isEditing}
                                        className={`w-[25%] bg-white rounded-[2vw] lg:rounded-[0.8vw] px-[2vw] lg:px-[1vw] py-[2vw] lg:py-[0.6vw] text-[3.5vw] lg:text-[1.1vw] text-[#E87E2F] satoshiBold text-center outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400' : 'border-transparent'}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {!isHistoryView && !isEditing && (
                            <p onClick={() => setIsEditing(true)} className='text-white italic text-[3vw] lg:text-[1vw] hover:underline cursor-pointer opacity-90 flex ml-auto flex-row mt-[2vw] lg:mt-[0.5vw]'>
                                Edit Menu
                            </p>
                        )}
                        {!isHistoryView && isEditing && (
                            <p className='text-white italic text-[3vw] lg:text-[1vw] opacity-90 flex ml-auto flex-row mt-[2vw] lg:mt-[0.5vw]'>
                                Sedang Mengedit...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section (Nutrition & Risks) */}
            <div className='flex flex-col lg:grid lg:grid-cols-5 gap-[6vw] lg:gap-[2vw] px-[5vw] lg:px-[3vw] w-full'>
                
                {/* Tabel Gizi */}
                <div className='lg:col-span-2 flex flex-col gap-[3vw] lg:gap-[1vw]'>
                    <h1 className='satoshiBold text-[4.5vw] lg:text-[2vw] text-white'>Kandungan Gizi</h1>
                    <div className='w-full rounded-[2vw] lg:rounded-[1vw] overflow-hidden border-[0.5vw] lg:border-[0.15vw] border-[#E87E2F] shadow-md'>
                        <div className='flex bg-[#FFF3EB] text-[#E87E2F] h-[10vw] lg:h-[3vw] items-center flex'>
                            <div className='w-[60%] pl-[3vw] lg:pl-[1.5vw] satoshiBold text-[3.5vw] lg:text-[1.2vw]'>Komponen</div>
                            <div className='w-[0.5%] lg:w-[0.3%] h-full bg-[#E87E2F]'></div>
                            <div className='w-[40%] pl-[3vw] lg:pl-[1.5vw] satoshiBold text-[3.5vw] lg:text-[1.2vw]'>Jumlah</div>
                        </div>
                        <div className='bg-white'>
                            {menuData.gizi.map((item, index) => (
                                <div key={index} className='flex border-b-[0.2vw] lg:border-b-[0.1vw] border-[#E87E2F] last:border-0 h-[10vw] lg:h-[3vw] items-center'>
                                    <div className='w-[60%] pl-[3vw] lg:pl-[1.5vw] satoshiBold text-[3.5vw] lg:text-[1.1vw] text-[#8C4C1D]'>{item.label}</div>
                                    <div className='w-[0.5%] lg:w-[0.3%] h-full bg-[#E87E2F]'></div>
                                    <div className='w-[40%] pl-[3vw] lg:pl-[1.5vw] satoshiMedium text-[3.5vw] lg:text-[1.1vw] text-[#8C4C1D]'>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Deteksi Risiko & Rekomendasi */}
                <div className='lg:col-span-3 flex flex-col gap-[3vw] lg:gap-[1vw]'>
                    <h1 className='satoshiBold text-[4.5vw] lg:text-[2vw] text-white'>Deteksi Risiko</h1>
                    <div className='bg-[#FFFFFF] rounded-[2vw] lg:rounded-[1vw] shadow-md'>
                        <div className='p-[4vw] lg:p-[1.5vw] flex flex-col gap-[4vw] lg:gap-[1vw]'>
                            <div className='flex flex-col gap-[1vw] lg:gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[4vw] lg:text-[1.5vw] text-[#8C4C1D]'>Alergi</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[3.5vw] lg:text-[1.3vw] text-[#8C4C1D] pl-[1vw] lg:pl-[0.5vw]'>
                                    {menuData.risiko.alergi.length > 0 ? menuData.risiko.alergi.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                            <div className='flex flex-col gap-[1vw] lg:gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[4vw] lg:text-[1.5vw] text-[#8C4C1D]'>Tekstur</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[3.5vw] lg:text-[1.3vw] text-[#8C4C1D] pl-[1vw] lg:pl-[0.5vw]'>
                                    {menuData.risiko.tekstur.length > 0 ? menuData.risiko.tekstur.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                            <div className='flex flex-col gap-[1vw] lg:gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[4vw] lg:text-[1.5vw] text-[#8C4C1D]'>Porsi Gizi</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[3.5vw] lg:text-[1.3vw] text-[#8C4C1D] pl-[1vw] lg:pl-[0.5vw]'>
                                    {menuData.risiko.porsi.length > 0 ? menuData.risiko.porsi.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {menuData.rekomendasi && (
                        <div className='flex flex-row items-start lg:items-center gap-[3vw] lg:gap-[1vw] w-full bg-white rounded-[2vw] lg:rounded-[1vw] p-[3vw] lg:p-[1vw] shadow-md'>
                            <Image src={warning} alt="warning icon" className='w-[6vw] h-[6vw] lg:w-[2vw] lg:h-[2vw] flex-shrink-0' />
                            <span className='text-[3.5vw] lg:text-[1.2vw] text-[#8C4C1D] satoshiBold leading-tight'>{menuData.rekomendasi}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className='flex flex-col-reverse lg:flex-row justify-between px-[5vw] lg:px-[3vw] items-center gap-[4vw] lg:gap-0 mt-[2vw]'>
                
                {menuData.confidence > 0 && (
                    <div className="bg-white/20 text-white px-[4vw] lg:px-[1.5vw] py-[2vw] lg:py-[0.5vw] rounded-full satoshiBold text-[3.5vw] lg:text-[1.1vw] flex items-center gap-[1.5vw] lg:gap-[0.5vw] w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[4vw] h-[4vw] lg:w-[1.2vw] lg:h-[1.2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        Akurasi AI: {menuData.confidence}%
                    </div>
                )}

                <div className='flex flex-col lg:flex-row gap-[3vw] lg:gap-[1.5vw] ml-auto w-full lg:w-auto'>
                    {isEditing ? (
                        <button
                            onClick={() => setIsEditing(false)}
                            className='w-full lg:w-auto bg-[#FFF3EB] text-[#8C4C1D] satoshiBold text-[4vw] lg:text-[1.5vw] py-[3vw] lg:py-[0.8vw] px-[6vw] lg:px-[3vw] rounded-[6vw] lg:rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md text-center'
                        >
                            Selesai Edit
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => router.back()}
                                className='w-full lg:w-auto bg-[#FFF3EB] text-[#D7762E] satoshiBold text-[4vw] lg:text-[1.5vw] py-[3vw] lg:py-[0.8vw] px-[6vw] lg:px-[3vw] rounded-[6vw] lg:rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md text-center'
                            >
                                Kembali
                            </button>
                            
                            {!isHistoryView && (
                                <button
                                    onClick={handleSimpanHasil}
                                    className='w-full lg:w-auto bg-[#FFF3EB] text-[#D7762E] satoshiBold text-[4vw] lg:text-[1.5vw] py-[3vw] lg:py-[0.8vw] px-[6vw] lg:px-[3vw] rounded-[6vw] lg:rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md text-center'
                                >
                                    Simpan Hasil
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HasilDeteksiPage;