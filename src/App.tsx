import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { Collections } from "./components/Collections";
import { Occasions } from "./components/Occasions";
import { FeaturesSection } from "./components/FeaturesSection";
import { ContactSection } from "./components/ContactSection";
import Products from "./components/Products";
import ProductDetailCard from "./components/ProductDetailPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { OrderConfirmationPage } from "./components/OrderConfirmationPage";
import React, { useEffect } from "react";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AccountDashboard } from "./components/AccountInfo";
import { AuthProvider } from "./contexts/AuthContext";

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/occasions" element={<Occasions />} />
            <Route path="/about" element={<FeaturesSection />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetailCard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<AccountDashboard />} />

            {/* 404 page fallback */}
            <Route
              path="*"
              element={<h1 className="text-center mt-10">Page Not Found</h1>}
            />
          </Routes>
          <ContactSection />
        </div>
      </Router>
    </AuthProvider>
  );
}
