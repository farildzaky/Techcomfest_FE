import dynamic from "next/dynamic";
import Hero from "@/src/components/landingpage/Hero";

const Reason = dynamic(() => import("@/src/components/landingpage/Reason"), {
  loading: () => <div className="min-h-[100vh] lg:min-h-[50vh]" aria-hidden="true" />,
  ssr: true,
});
const Feature = dynamic(() => import("@/src/components/landingpage/Feature"), {
  loading: () => <div className="min-h-[80vh] lg:min-h-[50vh]" aria-hidden="true" />,
  ssr: true,
});
const Collab = dynamic(() => import("@/src/components/landingpage/Collab"), {
  loading: () => <div className="min-h-[120vh] lg:min-h-screen" aria-hidden="true" />,
  ssr: true,
});
const Workflow = dynamic(() => import("@/src/components/landingpage/Workflow"), {
  loading: () => <div className="min-h-[80vh] lg:min-h-[50vh]" aria-hidden="true" />,
  ssr: true,
});
const Inklusif = dynamic(() => import("@/src/components/landingpage/Inklusif"), {
  loading: () => <div className="min-h-[40vh] lg:min-h-[30vh]" aria-hidden="true" />,
  ssr: true,
});

export default function Home() {
  return (
    <div className="bg-white flex flex-col gap-[5vw] ">
      <Hero />
      <Reason />
      <Feature />
      <Collab />
      <Workflow />
      <Inklusif />
    </div>
  );
}
