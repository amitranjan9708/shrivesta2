import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Leaf, Feather, Shirt, Crown } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: <Leaf className="h-12 w-12 text-green-600" />,
    title: "Pure Cotton",
    description: "100% pure cotton fabric that's gentle on your skin and environment-friendly",
    image: "https://images.unsplash.com/photo-1645859515276-d725f85d73bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBmYWJyaWMlMjB0ZXh0dXJlfGVufDF8fHx8MTc1ODM1NDkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 2,
    icon: <Feather className="h-12 w-12 text-blue-600" />,
    title: "Soft & Lightweight",
    description: "Incredibly soft texture that feels like a gentle breeze against your skin",
    image: "https://images.unsplash.com/photo-1645859515276-d725f85d73bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBmYWJyaWMlMjB0ZXh0dXJlfGVufDF8fHx8MTc1ODM1NDkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    icon: <Shirt className="h-12 w-12 text-purple-600" />,
    title: "Supreme Comfort",
    description: "Designed for all-day comfort with breathable fabric and perfect fit",
    image: "https://images.unsplash.com/photo-1742800786544-e935375035e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0aSUyMGNvdHRvbiUyMGRyZXNzfGVufDF8fHx8MTc1ODM2MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 4,
    icon: <Crown className="h-12 w-12 text-amber-600" />,
    title: "Classy Elegance",
    description: "Timeless designs that blend traditional elegance with modern sophistication",
    image: "https://images.unsplash.com/photo-1640183298005-3a4497cc6a37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBqZXdlbHJ5JTIwZ29sZHxlbnwxfHx8fDE3NTgzNjIzNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function FeaturesSection() {
  return (
    <section id="about" className="py-16 bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-none tracking-tighter">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Why Choose</span>
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">Cotton Elite?</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            We believe that <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">comfort and style</span> should never be compromised. 
            Our kurtis are crafted with <span className="font-semibold text-amber-600">love</span>, attention to detail, 
            and the finest cotton to give you the perfect blend of tradition and modernity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group"
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <ImageWithFallback
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Floating icon */}
                  <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base font-light">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Decorative element with Rajasthani architecture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="relative inline-block">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1757237367150-3c134720f075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWphc3RoYW5pJTIwcGFsYWNlJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1ODM2MjM1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Royal heritage"
              className="w-32 h-32 rounded-full object-cover opacity-20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Crown className="h-16 w-16 text-amber-500" />
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-600 italic font-light tracking-wide">
            "<span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-semibold">Crafted with royal heritage</span>, designed for modern queens"
          </p>
        </motion.div>
      </div>
    </section>
  );
}