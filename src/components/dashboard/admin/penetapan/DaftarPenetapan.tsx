'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';
import Image from 'next/image';

// Import Assets
import trash from "../../../../assets/trash.png"
import bg from "../../../../assets/bg.png"
import loading from "../../../../assets/loading.png"
import alertIcon from "../../../../assets/alert.png" // Pastikan file ini ada sesuai struktur folder

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

type ModalType = 'delete' | 'loading' | 'error' | null;

const DaftarPenetapan = () => {
    // Data States
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(true); // Loading skeleton tabel awal

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalMessage, setModalMessage] = useState({ title: "", desc: "" });

    // Action States
    const [itemToDelete, setItemToDelete] = useState<{ id: string, namaSekolah: string } | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- HELPER UNTUK MEMBUKA MODAL ---
    const showLoadingModal = () => {
        setModalType('loading');
        setIsModalOpen(true);
    };

    const showErrorModal = (title: string, message: string) => {
        setModalType('error');
        setModalMessage({ title: title, desc: message });
        setIsModalOpen(true);
    };

    const showDeleteConfirmModal = (schoolId: string, namaSekolah: string) => {
        setItemToDelete({ id: schoolId, namaSekolah });
        setModalType('delete');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        // Jangan tutup jika sedang loading proses
        if (modalType === 'loading') return;
        setIsModalOpen(false);
        setModalType(null);
        setItemToDelete(null);
    };

    // --- LOGIC DATA ---

    const loadData = async () => {
        setIsTableLoading(true);
        try {
            const response = await fetchWithAuth("/admin/users", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Gagal mengambil data user dari server.");

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
            // Tampilkan error menggunakan Modal, bukan teks merah
            showErrorModal("Gagal Memuat Data", "Terjadi kesalahan saat mengambil data penetapan. Silakan refresh halaman.");
        } finally {
            setIsTableLoading(false);
        }
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;

        // Ubah modal menjadi loading state
        showLoadingModal();

        try {
            const response = await fetchWithAuth(
                `/admin/schools/${itemToDelete.id}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Gagal menghapus data dari server.");

            // Hapus item dari state tabel lokal
            setTableData(prev => prev.filter(row => row.id !== itemToDelete.id));

            // Tutup modal setelah sukses
            setIsModalOpen(false);
            setModalType(null);
            setItemToDelete(null);

        } catch (error: any) {
            // Jika gagal delete, ubah modal jadi Error
            showErrorModal("Penghapusan Gagal", "Pastikan jaringan stabil atau coba lagi beberapa saat lagi.");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    return (
        <div className="w-full min-h-screen p-4 lg:p-[3vw] font-sans flex flex-col relative">

            <div className="mb-6 lg:mb-[2vw]">
                <h1 className="satoshiBold text-2xl lg:text-[2.5vw] text-black">Daftar Penetapan</h1>
                <p className="satoshiMedium text-sm lg:text-[1.2vw] text-gray-600 mt-2 lg:mt-[0.5vw]">
                    Daftar sekolah dan SPPG yang telah terdaftar dan saling terhubung dalam Inkluzi
                </p>
            </div>

            {/* --- TABLE CONTAINER --- */}
            <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] overflow-hidden border-2 lg:border-[0.2vw] border-[#E87E2F] overflow-x-auto">
                <div className="min-w-[600px] w-full">
                    <div className="flex bg-[#E87E2F] text-white rounded-t-lg lg:rounded-t-[1.3vw]">
                        <div className="w-[45%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">
                            Sekolah
                        </div>
                        <div className="w-[45%] py-4 lg:py-[1vw] flex justify-center items-center border-r border-white lg:border-r-[0.15vw] satoshiBold text-base lg:text-[1.5vw]">
                            SPPG
                        </div>
                        <div className="w-[10%] py-4 lg:py-[1vw] flex justify-center items-center satoshiBold text-base lg:text-[1.5vw]">
                            Hapus
                        </div>
                    </div>

                    <div className="flex flex-col bg-white lg:rounded-b-[1.3vw]">
                        {isTableLoading ? (
                            // Skeleton Loading UI
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex border-b border-[#E87E2F] lg:border-b-[0.15vw] animate-pulse">
                                    <div className="w-[45%] py-4 lg:py-[1.5vw] px-4"><div className="h-4 w-full lg:h-[1.5vw] bg-gray-200 rounded"></div></div>
                                    <div className="w-[45%] py-4 lg:py-[1.5vw] px-4"><div className="h-4 w-full lg:h-[1.5vw] bg-gray-200 rounded"></div></div>
                                </div>
                            ))
                        ) : currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center border-b border-[#E87E2F] lg:border-b-[0.15vw] transition-colors
                                        ${index % 2 === 1 ? 'bg-[#FFF3EB]' : 'bg-white'}
                                        ${index === currentItems.length - 1 ? 'last:border-b-0 lg:rounded-b-[1.3vw]' : ''} 
                                    `}
                                >
                                    <div className="w-[45%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black text-center px-4">
                                        {item.sekolah}
                                    </div>
                                    <div className="w-[45%] py-4 lg:py-[1.5vw] flex justify-center items-center border-r border-[#D9833E] lg:border-r-[0.15vw] satoshiMedium text-sm lg:text-[1.2vw] text-black text-center px-4">
                                        {item.sppg}
                                    </div>

                                    <div className="w-[10%] flex justify-center items-center py-2 lg:py-0">
                                        <button
                                            onClick={() => showDeleteConfirmModal(item.id, item.sekolah)}
                                            className="group p-2 lg:p-[0.5vw] rounded-lg hover:bg-red-50 transition-colors"
                                            title="Hapus Penetapan"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 lg:w-[1.8vw] lg:h-[1.8vw] text-gray-400 group-hover:text-red-500 transition-colors">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 lg:p-[2vw] text-center satoshiMedium text-sm lg:text-[1.2vw] text-gray-500">
                                Belum ada sekolah yang ditetapkan ke SPPG.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-end mt-4 lg:mt-[1vw] mb-8 lg:mb-[3vw] items-center gap-4 lg:gap-[1vw]">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors
                        ${currentPage === 1 ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}
                    `}
                >
                    &lt;
                </button>

                <p className="satoshiMedium text-[#E87E2F] text-sm lg:text-[1.2vw]">
                    Halaman {currentPage} dari {totalPages || 1}
                </p>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 lg:w-[2vw] lg:h-[2vw] flex items-center justify-center rounded-full border border-[#E87E2F] transition-colors
                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-[#E87E2F] hover:bg-[#E87E2F] hover:text-white'}
                    `}
                >
                    &gt;
                </button>
            </div>

            <Link href="/admin/penetapan/assign-sppg" className="block w-full group mb-8 lg:mb-0">
                <div className="w-full bg-[#E87E2F] rounded-xl lg:rounded-[1.5vw] p-6 lg:p-[2vw] flex justify-between items-center shadow-md transition-all duration-300 hover:bg-[#c27233] hover:shadow-lg hover:scale-[1.01]">
                    <div className="flex flex-col gap-2 lg:gap-[0.5vw]">
                        <h2 className="satoshiBold text-lg lg:text-[1.8vw] text-white">
                            Penetapan Sekolah dengan SPPG
                        </h2>
                        <p className="satoshiMedium text-sm lg:text-[1.1vw] text-white opacity-90">
                            Pilih sekolah yang dituju untuk tiap SPPG berdasarkan lokasi terdekat
                        </p>
                    </div>
                    <div className="text-white group-hover:translate-x-2 lg:group-hover:translate-x-[0.5vw] transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-8 h-8 lg:w-[3vw] lg:h-[3vw]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                </div>
            </Link>

            {/* --- UNIVERSAL MODAL SYSTEM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <div className="relative bg-white rounded-2xl lg:rounded-[1.5vw] p-6 lg:p-[2vw] w-full max-w-md lg:w-[30vw] shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center gap-4 lg:gap-[1.5vw]">

                        {/* ICON SECTION */}
                        <div className="relative w-20 h-20 lg:w-[10vw] lg:h-[10vw] flex items-center justify-center">
                            {/* Background Circle */}
                            <Image
                                src={bg}
                                alt="Background Shape"
                                layout="fill"
                                objectFit="contain"
                            />

                            {/* Overlay Icon based on Modal Type */}
                            {modalType === 'loading' && (
                                <Image
                                    src={loading}
                                    alt="Loading"
                                    className="w-10 h-10 lg:w-[5vw] lg:h-[5vw] object-contain absolute animate-spin"
                                />
                            )}

                            {modalType === 'delete' && (
                                <Image
                                    src={trash}
                                    alt="Hapus"
                                    className="w-10 h-10 lg:w-[5vw] lg:h-[5vw] object-contain absolute"
                                />
                            )}

                            {modalType === 'error' && (
                                <Image
                                    src={alertIcon}
                                    alt="Error"
                                    className="w-10 h-10 lg:w-[5vw] lg:h-[5vw] object-contain absolute"
                                />
                            )}
                        </div>

                        {/* TEXT CONTENT SECTION */}
                        <div className="flex flex-col gap-1">
                            {modalType === 'loading' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[1.8vw] text-[#E87E2F]">Sedang Diproses</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1vw] text-gray-500">
                                        Perubahan Anda sedang diproses. Pastikan koneksi Anda stabil.
                                    </p>
                                </>
                            )}

                            {modalType === 'delete' && itemToDelete && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[1.8vw] text-[#B56225]">Yakin Ingin Menghapus?</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1vw] text-[#B56225]">
                                        Anda yakin ingin menghapus penetapan untuk sekolah <br />
                                        <span className="satoshiBold text-red-600">{itemToDelete.namaSekolah}</span>?
                                    </p>
                                </>
                            )}

                            {modalType === 'error' && (
                                <>
                                    <h3 className="satoshiBold text-lg lg:text-[1.8vw] text-[#B56225]">{modalMessage.title}</h3>
                                    <p className="satoshiMedium text-sm lg:text-[1vw] text-[#B56225] px-4">
                                        {modalMessage.desc}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* BUTTON ACTION SECTION */}
                        <div className="flex w-full gap-4 lg:gap-[1vw]">
                            {modalType === 'delete' && (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-2.5 lg:py-[0.8vw] rounded-xl lg:rounded-[0.8vw] border-2 lg:border-[0.15vw] border-gray-300 text-gray-700 satoshiBold text-sm lg:text-[1vw] hover:bg-gray-100 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={executeDelete}
                                        className="flex-1 py-2.5 lg:py-[0.8vw] rounded-xl lg:rounded-[0.8vw] bg-red-600 text-white satoshiBold text-sm lg:text-[1vw] hover:bg-red-700 transition-colors shadow-md"
                                    >
                                        Ya, Hapus
                                    </button>
                                </>
                            )}

                            {/* Tombol OK untuk Error Modal */}
                            {modalType === 'error' && (
                                <button
                                    onClick={closeModal}
                                    className="w-full py-2.5 lg:py-[0.8vw] rounded-xl lg:rounded-[0.8vw] bg-[#E87E2F] text-white satoshiBold text-sm lg:text-[1vw] hover:bg-[#c27233] transition-colors shadow-md"
                                >
                                    Mengerti
                                </button>
                            )}

                            {/* Loading tidak perlu tombol */}
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default DaftarPenetapan;