import dynamic from "next/dynamic";
import Hero from "@/src/components/landingpage/Hero";

const Reason = dynamic(() => import("@/src/components/landingpage/Reason"), {
  loading: () => <div className="min-h-[50vh]" />,
});
const Feature = dynamic(() => import("@/src/components/landingpage/Feature"), {
  loading: () => <div className="min-h-[50vh]" />,
});
const Collab = dynamic(() => import("@/src/components/landingpage/Collab"), {
  loading: () => <div className="min-h-screen" />,
});
const Workflow = dynamic(() => import("@/src/components/landingpage/Workflow"), {
  loading: () => <div className="min-h-[50vh]" />,
});
const Inklusif = dynamic(() => import("@/src/components/landingpage/Inklusif"), {
  loading: () => <div className="min-h-[30vh]" />,
});

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
