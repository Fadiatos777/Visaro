"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { ExternalLink } from "lucide-react";
import { supabase } from "../../lib/supabase";
import RevealCard from "../components/RevealCard";
import CardsRow from "../components/CardsRow";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  category: string;
  technologies: string[];
  is_featured: boolean;
}

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('order_index');
      
      if (data) {
        setPortfolioItems(data);
      }
      setLoading(false);
    }
    
    fetchPortfolio();
  }, []);

  const categories = ["All", ...Array.from(new Set(portfolioItems.map(item => item.category)))];
  const filteredItems = selectedCategory === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "#509887" }}></div>
            <p style={{ color: "#8C8D8D" }}>Loading portfolio...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight">
              <span style={{ color: "#E7E7E7" }}>Our</span>
              <br />
              <span style={{ color: "#509887" }}>Portfolio</span>
            </h1>
            
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#8C8D8D" }}>
              Explore our latest projects and see how we've helped Los Santos businesses 
              achieve their digital goals through innovative solutions.
            </p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? "#509887" : "#0C0D0D",
                    color: selectedCategory === category ? "#090A0A" : "#8C8D8D",
                    border: `1px solid ${selectedCategory === category ? "#509887" : "#1A1B1B"}`
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl" style={{ color: "#8C8D8D" }}>
                  {selectedCategory === "All" 
                    ? "Our portfolio is being updated. Check back soon for our latest work!"
                    : `No projects found in the ${selectedCategory} category.`
                  }
                </p>
              </div>
            ) : (
              <CardsRow count={filteredItems.length}>
                {filteredItems.map((item) => (
                  <RevealCard
                    key={item.id}
                    imageUrl={item.image_url || undefined}
                    title={item.title}
                    subtitle={item.category}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    <p className="mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: "#1A1B1B", color: "#8C8D8D" }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    {item.project_url && (
                      <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm" style={{ color: "#509887" }}>
                        <ExternalLink size={16} /> Visit project
                      </a>
                    )}
                  </RevealCard>
                ))}
              </CardsRow>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}