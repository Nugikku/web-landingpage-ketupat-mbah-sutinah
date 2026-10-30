// app/page.jsx — merangkai semua section

import SkipLink from "@/components/ui/SkipLink";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Produk from "@/components/sections/Produk";
import TentangKami from "@/components/sections/TentangKami";
import Kontak from "@/components/sections/Kontak";

export default function Home() {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="konten-utama">
        <Hero />
        <Produk />
        <TentangKami />
        <Kontak />
      </main>
      <Footer />
    </>
  );
}
