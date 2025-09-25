import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import './HeroCarousel.css';

// Hero slides data
const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
    title: "Pure Cotton Elegance",
    subtitle: "Discover comfort meets style",
    description: "Lightweight, breathable cotton kurtis perfect for every occasion",
    cta: "Shop Collection"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Royal Rajasthani Touch",
    subtitle: "Heritage meets modernity",
    description: "Traditional prints with contemporary cuts for the modern woman",
    cta: "Explore Now"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1697685070059-4b8d49125af1?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Office to Evening",
    subtitle: "Versatile & Classy",
    description: "From boardroom meetings to evening gatherings, one kurti does it all",
    cta: "Shop Styles"
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="hero-carousel" style={{ position: 'relative', height: '70vh', overflow: 'hidden', background: 'linear-gradient(to bottom right, #FFFBEB, #FFF1F2)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ImageWithFallback
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.3), transparent)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '0 16px', width: '100%' }}>
              <div style={{ maxWidth: '600px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'white' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} style={{ height: 20, width: 20, fill: '#F59E0B' }} />
                    ))}
                    <span style={{ marginLeft: '8px', fontWeight: 500 }}>Trusted by thousands</span>
                  </div>

                  <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', marginBottom: '16px', lineHeight: 1 }}>
                    {heroSlides[currentSlide].title}
                  </h1>

                  <h2 style={{ fontSize: '2rem', fontWeight: 300, background: 'linear-gradient(to right, #FCD34D, #FEF3C7, #FCD34D)', WebkitBackgroundClip: 'text', color: 'transparent', marginBottom: '16px' }}>
                    {heroSlides[currentSlide].subtitle}
                  </h2>

                  <p style={{ fontSize: '1.25rem', color: '#F3F4F6', marginBottom: '24px', lineHeight: 1.6 }}>
                    {heroSlides[currentSlide].description}
                  </p>

                  <Button style={{ background: 'linear-gradient(to right, #F59E0B, #FBBF24)', color: '#000', padding: '16px 32px', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 15px rgba(0,0,0,0.2)' }}>
                    {heroSlides[currentSlide].cta}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Button
        onClick={prevSlide}
        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '9999px', padding: '8px' }}
      >
        <ChevronLeft style={{ height: 24, width: 24 }} />
      </Button>

      <Button
        onClick={nextSlide}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '9999px', padding: '8px' }}
      >
        <ChevronRight style={{ height: 24, width: 24 }} />
      </Button>

      {/* Slide Indicators */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: index === currentSlide ? '#F59E0B' : 'rgba(255,255,255,0.5)',
              transform: index === currentSlide ? 'scale(1.25)' : 'scale(1)',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
