import Collab from "@/src/components/landingpage/Collab";
import Feature from "@/src/components/landingpage/Feature";
import Hero from "@/src/components/landingpage/Hero";
import Reason from "@/src/components/landingpage/Reason";
import Workflow from "@/src/components/landingpage/Workflow"
import Image from "next/image";
import mock from "../../assets/landingpage/mock.webp";
import Inklusif from "@/src/components/landingpage/Inklusif";

export default function Home() {
  return (
    <div className="bg-white flex flex-col gap-[5vw] ">
      <Hero />
      <Reason />
      <Feature />
      <Collab />
      <Workflow />
      <Inklusif/>
    </div>
  );
}
