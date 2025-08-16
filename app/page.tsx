"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Code, Smartphone, Palette, HeadphonesIcon, Star, Users, Award } from "lucide-react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { supabase } from "../lib/supabase";

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  technologies: string[];
  is_featured: boolean;
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [clientsRes, portfolioRes] = await Promise.all([
        supabase.from('clients').select('*').eq('is_featured', true).order('order_index'),
        supabase.from('portfolio_items').select('*').eq('is_featured', true).order('order_index').limit(3)
      ]);
      
      if (clientsRes.data) setClients(clientsRes.data);
      if (portfolioRes.data) setPortfolioItems(portfolioRes.data);
    }
    fetchData();
  }, []);

  const services = [
    {
      icon: Code,
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies, optimized for performance and user experience."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive designs that work flawlessly across all devices, ensuring your audience can engage anywhere."
    },
    {
      icon: Palette,
      title: "Branding Packages",
      description: "Complete brand identity solutions including logos, color schemes, and brand guidelines that make you stand out."
    },
    {
      icon: HeadphonesIcon,
      title: "Ongoing Support",
      description: "Dedicated support and maintenance to keep your digital presence running smoothly and up-to-date."
    }
  ];

  const stats = [
    { icon: Users, value: "50+", label: "Happy Clients" },
    { icon: Code, value: "100+", label: "Projects Delivered" },
    { icon: Award, value: "99%", label: "Client Satisfaction" },
    { icon: Star, value: "24/7", label: "Support Available" }
  ];

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <Image 
                  src="/Visaro.png" 
                  alt="Visaro logo" 
                  width={120} 
                  height={120} 
                  priority 
                  className="drop-shadow-lg"
                />
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span style={{ color: "#E7E7E7" }}>Where Vision</span>
                <br />
                <span style={{ color: "#509887" }}>Meets Structure</span>
              </h1>
              
              <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: "#8C8D8D" }}>
                Los Santos' premier tech consultancy. We transform ambitious ideas into 
                exceptional digital experiences that drive real business results.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#509887", color: "#090A0A" }}
                >
                  Start Your Project
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link 
                  href="/portfolio"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold border transition-all duration-200 hover:bg-white/5"
                  style={{ borderColor: "#509887", color: "#509887" }}
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <stat.icon size={32} style={{ color: "#509887" }} />
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: "#E7E7E7" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: "#8C8D8D" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
                Our Services
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: "#8C8D8D" }}>
                Comprehensive digital solutions tailored for the Los Santos business ecosystem
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="p-8 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ 
                    backgroundColor: "#0C0D0D", 
                    borderColor: "#1A1B1B",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                  }}
                >
                  <service.icon size={48} style={{ color: "#509887" }} className="mb-6" />
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: "#E7E7E7" }}>
                    {service.title}
                  </h3>
                  <p style={{ color: "#8C8D8D" }} className="leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Portfolio */}
        {portfolioItems.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
                  Featured Work
                </h2>
                <p className="text-xl max-w-3xl mx-auto" style={{ color: "#8C8D8D" }}>
                  Recent projects that showcase our expertise and commitment to excellence
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolioItems.map((item) => (
                  <div 
                    key={item.id}
                    className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: "#0C0D0D", 
                      borderColor: "#1A1B1B"
                    }}
                  >
                    {item.image_url && (
                      <div className="aspect-video bg-gray-800 overflow-hidden">
                        <Image 
                          src={item.image_url} 
                          alt={item.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-sm mb-2" style={{ color: "#509887" }}>
                        {item.category}
                      </div>
                      <h3 className="text-xl font-semibold mb-3" style={{ color: "#E7E7E7" }}>
                        {item.title}
                      </h3>
                      <p className="mb-4" style={{ color: "#8C8D8D" }}>
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{ backgroundColor: "#1A1B1B", color: "#8C8D8D" }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link 
                  href="/portfolio"
                  className="inline-flex items-center px-8 py-4 rounded-lg font-semibold border transition-all duration-200 hover:bg-white/5"
                  style={{ borderColor: "#509887", color: "#509887" }}
                >
                  View All Projects
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Clients Section */}
        {clients.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
                  Trusted Partners
                </h2>
                <p className="text-xl max-w-3xl mx-auto" style={{ color: "#8C8D8D" }}>
                  Proud to work with leading businesses across Los Santos
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {clients.map((client) => (
                  <div 
                    key={client.id}
                    className="flex items-center justify-center p-6 rounded-xl border transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: "#0C0D0D", 
                      borderColor: "#1A1B1B"
                    }}
                  >
                    {client.logo_url ? (
                      <Image 
                        src={client.logo_url} 
                        alt={client.name}
                        width={120}
                        height={60}
                        className="max-w-full h-auto opacity-70 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="text-lg font-semibold" style={{ color: "#8C8D8D" }}>
                        {client.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl mb-8" style={{ color: "#8C8D8D" }}>
              Let's discuss your project and turn your vision into reality
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-5 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              Get Started Today
              <ArrowRight className="ml-3" size={24} />
            </Link>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}