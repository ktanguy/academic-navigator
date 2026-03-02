import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { CTA } from "@/components/landing/CTA";
import { PageTransition } from "@/components/ui/motion";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageTransition>
          <Hero />
          <Features />
          <HowItWorks />
          <Stats />
          <CTA />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
