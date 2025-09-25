import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

const collections = [
  {
    id: 1,
    name: "Short Kurti",
    description: "Perfect for casual outings and college wear",
    image: "https://images.unsplash.com/photo-1742800786544-e935375035e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0aSUyMGNvdHRvbiUyMGRyZXNzfGVufDF8fHx8MTc1ODM2MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "₹799 - ₹1,299",
    colors: ["Rose", "Mint", "Lavender", "Peach"],
    bestseller: true
  },
  {
    id: 2,
    name: "Long Kurti",
    description: "Elegant and graceful for formal occasions",
    image: "https://images.unsplash.com/photo-1669199583373-b9636f3f14c8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D",
    price: "₹1,199 - ₹1,899",
    colors: ["Navy", "Maroon", "Teal", "Gold"],
    bestseller: false
  },
  {
    id: 3,
    name: "2 Piece Kurti Set",
    description: "Kurti with matching bottom for complete look",
    image: "https://images.unsplash.com/photo-1741847639057-b51a25d42892?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a3VydGl8ZW58MHx8MHx8fDA%3D",
    price: "₹1,599 - ₹2,499",
    colors: ["Coral", "Sage", "Blush", "Ivory"],
    bestseller: false
  },
  {
    id: 4,
    name: "3 Piece Kurti Set",
    description: "Complete ensemble with kurti, bottom & dupatta",
    image: "https://images.unsplash.com/photo-1680506660555-1c225f5da953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMGt1cnRpJTIwb2ZmaWNlJTIwd2VhcnxlbnwxfHx8fDE3NTgzNjIzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "₹2,199 - ₹3,499",
    colors: ["Royal Blue", "Emerald", "Wine", "Mustard"],
    bestseller: true
  }
];

export function Collections() {
  return (
    <section id="collections" className="py-16 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500 bg-clip-text text-transparent leading-none tracking-tighter">
            Our Collections
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Discover our curated range of <span className="font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">pure cotton kurtis</span>, 
            meticulously designed for comfort, style, and timeless elegance
          </p>
          
          {/* Decorative element */}
          <div className="mt-8 flex justify-center">
            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-lg"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0">
                <div className="relative">
                  {collection.bestseller && (
                    <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-yellow-600 text-black">
                      Bestseller
                    </Badge>
                  )}
                  <div className="overflow-hidden">
                    <ImageWithFallback
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-base leading-relaxed">
                    {collection.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {collection.price}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {collection.colors.map((color, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black border-0 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    View Collection
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}