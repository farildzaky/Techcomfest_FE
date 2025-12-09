import Footer from "@/src/components/common/Footer";
import Navbar from "@/src/components/common/Navbar";


export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer/>
    </div>
  );
}