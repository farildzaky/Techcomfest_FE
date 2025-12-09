import Image from "next/image";
import lamp from "../../assets/landingpage/workflow/lamp.png";
import calender from "../../assets/landingpage/workflow/calender.png";
import fluent from "../../assets/landingpage/workflow/fluent.png";

const Workflow = () => {
    const items = [
        {
            icon: calender, 
            title: "Pilih Jenis Pemeriksaan",
            desc: "Sekolah dapat memilih analisis melalui menu MBG mingguan atau mengunggah foto makanan untuk diperiksa AI."
        },
        {
            icon: lamp, 
            title: "AI Analisis Otomatis",
            desc: "AI mengevaluasi gizi, alergi, dan tekstur, lalu memberi status kecocokan menu."
        },
        {
            icon: fluent, 
            title: "Tindak Lanjut Cepat",
            desc: "Lihat hasil, kirim laporan, ataupun lihat rekomendasi. Semua data otomatis tersusun dalam rekap yang ada."
        }
    ];

    return (
        <section className="flex flex-col gap-[2vw]">
            <h1 className="satoshiBold text-[4.5vw] text-[#E87E2F] px-[3vw]">Cara Kerja</h1>

            <div className="flex flex-col bg-[#E87E2F] rounded-r-full p-[2vw] w-[70vw] h-fit px-[2vw] py-[4vw]">
                
                {items.map((item, index) => (
                    <div key={index} className="flex flex-row gap-[3vw] ">
                        <div className="flex flex-col items-center mr-[4vw]">
                            
                            <div className="flex justify-center items-center w-[8vw] h-[8vw] bg-white rounded-full z-10 shrink-0">
                                <Image 
                                    src={item.icon} 
                                    alt="icon" 
                                    className="w-[5vw] h-[5vw] object-contain" 
                                />
                            </div>

                            {index !== items.length - 1 && (
                                <div className="w-[0.3vw] border-l-[0.2vw] border-dashed border-white h-full flex-grow min-h-[2vw]"></div>
                            )}
                        </div>

                        <div className={`flex flex-col w-[34vw] justify-start pt-[0.5vw] ${index !== items.length - 1 ? 'pb-[4vw]' : 'pb-0'}`}>
                            <h2 className="satoshiBold text-[2vw] text-white  mb-[0.5vw]">{item.title}</h2>
                            <p className="satoshiMedium text-[1.3vw] text-white  ">{item.desc}</p>
                        </div>

                    </div>
                ))}

            </div>
        </section>
    )
}
export default Workflow;