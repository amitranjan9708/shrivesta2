import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import qrCode from "./qr_code.png";
import { Instagram, MessageCircle, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';


export function ContactSection() {
  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-gray-900 via-purple-900 to-amber-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <ImageWithFallback
          src="https://lh3.googleusercontent.com/gg-dl/AJfQ9KQf-vV3ogXX9pa8lnxcz8znKQXNX4pvEh5OnyfqUKrw2Kb2eszuhgd0bQpSdJwlparxix-DJhfGFuK6Zy10gKLZzHNAadMMVm1qo-tHHLHkuOcHOK-7ysmNM1ZVZOSPr-OV9L-03dTZj5hfnJWGPzNDCBd7TNjJpeDKS1r_YBOX4N4mTA=s1024"
          alt="Mandala pattern"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent leading-none tracking-tighter">
            Connect With Us
          </h2>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Join our community of <span className="font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">fashion-forward women</span>. 
            Follow us for style tips, new arrivals, and exclusive offers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Call Us</h3>
                  <p className="text-gray-300 text-lg font-light">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Email</h3>
                  <p className="text-gray-300 text-lg font-light">hello@cottonelite.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">Visit Us</h3>
                  <p className="text-gray-300 text-lg font-light">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">Follow & Connect</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <Instagram className="h-5 w-5" />
                    <span>Follow on Instagram</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>WhatsApp Us</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-white/10 backdrop-blur-sm border-amber-400/30 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">Scan & Connect</h3>
                
                {/* Mock QR Code */}
                <div className="bg-white p-6 rounded-xl mx-auto w-fit mb-6">
                  <div className="w-40 h-40 bg-black rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-32 h-32">
                        <img src={qrCode} alt="qr" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">
                  Scan for instant access to our WhatsApp catalog
                </p>
                
                <div className="flex justify-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4" />
                    <span>@cottonelite</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom section with auth test buttons + animated heart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center border-t border-amber-400/30 pt-8"
        >
          <div className="mb-6 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="px-6 py-2 rounded-full border border-amber-300 text-amber-200 hover:bg-amber-50/10">
                Signup
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="h-5 w-5 text-red-400 fill-current" />
            </motion.div>
            <span>in Rajasthan</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            © 2024 Cotton Elite. All rights reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}