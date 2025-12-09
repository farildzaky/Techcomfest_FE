'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/src/lib/api'; 
import warning from '../../../../../assets/dashboard/sekolah/warning-orange.png'; // Pastikan path ini sesuai

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

const HasilDeteksiPage = () => {
    const router = useRouter();
    const params = useParams(); 
    // Mengambil ID dari URL jika ada (contoh: /sekolah/scan-nutrisi/123)
    const scanId = params?.id as string | undefined;

    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [isHistoryView, setIsHistoryView] = useState(false); // State untuk menandai mode riwayat
    
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

            // KASUS 1: Jika ada ID di URL, ambil dari API (Mode Riwayat)
            if (scanId) {
                setIsHistoryView(true);
                try {
                    const response = await fetchWithAuth(`/school/food-scans/${scanId}`, {
                        method: 'GET'
                    });

                    if (!response.ok) throw new Error("Gagal mengambil detail scan");

                    const result = await response.json();
                    const data = result.data; // Asumsi response data strukturnya mirip dengan payload save

                    setRawData(data);
                    setImageSrc(data.image_url);
                    
                    // Mapping data dari API ke State UI
                    // Note: Pastikan API mengembalikan struktur kandungan_gizi yang sesuai
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
                            tekstur: data.deteksi_risiko?.pencernaan || [], // Mapping pencernaan ke tekstur sesuai UI sebelumnya
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
            } 
            // KASUS 2: Jika TIDAK ada ID, ambil dari LocalStorage (Mode Scan Baru)
            else {
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

    if (loading) return <div className="min-h-screen bg-[#E87E2F] flex items-center justify-center text-white satoshiBold text-[2vw]">Memuat Data...</div>;

    return (
        <div className="w-full min-h-screen bg-[#E87E2F] py-[2vw] flex flex-col gap-[2vw]">
            
            <div className='w-fit bg-[#FFF3EB] rounded-r-[3vw] py-[1.5vw] px-[4vw] -ml-[3vw] mb-[3vw] shadow-md'>
                <h1 className='satoshiBold text-[3vw] text-[#E87E2F]'>
                    {isHistoryView ? "Detail Riwayat Makanan" : "Hasil Deteksi Makanan"}
                </h1>
            </div>            
            
            <div className='w-full px-[3vw] grid grid-cols-7 gap-[1vw] '>
                <div className='col-span-3 border-5 border-white rounded-[1vw] flex flex-col items-center p-[1vw] justify-center'>
                    {imageSrc ? (
                        <img src={imageSrc} alt="Uploaded Food" className='w-full h-full rounded-[1vw] object-cover'/>
                    ) : (
                        <div className='w-full h-[20vw] bg-gray-200 flex items-center justify-center rounded-[1vw]'>
                            <p className='satoshiMedium text-[1.5vw] text-gray-500'>Tidak ada gambar</p>
                        </div>
                    )}
                </div>

                <div className='col-span-4 flex flex-col gap-[1vw]'>
                    <div>
                        <label className='block text-white satoshiBold text-[1.2vw] mb-[0.5vw]'>Nama Makanan</label>
                        <input
                            type="text"
                            value={menuData.namaMakanan}
                            onChange={(e) => setMenuData(prev => ({ ...prev, namaMakanan: e.target.value }))}
                            readOnly={!isEditing}
                            className={`w-full bg-white rounded-[0.8vw] px-[1.5vw] py-[0.8vw] text-[1.1vw] text-[#E87E2F] satoshiBold outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400 ring-2 ring-yellow-200' : 'border-transparent'}`}
                        />
                    </div>

                    <div className='flex flex-col'>
                        <div className='flex justify-between items-end mb-[0.5vw]'>
                            <label className='text-white satoshiBold text-[1.2vw]'>Komponen Menu</label>
                        </div>
                        <div className='flex flex-col gap-[0.8vw]'>
                            {menuData.komponen.map((comp, idx) => (
                                <div key={idx} className='flex gap-[1vw]'>
                                    <input
                                        type="text"
                                        value={comp.nama}
                                        onChange={(e) => handleKomponenChange(idx, 'nama', e.target.value)}
                                        readOnly={!isEditing}
                                        className={`flex-1 bg-white rounded-[0.8vw] px-[1.5vw] py-[0.6vw] text-[1.1vw] text-[#E87E2F] satoshiBold outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400' : 'border-transparent'}`}
                                    />
                                    <input
                                        type="text"
                                        value={comp.berat}
                                        onChange={(e) => handleKomponenChange(idx, 'berat', e.target.value)}
                                        readOnly={!isEditing}
                                        className={`w-[25%] bg-white rounded-[0.8vw] px-[1vw] py-[0.6vw] text-[1.1vw] text-[#E87E2F] satoshiBold text-center outline-none shadow-sm transition-all duration-300 ${isEditing ? 'border-2 border-yellow-400' : 'border-transparent'}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Fitur Edit disembunyikan jika dalam Mode Riwayat (hanya view) */}
                        {!isHistoryView && !isEditing && (
                            <p onClick={() => setIsEditing(true)} className='text-white italic text-[1vw] hover:underline cursor-pointer opacity-90 flex ml-auto flex-row mt-[0.5vw]'>
                                Edit Menu
                            </p>
                        )}
                        {!isHistoryView && isEditing && (
                            <p className='text-white italic text-[1vw] opacity-90 flex ml-auto flex-row mt-[0.5vw]'>
                                Sedang Mengedit...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-5 gap-[2vw] px-[3vw] w-full'>
                <div className='col-span-2 flex flex-col gap-[1vw]'>
                    <h1 className='satoshiBold text-[2vw] text-white'>Kandungan Gizi</h1>
                    <div className='w-full rounded-[1vw] overflow-hidden border-[0.15vw] border-[#E87E2F] shadow-md'>
                        <div className='flex bg-[#FFF3EB] text-[#E87E2F] h-[3vw] items-center flex'>
                            <div className='w-[60%] pl-[1.5vw]  satoshiBold text-[1.2vw]'>Komponen</div>
                            <div className='w-[0.3%] h-full bg-[#E87E2F]'></div>
                            <div className='w-[40%] pl-[1.5vw] satoshiBold text-[1.2vw]'>Jumlah</div>
                        </div>
                        <div className='bg-white'>
                            {menuData.gizi.map((item, index) => (
                                <div key={index} className='flex border-b-[0.1vw] border-[#E87E2F] last:border-0 h-[3vw] items-center'>
                                    <div className='w-[60%] pl-[1.5vw] satoshiBold text-[1.1vw] text-[#8C4C1D]'>{item.label}</div>
                                    <div className='w-[0.3%] h-full bg-[#E87E2F]'></div>
                                    <div className='w-[40%] pl-[1.5vw] satoshiMedium text-[1.1vw] text-[#8C4C1D]'>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='col-span-3 flex flex-col gap-[1vw]'>
                    <h1 className='satoshiBold text-[2vw] text-white'>Deteksi Risiko</h1>
                    <div className='bg-[#FFFFFF] rounded-[1vw] shadow-md'>
                        <div className='p-[1.5vw] flex flex-col gap-[1vw]'>
                            <div className='flex flex-col gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[1.5vw] text-[#8C4C1D]'>Alergi</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-[#8C4C1D] pl-[0.5vw]'>
                                    {menuData.risiko.alergi.length > 0 ? menuData.risiko.alergi.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                            <div className='flex flex-col gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[1.5vw] text-[#8C4C1D]'>Tekstur</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-[#8C4C1D] pl-[0.5vw]'>
                                    {menuData.risiko.tekstur.length > 0 ? menuData.risiko.tekstur.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                            <div className='flex flex-col gap-[0.5vw]'>
                                <h3 className='satoshiBold text-[1.5vw] text-[#8C4C1D]'>Porsi Gizi</h3>
                                <ul className='list-disc list-inside satoshiMedium text-[1.3vw] text-[#8C4C1D] pl-[0.5vw]'>
                                    {menuData.risiko.porsi.length > 0 ? menuData.risiko.porsi.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    )) : <li>-</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {menuData.rekomendasi && (
                        <div className='flex flex-row items-center gap-[1vw] w-full bg-white rounded-[1vw] p-[1vw] shadow-md'>
                            <Image src={warning} alt="warning icon" className='w-[2vw] h-[2vw] ' />
                            <span className='text-[1.2vw] text-[#8C4C1D] satoshiBold'>{menuData.rekomendasi}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex justify-between px-[3vw] items-center'>
                
                {/* --- ML CONFIDENCE --- */}
                {menuData.confidence > 0 && (
                    <div className="bg-white/20 text-white px-[1.5vw] py-[0.5vw] rounded-full satoshiBold text-[1.1vw] flex items-center gap-[0.5vw]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.2vw] h-[1.2vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        Akurasi AI: {menuData.confidence}%
                    </div>
                )}

                <div className='flex gap-[1.5vw] ml-auto'>
                    {isEditing ? (
                        <button
                            onClick={() => setIsEditing(false)}
                            className='bg-[#FFF3EB] text-[#8C4C1D] satoshiBold text-[1.5vw] py-[0.8vw] px-[3vw] rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md'
                        >
                            Selesai Edit
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => router.back()}
                                className='bg-[#FFF3EB] text-[#D7762E] satoshiBold text-[1.5vw] py-[0.8vw] px-[3vw] rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md'
                            >
                                Kembali
                            </button>
                            
                            {/* Tombol Simpan hanya muncul jika BUKAN mode riwayat */}
                            {!isHistoryView && (
                                <button
                                    onClick={handleSimpanHasil}
                                    className='bg-[#FFF3EB] text-[#D7762E] satoshiBold text-[1.5vw] py-[0.8vw] px-[3vw] rounded-[2vw] hover:bg-[#ffe0c9] transition-colors shadow-md'
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