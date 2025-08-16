"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { supabase } from "../../lib/supabase";
import RevealCard from "../components/RevealCard";
import CardsRow from "../components/CardsRow";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  order_index: number;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_index');
      
      if (data) {
        setTeamMembers(data);
      }
      setLoading(false);
    }
    
    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "#509887" }}></div>
            <p style={{ color: "#8C8D8D" }}>Loading team...</p>
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
              <span style={{ color: "#E7E7E7" }}>Meet the</span>
              <br />
              <span style={{ color: "#509887" }}>Visaro Team</span>
            </h1>
            
            <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#8C8D8D" }}>
              The talented individuals behind Los Santos' most innovative digital solutions. 
              Each team member brings unique expertise and passion to every project.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {teamMembers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl" style={{ color: "#8C8D8D" }}>
                  Our team profiles are being updated. Check back soon!
                </p>
              </div>
            ) : (
              <CardsRow count={teamMembers.length}>
                {teamMembers.map((member) => (
                  <RevealCard
                    key={member.id}
                    imageUrl={member.image_url || undefined}
                    title={member.name}
                    subtitle={member.role}
                    isOpen={openId === member.id}
                    onToggle={() => setOpenId(openId === member.id ? null : member.id)}
                  >
                    {member.bio}
                  </RevealCard>
                ))}
              </CardsRow>
            )}
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
              Want to Join Our Team?
            </h2>
            <p className="text-xl mb-8" style={{ color: "#8C8D8D" }}>
              We're always looking for talented individuals who share our passion for excellence
            </p>
            <a 
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              View Open Positions
            </a>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}