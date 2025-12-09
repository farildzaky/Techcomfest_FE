'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';
import trash from "../../../../assets/trash.png"
import bg from "../../../../assets/bg.png"
import loading from "../../../../assets/loading.png" // Menggunakan asset loading.png

interface ProfileData {
    nama_sekolah: string;
    sppg: any | null;
}

interface UserData {
    id: string;
    profile_name: string;
    email: string;
    role: string;
    profile_data?: ProfileData;
}

interface TableRow {
    id: string;
    sekolah: string;
    sppg: string;
}

const DaftarPenetapan = () => {
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [loadingData, setLoadingData] = useState(true); // Ganti nama state loading agar tidak konflik
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null); // Trigger status API delete

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, namaSekolah: string } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const loadData = async () => {
        setLoadingData(true);
        setError("");
        try {
            const response = await fetchWithAuth("/admin/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) throw new Error("Gagal memuat data user");

            const responseJson = await response.json();
            const allUsers: UserData[] = responseJson.data;
            const schoolsOnly = allUsers.filter(u => u.role === 'sekolah');

            const detailedRows = await Promise.all(
                schoolsOnly.map(async (school) => {
                    try {
                        const detailRes = await fetchWithAuth(
                            `/admin/users/${school.id}`,
                            { method: "GET" }
                        );

                        const detailJson = await detailRes.json();
                        const detailData: UserData = detailJson.data;
                        const sppgData = detailData.profile_data?.sppg;

                        if (sppgData) {
                            const namaSppg = sppgData.nama_instansi || sppgData.profile_name || sppgData.email || sppgData.nama || "SPPG Terdaftar";
                            const namaSekolah = detailData.profile_data?.nama_sekolah || detailData.profile_name || detailData.email;

                            return {
                                id: school.id,
                                sekolah: namaSekolah,
                                sppg: namaSppg
                            };
                        }
                        return null;
                    } catch (err) {
                        return null;
                    }
                })
            );

            const validRows = detailedRows.filter((row): row is TableRow => row !== null);
            setTableData(validRows);

        } catch (err: any) {
            setError("Gagal memuat data penetapan.");
        } finally {
            setLoadingData(false);
        }
    };

    const openDeleteModal = (schoolId: string, namaSekolah: string) => {
        setItemToDelete({ id: schoolId, namaSekolah: namaSekolah });
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deletingId) return;
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;

        setDeletingId(itemToDelete.id); // Mulai loading di modal
        try {
            const response = await fetchWithAuth(
                `/admin/schools/${itemToDelete.id}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Gagal menghapus data");

            setTableData(prev => prev.filter(row => row.id !== itemToDelete.id));
            setIsModalOpen(false); // Tutup modal saat sukses
            setItemToDelete(null);

        } catch (error: any) {
            alert("Gagal menghapus: " + error.message);
        } finally {
            setDeletingId(null); // Selesai loading
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    if (error) return <div className="w-full h-screen flex justify-center items-center text-red-500 satoshiBold text-[1.5vw]">{error}</div>;

    return (
        <div className="w-full p-[3vw] font-sans flex flex-col relative">

            <div className="mb-[2vw]">
                <h1 className="satoshiBold text-[2.5vw] text-black">Daftar Penetapan</h1>
                <p className="satoshiMedium text-[1.2vw] text-gray-600 mt-[0.5vw]">
                    Daftar sekolah dan SPPG yang telah terdaftar dan saling terhubung dalam Inkluzi
                </p>
            </div>

            <div className="w-full bg-[#E87E2F] rounded-[1.5vw] overflow-hidden border-[0.2vw] border-[#E87E2F]">

                <div className="flex bg-[#E87E2F] text-white rounded-t-[1.3vw]">
                    <div className="w-[45%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">
                        Sekolah
                    </div>
                    <div className="w-[45%] py-[1vw] flex justify-center items-center border-r-[0.15vw] border-white satoshiBold text-[1.5vw]">
                        SPPG
                    </div>
                    <div className="w-[10%] py-[1vw] flex justify-center items-center satoshiBold text-[1.5vw]">

                    </div>
                </div>

                <div className="flex flex-col bg-white rounded-b-[1.3vw] overflow-y-auto">
                    {loadingData ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex border-b-[0.15vw] border-[#E87E2F] animate-pulse">
                                <div className="w-[45%] py-[1.5vw] px-4"><div className="h-[1.5vw] w-full bg-gray-200 rounded"></div></div>
                                <div className="w-[45%] py-[1.5vw] px-4"><div className="h-[1.5vw] w-full bg-gray-200 rounded"></div></div>
                            </div>
                        ))
                    ) : currentItems.length > 0 ? (
                        currentItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-center border-b-[0.15vw] border-[#E87E2F] transition-colors
                                    ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}
                                    ${index === currentItems.length - 1 ? 'last:border-b-0 rounded-b-[1.3vw]' : ''} 
                                `}
                            >
                                <div className="w-[45%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] satoshiMedium text-[1.2vw] text-black text-center px-4">
                                    {item.sekolah}
                                </div>
                                <div className="w-[45%] py-[1.5vw] flex justify-center items-center border-r-[0.15vw] border-[#D9833E] satoshiMedium text-[1.2vw] text-black text-center px-4">
                                    {item.sppg}
                                </div>

                                <div className="w-[10%] flex justify-center items-center">
                                    <button
                                        onClick={() => openDeleteModal(item.id, item.sekolah)}
                                        disabled={deletingId !== null}
                                        className="group p-[0.5vw] rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Hapus Penetapan"
                                    >
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[1.8vw] h-[1.8vw] text-gray-400 group-hover:text-red-500 transition-colors">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-[2vw] text-center satoshiMedium text-[1.2vw] text-gray-500">
                            Belum ada sekolah yang ditetapkan ke SPPG.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-[1vw] mb-[3vw] items-center gap-[1vw]">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors
                        ${currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}
                    `}
                >
                    &lt;
                </button>

                <p className="satoshiMedium text-[#E87E2F] text-[1.2vw]">
                    Halaman {currentPage} dari {totalPages || 1}
                </p>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`w-[2vw] h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors
                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}
                    `}
                >
                    &gt;
                </button>
            </div>

            <Link href="/admin/penetapan/assign-sppg" className="block w-full group">
                <div className="w-full bg-[#E87E2F] rounded-[1.5vw] p-[2vw] flex justify-between items-center shadow-md transition-all duration-300 hover:bg-[#c27233] hover:shadow-lg hover:scale-[1.01]">
                    <div className="flex flex-col gap-[0.5vw]">
                        <h2 className="satoshiBold text-[1.8vw] text-white">
                            Penetapan Sekolah dengan SPPG
                        </h2>
                        <p className="satoshiMedium text-[1.1vw] text-white opacity-90">
                            Pilih sekolah yang dituju untuk tiap SPPG berdasarkan lokasi terdekat
                        </p>
                    </div>
                    <div className="text-white group-hover:translate-x-[0.5vw] transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-[3vw] h-[3vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                </div>
            </Link>

            {/* --- MODAL POPUP HAPUS --- */}
            {isModalOpen && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={closeDeleteModal}
                    ></div>

                    <div className="relative bg-white rounded-[2vw] p-[3vw] w-[40vw] shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center gap-[2vw]">

                        {/* KONTEN BERGANTUNG PADA LOADING STATE */}
                        {deletingId === itemToDelete.id ? (
                            
                            // === LOADING STATE: Sedang Diproses ===
                            <div className="flex flex-col items-center justify-center py-[4vw] px-[2vw]">
                                
                                {/* Ikon Loading berputar */}
                                <div className="relative w-[10vw] h-[10vw] flex items-center justify-center">
                                    <Image 
                                        src={bg} 
                                        alt="Background Shape" 
                                        layout="fill"
                                        objectFit="contain"
                                        className="opacity-70"
                                    />
                                    <Image 
                                        src={loading} 
                                        alt="Sedang Diproses" 
                                        className="w-[5vw] h-[5vw] translate-y-[0.4vw] translate-x-[0.3vw] object-contain absolute animate-spin"
                                    />
                                </div>
                                
                                {/* Teks Loading */}
                                <h3 className="satoshiBold text-[2.5vw] text-[#E87E2F] mt-[2vw]">Sedang Diproses</h3>
                                <p className="satoshiMedium text-[1.2vw] text-gray-500 mt-[0.5vw]">
                                    Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                                </p>
                            </div>

                        ) : (

                            // === CONFIRMATION STATE: Yakin Hapus? ===
                            <>
                                {/* Gambar Hapus (Struktur Normal) */}
                                <div className="relative w-[10vw] h-[10vw] flex items-center justify-center">
                                    <Image 
                                        src={bg} 
                                        alt="Background Shape" 
                                        layout="fill"
                                        objectFit="contain"
                                    />
                                    <Image 
                                        src={trash} 
                                        alt="Sedang Diproses" 
                                        className="w-[5vw] h-[5vw] translate-y-[0.4vw] translate-x-[0.3vw] object-contain absolute "
                                    />
                                </div>

                                {/* Judul & Deskripsi */}
                                <div className="flex flex-col ">
                                    <h3 className="satoshiBold text-[2vw] text-[#B56225]">Yakin Ingin Menghapus?</h3>
                                    <p className="satoshiMedium text-[1.2vw] text-[#B56225]">
                                        Anda yakin ingin menghapus penetapan untuk sekolah <br />
                                        <span className="satoshiBold text-red-600">{itemToDelete.namaSekolah}</span>?
                                    </p>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex w-full gap-[1.5vw] mt-[1vw]">
                                    <button
                                        onClick={closeDeleteModal}
                                        disabled={deletingId !== null}
                                        className="flex-1 py-[1vw] rounded-[1vw] border-[0.2vw] border-gray-300 text-gray-700 satoshiBold text-[1.2vw] hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={executeDelete}
                                        disabled={deletingId !== null}
                                        className="flex-1 py-[1vw] rounded-[1vw] bg-red-600 text-white satoshiBold text-[1.2vw] hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-[0.5vw] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {"Ya, Hapus"}
                                    </button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}
            {/* --- END MODAL POPUP --- */}

        </div>
    )
}

export default DaftarPenetapan;