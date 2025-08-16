"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { supabase } from "../../lib/supabase";

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="group p-8 rounded-2xl border transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: "#0C0D0D", 
                      borderColor: "#1A1B1B"
                    }}
                  >
                    <div className="text-center">
                      {member.image_url ? (
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                          <Image 
                            src={member.image_url} 
                            alt={member.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold"
                          style={{ backgroundColor: "#509887", color: "#090A0A" }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-semibold mb-2" style={{ color: "#E7E7E7" }}>
                        {member.name}
                      </h3>
                      
                      <p className="text-lg mb-4" style={{ color: "#509887" }}>
                        {member.role}
                      </p>
                      
                      <p className="leading-relaxed" style={{ color: "#8C8D8D" }}>
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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