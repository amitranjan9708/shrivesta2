import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { Collections } from "./components/Collections";
import { Occasions } from "./components/Occasions";
import { FeaturesSection } from "./components/FeaturesSection";
import { ContactSection } from "./components/ContactSection";
import Products from "./components/Products";
import Productdetailpage from "./components/Productdetailpage";

function HomePage() {
  return (
    <>
      <HeroCarousel />
      <Collections />
      <Occasions />
      <FeaturesSection />
      {/* <ContactSection /> */}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/occasions" element={<Occasions />} />
          <Route path="/about" element={<FeaturesSection />} />
          
          <Route path="/products" element={<Products />} />
          {/* 404 page fallback */}
          <Route path="*" element={<h1 className="text-center mt-10">Page Not Found</h1>} />
          <Route path="/products/:id" element={<Productdetailpage />} />
        </Routes>
        <ContactSection />
      </div>
    </Router>
  );
}
