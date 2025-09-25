import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { Collections } from './components/Collections';
import { Occasions } from './components/Occasions';
import { FeaturesSection } from './components/FeaturesSection';
import { ContactSection } from './components/ContactSection';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroCarousel />
      <Collections />
      <Occasions />
      <FeaturesSection />
      <ContactSection />
    </div>
  );
}