import { ShoppingBag, User, Menu, Search, LogOut, X } from "lucide-react";
import { Button } from "./ui/button";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";

export function Header() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();

  const announcements = [
    "Extra 10% OFF with code SHRI10",
    "Free shipping on orders over ₹5,000",
    "New Festive Arrivals — Shop Now",
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setBannerIndex((i) => (i + 1) % announcements.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiService.getCart();
          if (response.success && response.data) {
            const nestedData = (response.data as any).data;
            const data = nestedData || response.data;
            const items = data.items || [];

            if (items && items.length > 0) {
              const totalItems = items.reduce(
                (sum: number, item: any) => sum + (item.quantity || 0),
                0
              );
              setCartCount(totalItems);
            } else {
              setCartCount(0);
            }
          }
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const handleMobileMenuLinkClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Thin rotating announcement bar */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 sm:h-9 flex items-center justify-center overflow-hidden">
            <div className="relative w-full text-center">
              {announcements.map((msg, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                    i === bannerIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium tracking-wide">
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between h-16 gap-2 sm:gap-4"
          style={{ marginRight: "10px" }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="https://i.ibb.co/RksbbB8W/IMG-20250920-WA0003-1.jpg"
              alt="Logo"
              className="h-8 w-8 sm:h-12 sm:w-12 object-cover rounded-full"
            />
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
              ShriVesta
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/collections" className="text-gray-800 hover:text-amber-600 transition-colors">
              Collections
            </Link>
            <Link to="/occasions" className="text-gray-800 hover:text-amber-600 transition-colors">
              Occasions
            </Link>
            <Link to="/about" className="text-gray-800 hover:text-amber-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-800 hover:text-amber-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search */}
           

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-amber-50 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name.split(" ")[0]}</p>
                    </div>

                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Account
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-amber-50">
                    Login
                  </Button>
                </Link>

                
              </div>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="hover:bg-amber-50 relative h-8 w-8 sm:h-10 sm:w-10">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Menu */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Side Menu Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/20 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
              showMobileMenu ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Menu Header with Gradient */}
            <div 
              className="flex items-center justify-between p-6 border-b-2 border-amber-200"
              style={{
                background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
              }}
            >
              <h2 className="text-2xl font-bold text-white tracking-wide">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-white/20 rounded-full"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col p-6 pt-8 space-y-3">
              <Link
                to="/collections"
                className="group relative px-6 py-4 text-lg font-semibold text-gray-800 hover:text-amber-700 transition-all duration-300 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, transparent, #FEF3C7)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FEF3C7, #FDE68A)';
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, transparent, #FEF3C7)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleMobileMenuLinkClick}
              >
                <span className="relative z-10">Collections</span>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"
                />
              </Link>
              
              <Link
                to="/occasions"
                className="group relative px-6 py-4 text-lg font-semibold text-gray-800 hover:text-amber-700 transition-all duration-300 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, transparent, #FEF3C7)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FEF3C7, #FDE68A)';
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, transparent, #FEF3C7)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleMobileMenuLinkClick}
              >
                <span className="relative z-10">Occasions</span>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"
                />
              </Link>
              
              <Link
                to="/about"
                className="group relative px-6 py-4 text-lg font-semibold text-gray-800 hover:text-amber-700 transition-all duration-300 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, transparent, #FEF3C7)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FEF3C7, #FDE68A)';
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, transparent, #FEF3C7)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleMobileMenuLinkClick}
              >
                <span className="relative z-10">About</span>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"
                />
              </Link>
              
              <Link
                to="/contact"
                className="group relative px-6 py-4 text-lg font-semibold text-gray-800 hover:text-amber-700 transition-all duration-300 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, transparent, #FEF3C7)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #FEF3C7, #FDE68A)';
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, transparent, #FEF3C7)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={handleMobileMenuLinkClick}
              >
                <span className="relative z-10">Contact</span>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"
                />
              </Link>
            </nav>

            {/* Decorative Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="text-center">
                <p className="text-sm font-semibold text-amber-700 mb-2">ShriVesta</p>
                <p className="text-xs text-gray-600">Premium Fashion & Lifestyle</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
