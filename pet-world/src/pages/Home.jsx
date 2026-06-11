// src/pages/Home.jsx
import React from "react";
import OfferBanner from "../components/OfferBanner";
import HeroIntro from "../components/HeroIntro";  // ✅ New import
import HeroSection from "../components/HeroSection";
import Pics from "../components/Pics";
import PetMarquee from "../components/PetMarquee";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <OfferBanner />
      <Pics />
      <PetMarquee />       {/* scrolling videos or pets */}
      <HeroIntro />        {/* ✅ new intro page */}
      <HeroSection />      {/* animated pet sections */}
      <Footer/>
    </div>
  );
};

export default Home;
