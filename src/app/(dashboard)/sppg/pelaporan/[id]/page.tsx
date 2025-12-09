import SidebarSppg from "@/src/components/common/sppg/Sidebar";
import DetailPelaporanSekolahSppg from "@/src/components/dashboard/sppg/pelaporan/DetailPelaporan";

const DetailPelaporanSekolahSppgPage = () => {
    return (
        <div className="grid-cols-6 grid">
            <div className="col-span-1">
                <SidebarSppg/>
            </div>
            <div className="col-span-5">
                <DetailPelaporanSekolahSppg/>
            </div>
        </div>
    )
}
export default DetailPelaporanSekolahSppgPage;