import { ShoppingBag, User, Menu, Search } from 'lucide-react';
import { Button } from './ui/button';
import React from 'react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4" style={{marginRight: '10px'}}>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <img
              src="https://i.ibb.co/RksbbB8W/IMG-20250920-WA0003-1.jpg"
              alt="Logo"
              className="h-8 w-8 sm:h-12 sm:w-12 object-cover rounded-full"
            />
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
              ShriVesta
            </div>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            <a href="#collections" className="text-gray-800 hover:text-amber-600 transition-colors">Collections</a>
            <a href="#occasions" className="text-gray-800 hover:text-amber-600 transition-colors">Occasions</a>
            <a href="#about" className="text-gray-800 hover:text-amber-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-800 hover:text-amber-600 transition-colors">Contact</a>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <Button variant="ghost" size="icon" className="hover:bg-amber-50 h-8 w-8 sm:h-10 sm:w-10">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-amber-50 h-8 w-8 sm:h-10 sm:w-10">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-amber-50 relative h-8 w-8 sm:h-10 sm:w-10">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">3</span>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
              <Menu className="h-4 w-4 text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}