"use client";

import Image from "next/image";
import { useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    discord: "",
    gtaUsername: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [fieldError, setFieldError] = useState<{ phone?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setFieldError({});
    
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const isPhoneValid = /^\d{3,}$/.test(phoneDigits);

    if (!isPhoneValid) {
      setSubmitting(false);
      setFieldError({ phone: "Phone must contain digits only (minimum 3 digits)." });
      setStatus({ ok: false, message: "Please fix the highlighted fields." });
      return;
    }
    
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: phoneDigits,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setStatus({ ok: true, message: "Submitted! We'll be in touch." });
      setSubmitted(true);
      setFormData({ fullName: "", phone: "", discord: "", gtaUsername: "", notes: "" });
    } catch (err: any) {
      setStatus({ ok: false, message: err.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen pt-24">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight">
                <span style={{ color: "#E7E7E7" }}>Let's Build</span>
                <br />
                <span style={{ color: "#509887" }}>Something Amazing</span>
              </h1>
              
              <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: "#8C8D8D" }}>
                Ready to transform your vision into reality? Get in touch with our team 
                and let's discuss how we can help your business thrive in the digital world.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <Image 
                src="/Visaro.png" 
                alt="Visaro logo" 
                width={96} 
                height={96} 
                priority 
                style={{
                  transform: submitted ? "translateY(120px) scale(1.65)" : "translateY(0) scale(1)",
                  transition: "transform 800ms ease, filter 800ms ease",
                  filter: submitted ? "drop-shadow(0 8px 40px rgba(80,152,135,0.25))" : "none",
                }} 
              />
              
              <h2 className="text-center text-3xl sm:text-4xl font-semibold" style={{ 
                color: "#8C8D8D", 
                transform: submitted ? "translateY(110px) scale(1.1)" : "translateY(0) scale(1)", 
                transition: "transform 800ms ease" 
              }}>
                Shape your idea into reality now!
              </h2>
              
              <p className="text-center text-sm sm:text-base max-w-xl" style={{ 
                color: "#8C8D8D", 
                opacity: submitted ? 0 : 1, 
                transition: "opacity 500ms ease" 
              }}>
                Where vision meets structure. Tell us a bit about you and we'll reach out.
              </p>
            </div>

            {/* Thank you message */}
            <div aria-live="polite" className="flex justify-center mt-6">
              <p className="text-center text-lg sm:text-xl font-semibold"
                style={{
                  color: "#8C8D8D",
                  lineHeight: 1.6,
                  opacity: submitted ? 1 : 0,
                  transform: submitted ? "translateY(110px)" : "translateY(0)",
                  transition: "opacity 600ms ease, transform 800ms ease",
                }}
              >
                Thank you for choosing us, we'll get back to you as soon as possible!
              </p>
            </div>

            <div className="relative" style={{ minHeight: 320 }}>
              <form 
                onSubmit={handleSubmit} 
                className="rounded-2xl p-6 sm:p-8" 
                style={{ 
                  backgroundColor: "#0C0D0D", 
                  border: "1px solid #1A1B1B", 
                  opacity: submitted ? 0 : 1, 
                  transform: submitted ? "translateY(12px)" : "translateY(0)", 
                  transition: "opacity 500ms ease, transform 500ms ease" 
                }}
              >
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#8C8D8D" }}>Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      placeholder="John Doe"
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg px-4 py-3 bg-black/40 outline-none focus:ring-2"
                      style={{ color: "#E7E7E7", border: "1px solid #1F2020", caretColor: "#509887" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#8C8D8D" }}>Phone Number</label>
                    <input
                      required
                      type="tel"
                      inputMode="numeric"
                      value={formData.phone}
                      placeholder="12345678"
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({ ...formData, phone: digitsOnly });
                      }}
                      className="w-full rounded-lg px-4 py-3 bg-black/40 outline-none focus:ring-2"
                      style={{ 
                        color: "#E7E7E7", 
                        border: `1px solid ${fieldError.phone ? "#991B1B" : "#1F2020"}`, 
                        caretColor: "#509887" 
                      }}
                    />
                    {fieldError.phone && (
                      <p className="mt-2 text-sm" style={{ color: "#FECACA" }}>{fieldError.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#8C8D8D" }}>(( Discord ))</label>
                    <input
                      required
                      type="text"
                      placeholder="username"
                      value={formData.discord}
                      onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                      className="w-full rounded-lg px-4 py-3 bg-black/40 outline-none focus:ring-2"
                      style={{ color: "#E7E7E7", border: "1px solid #1F2020", caretColor: "#509887" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#8C8D8D" }}>(( GTA:W Username ))</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Panda"
                      value={formData.gtaUsername}
                      onChange={(e) => setFormData({ ...formData, gtaUsername: e.target.value })}
                      className="w-full rounded-lg px-4 py-3 bg-black/40 outline-none focus:ring-2"
                      style={{ color: "#E7E7E7", border: "1px solid #1F2020", caretColor: "#509887" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#8C8D8D" }}>Project Details</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.notes}
                      placeholder="Tell us about your project, goals, and any specific requirements..."
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full rounded-lg px-4 py-3 bg-black/40 outline-none focus:ring-2 resize-y"
                      style={{ color: "#E7E7E7", border: "1px solid #1F2020", caretColor: "#509887" }}
                    />
                  </div>
              
                  {status && !submitted && (
                    <div
                      className={`text-sm px-4 py-3 rounded-lg`}
                      style={{
                        color: status.ok ? "#D1FAE5" : "#FECACA",
                        backgroundColor: status.ok ? "#064E3B" : "#7F1D1D",
                        border: `1px solid ${status.ok ? "#065F46" : "#991B1B"}`,
                      }}
                    >
                      {status.message}
                    </div>
                  )}
              
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 inline-flex items-center justify-center rounded-lg px-5 py-3 font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: submitting ? "#396F62" : "#509887",
                      color: "#090A0A",
                      opacity: submitting ? 0.9 : 1,
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}