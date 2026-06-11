import React from "react";
import Dogmarquee from "../assets/Dogmarquee.mp4";
import Catmarquee from "../assets/Catmarquee.mp4";
import Birdmarquee from "../assets/Birdmarquee.mp4";
import Fishmarquee from "../assets/Fishmarquee.mp4";
import Bunnymarquee from "../assets/Bunnymarquee.mp4";
import Dogtrainingmarquee from "../assets/Dogtrainingmarquee.mp4";
import Groomingmarquee from "../assets/Groomingmarquee.mp4";
import petfoodmarquee from "../assets/petfoodmarquee.mp4";

const PetMarquee = () => {
  const [stopScroll, setStopScroll] = React.useState(false);

  const cardData = [
    { title: "Adopt a Best Friend 🐶", video: Dogmarquee },
    { title: "Caring Cats Need Homes 🐱", video: Catmarquee },
    { title: "Playful Birds for Your Family 🦜", video: Birdmarquee },
    { title: "Beautiful Fish for Your Aquarium 🐠", video: Fishmarquee },
    { title: "Bunny Hopping with Joy 🐰", video: Bunnymarquee },
    { title: "Dog Training & Activities 🦮🎯", video: Dogtrainingmarquee },
    { title: "Pet Grooming & Care 🧼✨", video: Groomingmarquee },
    { title: "Pet Food & Supplies Nearby 🍗🛍️", video: petfoodmarquee },
  ];

  return (
    <>
      <style>{`
        .marquee-inner {
          display: flex;
          align-items: center;
          animation: marqueeScroll linear infinite;
          will-change: transform;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .card {
          flex-shrink: 0;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        @media (max-width: 640px) {
          .card { width: 12rem; height: 14rem; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .card { width: 16rem; height: 18rem; }
        }
        @media (min-width: 1024px) {
          .card { width: 20rem; height: 22rem; }
        }
      `}</style>

      <div
        className="relative w-full py-16 overflow-hidden bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100"
        onMouseEnter={() => setStopScroll(true)}
        onMouseLeave={() => setStopScroll(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-10 text-center text-gray-800 drop-shadow-sm">
          Discover Our Pet World 🎬
        </h2>

        <div
          className="marquee-inner w-fit"
          style={{
            animationPlayState: stopScroll ? "paused" : "running",
            animationDuration: `${cardData.length * 5}s`,
          }}
        >
          {[...cardData, ...cardData].map((card, index) => (
            <div
              key={index}
              className="card mx-3 sm:mx-4 relative group cursor-pointer shadow-md hover:shadow-xl hover:scale-[0.97] bg-white/10 border border-white/30 backdrop-blur-md"
            >
              <video
                src={card.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-start p-4">
                <p className="text-white text-sm sm:text-base md:text-lg font-semibold drop-shadow-lg">
                  {card.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-blue-100 via-blue-100/50 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-pink-100 via-pink-100/50 to-transparent pointer-events-none"></div>
      </div>
    </>
  );
};

export default PetMarquee;
