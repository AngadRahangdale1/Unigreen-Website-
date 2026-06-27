import { useState, useRef } from "react";
import { Send, ArrowRight } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function ContactSection() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false,
    errorMessage: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false, errorMessage: "" });

    try {
      const templateParams = {
        name: formData.name,
        user_name: formData.name,
        email: formData.email,
        user_email: formData.email,
        message: formData.message,
        to_email: "subhamsahoo@unigreenin.in",
      };

      const result = await emailjs.send(
        "service_2c11aty",
        "template_2rkdze9",
        templateParams,
        "onTxtGmFd8P0xyElT"
      );

      if (result.status === 200) {
        setStatus({ loading: false, success: true, error: false, errorMessage: "" });
        setFormData({ name: "", email: "", message: "" });
        if (formRef.current) {
          formRef.current.reset();
        }
      } else {
        setStatus({ loading: false, success: false, error: true, errorMessage: "Failed to send email." });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus({
        loading: false,
        success: false,
        error: true,
        errorMessage: err?.text || err?.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <section
      id="contact"
      className="py-28 px-6 lg:px-10 bg-black relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 102, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Corporate Info & Visual Accent */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div
            className="text-xs font-semibold tracking-widest text-[#00FF66] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            — Get In Touch —
          </div>
          <h2 className="font-['Bricolage_Grotesque'] font-extrabold text-4xl md:text-5xl text-white leading-tight">
            Let's Collaborate on Your Next Campaign.
          </h2>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed font-light">
            Partner with <strong className="text-white font-semibold">Unigreen Internationals Pvt. Ltd.</strong> to build organic word-of-mouth, scale your digital strategy, and unlock verified business growth.
          </p>
          <div className="w-16 h-1 bg-[#00FF66] rounded-full mt-2" />
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div
            className="p-8 md:p-10 rounded-3xl border border-white/5 bg-neutral-900/30 backdrop-blur-xl relative overflow-hidden"
            style={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}
          >
            {/* Subtle top light gradient */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-xs font-bold tracking-wider uppercase text-neutral-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-5 py-4 rounded-xl text-white text-sm outline-none transition-all duration-300 border border-white/10 bg-white/5"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00FF66";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,255,102,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold tracking-wider uppercase text-neutral-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Work Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-5 py-4 rounded-xl text-white text-sm outline-none transition-all duration-300 border border-white/10 bg-white/5"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00FF66";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,255,102,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="text-xs font-bold tracking-wider uppercase text-neutral-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your brand, goals, and target audience..."
                  className="w-full px-5 py-4 rounded-xl text-white text-sm outline-none transition-all duration-300 border border-white/10 bg-white/5 resize-none"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#00FF66";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(0,255,102,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Status Message Overlay / Inline block */}
              {status.loading && (
                <div className="text-sm font-semibold text-[#00FF66] animate-pulse">
                  Sending...
                </div>
              )}
              {status.success && (
                <div className="text-sm font-semibold text-[#00FF66]">
                  ✅ Message sent! We'll get back to you soon.
                </div>
              )}
              {status.error && (
                <div className="text-sm font-semibold text-red-500">
                  ❌ {status.errorMessage || "Something went wrong. Please try again."}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.loading}
                className="w-full md:w-auto self-start mt-2 px-8 py-4 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  background: "#00FF66",
                  boxShadow: "0 0 20px rgba(0,255,102,0.3)",
                }}
              >
                {status.loading ? "Sending..." : "Submit Enquiry"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
