import Image from "next/image";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Users, Target, Lightbulb, Rocket } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every line of code, every design element, every user interaction is crafted with meticulous attention to detail."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We stay ahead of technology trends to deliver cutting-edge solutions that give our clients a competitive advantage."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We work closely with our clients as partners, ensuring their vision is perfectly translated into digital reality."
    },
    {
      icon: Rocket,
      title: "Results",
      description: "Our success is measured by our clients' success. We deliver solutions that drive real business growth."
    }
  ];

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight">
                  <span style={{ color: "#E7E7E7" }}>Building the</span>
                  <br />
                  <span style={{ color: "#509887" }}>Digital Future</span>
                  <br />
                  <span style={{ color: "#E7E7E7" }}>of Los Santos</span>
                </h1>
                
                <p className="text-xl mb-8 leading-relaxed" style={{ color: "#8C8D8D" }}>
                  Founded in the heart of Los Santos, Visaro emerged from a simple belief: 
                  that exceptional digital experiences should be accessible to every business, 
                  regardless of size or industry.
                </p>
                
                <p className="text-lg leading-relaxed" style={{ color: "#8C8D8D" }}>
                  We combine technical expertise with creative vision to deliver solutions 
                  that don't just meet expectations—they exceed them. Our team of passionate 
                  developers, designers, and strategists work tirelessly to ensure every 
                  project reflects our commitment to excellence.
                </p>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className="p-8 rounded-2xl border"
                  style={{ 
                    backgroundColor: "#0C0D0D", 
                    borderColor: "#1A1B1B",
                    boxShadow: "0 8px 40px rgba(80,152,135,0.15)"
                  }}
                >
                  <Image 
                    src="/Visaro.png" 
                    alt="Visaro team" 
                    width={300} 
                    height={300}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: "#E7E7E7" }}>
              Our Mission
            </h2>
            <p className="text-2xl leading-relaxed" style={{ color: "#8C8D8D" }}>
              To empower Los Santos businesses with world-class digital solutions that 
              drive growth, enhance user experiences, and create lasting competitive advantages 
              in an increasingly digital world.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#E7E7E7" }}>
                Our Values
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: "#8C8D8D" }}>
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="p-8 rounded-2xl border transition-all duration-300 hover:scale-105"
                  style={{ 
                    backgroundColor: "#0C0D0D", 
                    borderColor: "#1A1B1B"
                  }}
                >
                  <value.icon size={48} style={{ color: "#509887" }} className="mb-6" />
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: "#E7E7E7" }}>
                    {value.title}
                  </h3>
                  <p style={{ color: "#8C8D8D" }} className="leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center" style={{ color: "#E7E7E7" }}>
              Our Story
            </h2>
            
            <div className="space-y-8 text-lg leading-relaxed" style={{ color: "#8C8D8D" }}>
              <p>
              Visaro was born from the vision of Marvin Clayton, our CEO & Managing Director, 
              who set out to bridge the gap between ambitious ideas and exceptional execution. 
              With a keen eye for innovation and a deep understanding of how technology can 
              transform businesses, Marvin established Visaro in the heart of Los Santos to be 
              more than just a consultancy—it was to be a trusted digital partner.
              </p>
              
              <p>
              What began as a small team under Marvin’s leadership quickly grew into Los Santos' 
              most reliable tech consultancy. Guided by his belief  in blending creativity with 
              technical excellence, we’ve had the privilege of working 
              with startups taking their first digital steps, established enterprises 
              modernizing their operations, and everything in between.
              </p>
              
              <p>
              Today, we continue to push boundaries, embrace new technologies, and 
              most importantly, deliver results that matter. Every project is an opportunity to 
              create something extraordinary, and we approach each one with the same enthusiasm 
              and dedication that Marvin envisioned from day one.
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}