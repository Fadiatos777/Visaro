"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { ExternalLink } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id}
                    className="group rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: "#0C0D0D", 
                      borderColor: "#1A1B1B"
                    }}
                  >
                    {item.image_url ? (
                      <div className="aspect-video bg-gray-800 overflow-hidden">
                        <Image 
                          src={item.image_url} 
                          alt={item.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div 
                        className="aspect-video flex items-center justify-center"
                        style={{ backgroundColor: "#1A1B1B" }}
                      >
                        <span className="text-4xl font-bold" style={{ color: "#509887" }}>
                          {item.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "#1A1B1B", color: "#509887" }}>
                          {item.category}
                        </span>
                        {item.project_url && (
                          <a 
                            href={item.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3" style={{ color: "#E7E7E7" }}>
                        {item.title}
                      </h3>
                      
                      <p className="mb-4 leading-relaxed" style={{ color: "#8C8D8D" }}>
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
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}