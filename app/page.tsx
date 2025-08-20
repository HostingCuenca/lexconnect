import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Blog from '@/components/Blog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Blog />
      <Footer />
    </main>
  );
}