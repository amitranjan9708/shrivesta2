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
import { OrdersPage } from "./components/OrdersPage";
import { ShippingAddressPage } from "./components/ShippingAddressPage";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminProducts } from "./components/admin/AdminProducts";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { SEO } from "./components/SEO";

function HomePage() {
  return (
    <>
      <SEO
        title="Shrivesta - Premium Fashion & Clothing E-commerce Store"
        description="Shop the latest fashion trends at Shrivesta. Discover premium clothing, accessories, and style collections for every occasion. Free shipping on orders over ₹500."
        keywords="fashion, clothing, e-commerce, online shopping, apparel, style, trendy clothes, fashion store"
      />
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
            <Route
              path="/order-confirmation"
              element={<OrderConfirmationPage />}
            />
            <Route
              path="/order-confirmation/:id"
              element={<OrderConfirmationPage />}
            />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetailCard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<AccountDashboard />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/address" element={<ShippingAddressPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin>
                  <AdminProducts />
                </RequireAdmin>
              }
            />

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
