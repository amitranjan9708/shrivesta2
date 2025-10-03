import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GraduationCap, Briefcase, Heart, Users, Sparkles } from 'lucide-react';

const occasions = [
  {
    id: 1,
    name: "College Wear",
    description: "Comfortable and trendy for daily campus life",
    icon: <GraduationCap className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1742800786544-e935375035e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0aSUyMGNvdHRvbiUyMGRyZXNzfGVufDF8fHx8MTc1ODM2MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-blue-400 to-blue-600"
  },
  {
    id: 2,
    name: "Office Wear",
    description: "Professional yet elegant for workplace",
    icon: <Briefcase className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1680506660555-1c225f5da953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMGt1cnRpJTIwb2ZmaWNlJTIwd2VhcnxlbnwxfHx8fDE3NTgzNjIzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-purple-400 to-purple-600"
  },
  {
    id: 3,
    name: "Everyday Style",
    description: "Casual comfort for daily activities",
    icon: <Heart className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1741847639057-b51a25d42892?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a3VydGl8ZW58MHx8MHx8fDA%3D",
    gradient: "from-pink-400 to-pink-600"
  },
  {
    id: 4,
    name: "Meet-ups",
    description: "Stylish outfits for social gatherings",
    icon: <Users className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1742800786544-e935375035e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0aSUyMGNvdHRvbiUyMGRyZXNzfGVufDF8fHx8MTc1ODM2MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-green-400 to-green-600"
  },
  {
    id: 5,
    name: "Ethnic Wear",
    description: "Traditional elegance for special occasions",
    icon: <Sparkles className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1548597180-23cc88a9a6f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWphc3RoYW5pJTIwd29tYW4lMjB0cmFkaXRpb25hbCUyMGRyZXNzfGVufDF8fHx8MTc1ODM2MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    gradient: "from-amber-400 to-orange-600"
  }
];

export function Occasions() {
  return (
    <section id="occasions" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-purple-600 to-amber-600 bg-clip-text text-transparent leading-none tracking-tighter">
            Perfect for Every
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Occasion</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            From <span className="font-semibold text-purple-600">boardroom meetings</span> to <span className="font-semibold text-pink-600">college hangouts</span>, 
            find the perfect kurti for every moment of your life
          </p>
          
          {/* Decorative mandala pattern */}
          <div className="mt-6 flex justify-center">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1703145219083-6037d97decb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW5kYWxhJTIwcGF0dGVybnxlbnwxfHx8fDE3NTgzNjIzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Decorative pattern"
              className="w-16 h-16 opacity-30 rounded-full"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {occasions.map((occasion, index) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0 h-full">
                <div className="relative">
                  <div className="overflow-hidden">
                    <ImageWithFallback
                      src={occasion.image}
                      alt={occasion.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Icon overlay */}
                  <div className={`absolute top-4 left-4 p-3 rounded-full bg-gradient-to-r ${occasion.gradient} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {occasion.icon}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 tracking-tight">
                    {occasion.name}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed font-light">
                    {occasion.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}