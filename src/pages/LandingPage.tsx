import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Camera, Utensils, ShieldCheck, ArrowRight, Instagram, Facebook, Twitter, CheckCircle2, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Feature = ({ icon: Icon, title, description }: any) => (
  <div className="p-8 glass-card hover:border-safari-gold/30 transition-all group">
    <div className="w-12 h-12 bg-safari-green/10 rounded-2xl flex items-center justify-center text-safari-green mb-6 group-hover:bg-safari-green group-hover:text-white transition-all">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-serif mb-3">{title}</h3>
    <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'leads'), {
        customerName: formData.get('name'),
        email: formData.get('email'),
        source: 'Website Inquiry',
        status: 'new',
        notes: `Destination: ${formData.get('destination')}\nMessage: ${formData.get('message')}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('There was an error submitting your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-safari-sand min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-safari-sand/80 backdrop-blur-md border-b border-safari-earth/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Compass className="text-safari-green" size={32} />
            <span className="font-serif text-2xl text-safari-green">Safaris&Tours</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <a href="#destinations" className="hover:text-safari-green transition-colors">Destinations</a>
            <a href="#experiences" className="hover:text-safari-green transition-colors">Experiences</a>
            <a href="#about" className="hover:text-safari-green transition-colors">About Us</a>
            <Link to="/admin" className="btn-primary">Staff Login</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-safari-green"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-safari-earth/10 p-6 flex flex-col gap-6 text-lg font-medium text-stone-700 shadow-xl"
          >
            <a href="#destinations" onClick={() => setIsMenuOpen(false)} className="hover:text-safari-green transition-colors">Destinations</a>
            <a href="#experiences" onClick={() => setIsMenuOpen(false)} className="hover:text-safari-green transition-colors">Experiences</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-safari-green transition-colors">About Us</a>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center">Staff Login</Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000" 
            alt="Safari Landscape" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Darker overlay for better text/button visibility */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-safari-green/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white mt-12"
          >
            <span className="inline-block px-4 py-1 bg-safari-gold/30 backdrop-blur-sm border border-safari-gold/50 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
              Authentic African Adventures
            </span>
            <h1 className="text-6xl md:text-8xl font-serif mb-6 leading-tight text-white">
              Discover the Wild <br />
              <span className="italic text-safari-gold">Untamed Heart</span>
            </h1>
            <p className="text-lg text-stone-100 mb-10 leading-relaxed max-w-lg">
              Experience the majesty of the African savannah with Safaris&Tours Ltd. 
              From the Great Migration to private luxury retreats, we craft 
              unforgettable journeys.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800" 
                  alt="Safaris&Tours Ltd Nairobi" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-safari-gold rounded-3xl -z-10 hidden lg:block"></div>
              <div className="absolute top-10 -left-10 glass-card p-6 max-w-[200px] hidden lg:block">
                <p className="text-4xl font-serif text-safari-green mb-1">400+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Monthly Bookings</p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-safari-gold font-bold uppercase tracking-widest text-sm">Established 2015</span>
                <h2 className="text-5xl mt-4 mb-6">Nairobi's Premier <br /><span className="italic">Eco-Tourism Experts</span></h2>
                <p className="text-stone-600 leading-relaxed text-lg">
                  Based in Westlands district of Nairobi, Safaris&Tours Ltd is a dedicated eco-tourism company committed to delivering personalized travel experiences that stand out in Kenya's vast tourism market.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-safari-green/10 rounded-full flex items-center justify-center text-safari-green shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Local & International Reach</h4>
                    <p className="text-stone-500 text-sm">Serving over 400 monthly bookings, we cater to both local explorers and international visitors seeking the untamed heart of Africa.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-safari-green/10 rounded-full flex items-center justify-center text-safari-green shrink-0">
                    <Compass size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Diverse Packages</h4>
                    <p className="text-stone-500 text-sm">From breathtaking safaris in the Maasai Mara to insightful Nairobi city tours, our packages are designed for true immersion.</p>
                  </div>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed">
                In an industry of modern safari agencies, we remain the preferred choice by focusing on tailored relationships. Our transition to this advanced CRM system ensures we move beyond manual processes to offer the most responsive and personalized service in the sector.
              </p>
              <a href="#inquiry" className="btn-primary inline-block">Plan Your Personalized Tour</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="experiences" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl mb-4">Unforgettable Experiences</h2>
          <p className="text-stone-500">We pride ourselves on providing the most authentic and sustainable safari experiences in East Africa.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature 
            icon={MapPin} 
            title="Expert Guides" 
            description="Our local guides have decades of experience tracking wildlife and sharing the rich history of the land."
          />
          <Feature 
            icon={Camera} 
            title="Photography Safaris" 
            description="Specialized tours designed for photographers of all levels to capture the perfect shot of the Big Five."
          />
          <Feature 
            icon={Utensils} 
            title="Luxury Dining" 
            description="Enjoy gourmet meals under the stars, prepared by world-class chefs using fresh, local ingredients."
          />
        </div>
      </section>

      {/* Destinations Preview */}
      <section id="destinations" className="py-24 bg-safari-green text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl text-white mb-4">Iconic Kenyan Destinations</h2>
              <p className="text-stone-400">Explore the most breathtaking landscapes and wildlife sanctuaries across the region.</p>
            </div>
            <button className="flex items-center gap-2 text-safari-gold hover:text-white transition-colors">
              Explore All <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Maasai Mara', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000', price: 'From $1,200' },
              { name: 'Amboseli', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000', price: 'From $950' },
              { name: 'Serengeti', img: 'https://images.unsplash.com/photo-1534171472159-edb6d1e0b63c?auto=format&fit=crop&q=80&w=1000', price: 'From $1,500' },
              { name: 'Tsavo East & West', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=1000', price: 'From $850' },
              { name: 'Samburu Reserve', img: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&q=80&w=1000', price: 'From $1,100' },
              { name: 'Diani Beach', img: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000', price: 'From $700' },
            ].map((dest, i) => (
              <div key={i} className="group cursor-pointer overflow-hidden rounded-3xl relative aspect-[4/5]">
                <img 
                  src={dest.img} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-safari-green to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-serif text-white mb-1">{dest.name}</h3>
                  <p className="text-safari-gold font-medium">{dest.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-safari-sand">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-safari-gold font-bold uppercase tracking-widest text-sm">Guest Reviews</span>
            <h2 className="text-4xl mt-4">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Jenkins",
                location: "London, UK",
                text: "The Maasai Mara safari was beyond my wildest dreams. Safaris&Tours Ltd handled every detail perfectly. Our guide was incredibly knowledgeable!",
                avatar: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                name: "David Mwangi",
                location: "Nairobi, Kenya",
                text: "As a local, I've been on many tours, but the personalized service from Safaris&Tours is unmatched. Their Westlands team is top-notch.",
                avatar: "https://i.pravatar.cc/150?u=david"
              },
              {
                name: "Elena Rodriguez",
                location: "Madrid, Spain",
                text: "Luxury dining under the stars in Amboseli was the highlight of our honeymoon. Thank you for making it so special!",
                avatar: "https://i.pravatar.cc/150?u=elena"
              }
            ].map((t, i) => (
              <div key={i} className="glass-card p-8 relative">
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-safari-gold" />
                  <div>
                    <h4 className="font-bold text-stone-800">{t.name}</h4>
                    <p className="text-xs text-stone-500">{t.location}</p>
                  </div>
                </div>
                <p className="text-stone-600 italic leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1 mt-4 text-safari-gold">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-24 max-w-3xl mx-auto px-6">
        <div className="glass-card p-12">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-safari-green/10 rounded-full flex items-center justify-center text-safari-green mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl mb-4">Inquiry Received!</h2>
              <p className="text-stone-600 mb-8">
                Thank you for reaching out. One of our safari experts will contact you within 24 hours to help plan your adventure.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="btn-primary"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl mb-2">Plan Your Journey</h2>
                <p className="text-stone-500">Tell us about your dream safari and we'll handle the rest.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Full Name</label>
                    <input name="name" required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-safari-green outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Email Address</label>
                    <input name="email" required type="email" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-safari-green outline-none" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Destination of Interest</label>
                  <select name="destination" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-safari-green outline-none bg-white">
                    <option>Maasai Mara National Reserve</option>
                    <option>Amboseli National Park</option>
                    <option>Serengeti National Park</option>
                    <option>Tsavo East & West</option>
                    <option>Samburu National Reserve</option>
                    <option>Lake Nakuru National Park</option>
                    <option>Diani Beach</option>
                    <option>Ol Pejeta Conservancy</option>
                    <option>Other / Not Sure</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Message</label>
                  <textarea name="message" required className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-safari-green outline-none h-32 resize-none" placeholder="Tell us about your group size, preferred dates, and interests..."></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Compass className="text-safari-gold" size={32} />
              <span className="font-serif text-2xl">Safaris&Tours</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Crafting bespoke safari experiences since 2015. We are committed to sustainable tourism and wildlife conservation.
            </p>
            <div className="flex gap-4 text-stone-400">
              <Instagram size={20} className="hover:text-safari-gold cursor-pointer" />
              <Facebook size={20} className="hover:text-safari-gold cursor-pointer" />
              <Twitter size={20} className="hover:text-safari-gold cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Destinations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Special Offers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-stone-400 text-sm">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-safari-gold" />
                Westlands, Nairobi, Kenya
              </li>
              <li>info@safaristours.com</li>
              <li>+254 700 000 000</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Newsletter</h4>
            <p className="text-stone-400 text-sm mb-4">Get the latest safari news and offers.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm flex-1 outline-none focus:border-safari-gold" />
              <button className="bg-safari-gold text-white px-4 py-2 rounded-xl text-sm font-bold">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-stone-500 text-xs">
          © 2026 Safaris&Tours Limited. All rights reserved. | Kenya Data Protection Act Compliant
        </div>
      </footer>
    </div>
  );
}
