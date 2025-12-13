'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import DetailPelaporanSekolahSppg from "@/src/components/dashboard/sppg/pelaporan/DetailPelaporan";

const DetailPelaporanSekolahSppgPage = () => {
    const params = useParams();
    const id = params?.id as string;

    if (!id || id === 'undefined' || id === 'null') {
        notFound();
    }

    return (
        <div>
            <DetailPelaporanSekolahSppg />
        </div>
    );
}
export default DetailPelaporanSekolahSppgPage;