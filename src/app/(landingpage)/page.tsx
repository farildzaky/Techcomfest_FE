import Collab from "@/src/components/landingpage/Collab";
import Feature from "@/src/components/landingpage/Feature";
import Hero from "@/src/components/landingpage/Hero";
import Reason from "@/src/components/landingpage/Reason";
import Workflow from "@/src/components/landingpage/Workflow"

export default function Home() {
  return (
    <div className="bg-white flex flex-col gap-[2vw] pb-[2vw]">
      <Hero />
      <Reason />
     <Feature />
      <Collab />
      <Workflow />
      <div className=" items-center justify-center flex satoshiBold text-[5vw] text-center w-[55vw] self-center">
        <h1><span className="text-[#E87E2F]">Semua anak </span>berhak mendapat <span className="text-[#E87E2F]">makanan yang aman</span> dan <span className="text-[#E87E2F]">sesuai kebutuhannya</span></h1>
      </div>
    </div>
  );
}
