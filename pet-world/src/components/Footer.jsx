import React from "react";
import LOGO from "../assets/Logo.jpg";

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <footer className="flex flex-col items-center justify-center w-full py-16 px-4 sm:px-8 bg-gradient-to-b from-[#512DA8] to-[#2A0E57] text-white/80">
        {/* 🐾 Logo Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <img
              src={LOGO}
              alt="Pet World"
              className="w-10 h-10 rounded-full shadow-md"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Pet<span className="text-pink-400">World</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-white/70 max-w-md">
            Your one-stop destination for pet adoption, care, food, and supplies.
            Bringing love and joy to every home. 🐶🐱🐦🐠🐰
          </p>
        </div>

        {/* 🐕 Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10 text-sm sm:text-base font-medium">
          <a href="/shop" className="hover:text-white transition-colors">
            🛍️ Shop
          </a>
          <a href="/adopt" className="hover:text-white transition-colors">
            🐾 Adopt
          </a>
          <a href="/services" className="hover:text-white transition-colors">
            ✂️ Grooming
          </a>
          <a href="/contact" className="hover:text-white transition-colors">
            📞 Contact
          </a>
          <a href="/about" className="hover:text-white transition-colors">
            💖 About Us
          </a>
        </div>

        {/* 🌐 Social Icons */}
        <div className="flex items-center gap-5 mt-10">
          {[
            {
              href: "https://facebook.com",
              path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
            },
            {
              href: "https://instagram.com",
              path: "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5",
              extra:
                "M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01",
            },
            {
              href: "https://twitter.com",
              path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2",
            },
          ].map((icon, i) => (
            <a
              key={i}
              href={icon.href}
              target="_blank"
              rel="noreferrer"
              className="hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={icon.path}
                  stroke="#fff"
                  strokeOpacity=".6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {icon.extra && (
                  <path
                    d={icon.extra}
                    stroke="#fff"
                    strokeOpacity=".6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </a>
          ))}
        </div>

        {/* 🐾 Bottom Note */}
        <div className="mt-10 text-center text-xs sm:text-sm text-white/60">
          © 2025 <span className="text-white">PetWorld</span>. All rights
          reserved. Crafted with 🐾 love for pets everywhere.
        </div>
      </footer>
    </>
  );
}
