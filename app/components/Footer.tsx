import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/Visaro.png" alt="Visaro" width={40} height={40} />
              <span className="text-2xl font-semibold text-white">Visaro</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Where vision meets structure. We transform ideas into exceptional digital experiences 
              for the Los Santos business community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/team" className="block text-gray-400 hover:text-white transition-colors">
                Our Team
              </Link>
              <Link href="/portfolio" className="block text-gray-400 hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link href="/careers" className="block text-gray-400 hover:text-white transition-colors">
                Careers
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Web Development</p>
              <p className="text-gray-400">Mobile Apps</p>
              <p className="text-gray-400">Branding</p>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Visaro. All rights reserved. Los Santos, San Andreas.</p>
        </div>
      </div>
    </footer>
  );
}