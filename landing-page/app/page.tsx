import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import PainSolution from "@/components/landing/PainSolution";
import Features from "@/components/landing/Features";
import VietnamPack from "@/components/landing/VietnamPack";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <PainSolution />
      <Features />
      <VietnamPack />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
