"use client";

import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { MapPin, Clock, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import RevealCard from "../components/RevealCard";
import CardsRow from "../components/CardsRow";

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
}

export default function Careers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCareers() {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        setCareers(data);
      }
      setLoading(false);
    }
    
    fetchCareers();
  }, []);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "#509887" }}></div>
            <p style={{ color: "#8C8D8D" }}>Loading careers...</p>
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
              <span style={{ color: "#E7E7E7" }}>Join Our</span>
              <br />
              <span style={{ color: "#509887" }}>Growing Team</span>
            </h1>
            
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#8C8D8D" }}>
              Be part of Los Santos' most innovative tech consultancy. We're looking for 
              passionate individuals who want to shape the future of digital experiences.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#E7E7E7" }}>
              Why Work at Visaro?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#509887" }}>
                  <Briefcase size={32} style={{ color: "#090A0A" }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#E7E7E7" }}>
                  Cutting-Edge Projects
                </h3>
                <p style={{ color: "#8C8D8D" }}>
                  Work on innovative projects using the latest technologies and frameworks
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#509887" }}>
                  <Clock size={32} style={{ color: "#090A0A" }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#E7E7E7" }}>
                  Flexible Schedule
                </h3>
                <p style={{ color: "#8C8D8D" }}>
                  Work-life balance with flexible hours and remote work options
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#509887" }}>
                  <MapPin size={32} style={{ color: "#090A0A" }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#E7E7E7" }}>
                  Los Santos Based
                </h3>
                <p style={{ color: "#8C8D8D" }}>
                  Be part of the thriving Los Santos tech scene with local networking opportunities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#E7E7E7" }}>
              Open Positions
            </h2>
            {careers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl mb-6" style={{ color: "#8C8D8D" }}>
                  No open positions at the moment, but we're always interested in hearing from talented individuals.
                </p>
                <a 
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: "#509887", color: "#090A0A" }}
                >
                  Get in Touch
                </a>
              </div>
            ) : (
              <CardsRow count={careers.length}>
                {careers.map((job) => (
                  <RevealCard
                    key={job.id}
                    title={job.title}
                    subtitle={`${job.department} • ${job.location} • ${job.type}`}
                    isOpen={expandedJob === job.id}
                    onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <h4 className="text-lg font-semibold mb-2" style={{ color: "#E7E7E7" }}>Description</h4>
                    <p className="mb-4">{job.description}</p>
                    <h4 className="text-lg font-semibold mb-2" style={{ color: "#E7E7E7" }}>Requirements</h4>
                    <ul className="space-y-2 mb-4">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2" style={{ color: "#8C8D8D" }}>
                          <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#509887" }}></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                    <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105" style={{ backgroundColor: "#509887", color: "#090A0A" }}>Apply Now</a>
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