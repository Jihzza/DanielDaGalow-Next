// components/home-sections/OtherWins.jsx
"use client"; // Needed for Swiper and potentially hooks

import React from "react";
import Image from 'next/image'; // Import next/image
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination"; // Keep if using pagination
const socialMediaImages = [
  { image: "/assets/img/Tiktok/TikTok13.png", link: "https://www.tiktok.com/@galo_portugues/video/7172247525540334854" },
  { image: "/assets/img/Tiktok/TikTok19.png", link: "https://www.tiktok.com/@galo_portugues/video/7188496959748001030" },
  { image: "/assets/img/Tiktok/TikTok3.png", link: "https://www.tiktok.com/@galo_portugues/video/7149949788912504069" },
  { image: "/assets/img/Tiktok/TikTok4.png", link: "https://www.tiktok.com/@galo_portugues/video/7319997405875719456" },
  { image: "/assets/img/Tiktok/TikTok5.png", link: "https://www.tiktok.com/@galo_portugues/video/7069121685437566213" },
  { image: "/assets/img/Tiktok/TikTok6.png", link: "https://www.tiktok.com/@galo_portugues/video/7172986842680233222" },
  { image: "/assets/img/Tiktok/TikTok7.png", link: "https://www.tiktok.com/@galo_portugues/video/7086223291626622214" },
  { image: "/assets/img/Tiktok/TikTok8.png", link: "https://www.tiktok.com/@galo_portugues/video/7188941851527744774" },
  { image: "/assets/img/Tiktok/TikTok9.png", link: "https://www.tiktok.com/@galo_portugues/video/7172852623224130821" },
  { image: "/assets/img/Tiktok/TikTok10.png", link: "https://www.tiktok.com/@galo_portugues/video/7152008606173515014" },
  { image: "/assets/img/Tiktok/TikTok11.png", link: "https://www.tiktok.com/@galo_portugues/video/7346480566998469920" },
  { image: "/assets/img/Tiktok/TikTok12.png", link: "https://www.tiktok.com/@galo_portugues/video/7172269860284550405" },
  { image: "/assets/img/Tiktok/TikTok1.png", link: "https://www.tiktok.com/@galo_portugues/video/7069126152278854918" },
  { image: "/assets/img/Tiktok/TikTok14.png", link: "https://www.tiktok.com/@galo_portugues/video/7172250969269472517" },
  { image: "/assets/img/Tiktok/TikTok15.png", link: "https://www.tiktok.com/@galo_portugues/video/7189354490376523013" },
  { image: "/assets/img/Tiktok/TikTok16.png", link: "https://www.tiktok.com/@galo_portugues/video/7158439224776117510" },
  { image: "/assets/img/Tiktok/TikTok17.png", link: "https://www.tiktok.com/@galo_portugues/video/7202375791575829766" },
  { image: "/assets/img/Tiktok/TikTok18.png", link: "https://www.tiktok.com/@galo_portugues/video/7150561631989222661" },
  { image: "/assets/img/Tiktok/TikTok2.png", link: "https://www.tiktok.com/@galo_portugues/video/7344661288200457505" },
  { image: "/assets/img/Twitter/Twitter37.png", link: "https://x.com/galo_portugues/status/1774914680693084319" },
  { image: "/assets/img/Twitter/Twitter1.png", link: "https://x.com/galo_portugues/status/1610017119252389888" },
  { image: "/assets/img/Twitter/Twitter2.png", link: "https://x.com/galo_portugues/status/1610780921111740424" },
  { image: "/assets/img/Twitter/Twitter3.png", link: "https://x.com/galo_portugues/status/1612519780547706880" },
  { image: "/assets/img/Twitter/Twitter4.png", link: "https://x.com/galo_portugues/status/1612540968967741449" },
  { image: "/assets/img/Twitter/Twitter5.png", link: "https://x.com/galo_portugues/status/1612924472088219648" },
  { image: "/assets/img/Twitter/Twitter6.png", link: "https://x.com/galo_portugues/status/1612870732031135759" },
  { image: "/assets/img/Twitter/Twitter7.png", link: "https://x.com/galo_portugues/status/1613169414412668928" },
  { image: "/assets/img/Twitter/Twitter8.png", link: "https://x.com/galo_portugues/status/1613199908579713024" },
  { image: "/assets/img/Twitter/Twitter9.png", link: "https://x.com/galo_portugues/status/1613293969831612457" },
  { image: "/assets/img/Twitter/Twitter10.png", link: "https://x.com/galo_portugues/status/1613259352953221120" },
  { image: "/assets/img/Twitter/Twitter11.png", link: "https://x.com/galo_portugues/status/1613315107605610502" },
  { image: "/assets/img/Twitter/Twitter12.png", link: "https://x.com/galo_portugues/status/1613530446381592578" },
  { image: "/assets/img/Twitter/Twitter13.png", link: "https://x.com/galo_portugues/status/1613600934952865794" },
  { image: "/assets/img/Twitter/Twitter14.png", link: "https://x.com/galo_portugues/status/1613925034225016833" },
  { image: "/assets/img/Twitter/Twitter15.png", link: "https://x.com/galo_portugues/status/1614251694577291266" },
  { image: "/assets/img/Twitter/Twitter16.png", link: "https://x.com/galo_portugues/status/1614346875175424002" },
  { image: "/assets/img/Twitter/Twitter17.png", link: "https://x.com/galo_portugues/status/1614619031134248962" },
  { image: "/assets/img/Twitter/Twitter18.png", link: "https://x.com/galo_portugues/status/1615076490336501782" },
  { image: "/assets/img/Twitter/Twitter19.png", link: "https://x.com/galo_portugues/status/1615088749943160848" },
  { image: "/assets/img/Twitter/Twitter20.png", link: "https://x.com/galo_portugues/status/1614669875586437122" },
  { image: "/assets/img/Twitter/Twitter21.png", link: "https://x.com/galo_portugues/status/1616209812357877763" },
  { image: "/assets/img/Twitter/Twitter22.png", link: "https://x.com/galo_portugues/status/1622966814954393601" },
  { image: "/assets/img/Twitter/Twitter23.png", link: "https://x.com/galo_portugues/status/1623075900047720449" },
  { image: "/assets/img/Twitter/Twitter24.png", link: "https://x.com/galo_portugues/status/1623111519088136197" },
  { image: "/assets/img/Twitter/Twitter25.png", link: "https://x.com/galo_portugues/status/1623419940643434496" },
  { image: "/assets/img/Twitter/Twitter26.png", link: "https://x.com/galo_portugues/status/1627804993184010241" },
  { image: "/assets/img/Twitter/Twitter27.png", link: "https://x.com/galo_portugues/status/1627653957291069441" },
  { image: "/assets/img/Twitter/Twitter28.png", link: "https://x.com/galo_portugues/status/1627812951112445954" },
  { image: "/assets/img/Twitter/Twitter29.png", link: "https://x.com/galo_portugues/status/1629456908590481410" },
  { image: "/assets/img/Twitter/Twitter30.png", link: "https://x.com/galo_portugues/status/1628031737094631424" },
  { image: "/assets/img/Twitter/Twitter31.png", link: "https://x.com/galo_portugues/status/1629859496607531014" },
  { image: "/assets/img/Twitter/Twitter32.png", link: "https://x.com/galo_portugues/status/1628096895200493568" },
  { image: "/assets/img/Twitter/Twitter33.png", link: "https://x.com/galo_portugues/status/1633180612642103298" },
  { image: "/assets/img/Twitter/Twitter34.png", link: "https://x.com/galo_portugues/status/1740650460871324145" },
  { image: "/assets/img/Twitter/Twitter35.png", link: "https://x.com/galo_portugues/status/1771953368732205323" },
  { image: "/assets/img/Twitter/Twitter36.png", link: "https://x.com/galo_portugues/status/1629883089626320897" },
  { image: "/assets/img/Tiktok/TikTok20.png", link: "https://www.tiktok.com/@galo_portugues/video/7188901762542128389" },
];

function OtherWins() {
  const { t } = useTranslation();

  // Double click handler remains the same
  const handleDoubleClick = (event) => {
    const video = event.target;
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Safari
    else if (video.msRequestFullscreen) video.msRequestFullscreen(); // IE11
  };

  return (
    <section id="other-wins" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-8 px-4 overflow-visible">
        <div className="flex flex-col justify-center space-y-6 items-center">
          <h1 className="text-2xl md:text-4xl text-black font-bold">{t("other_wins.other_wins_title")}</h1>
          <p className="text-lg md:text-2xl text-black">{t("other_wins.body_transformation_title")}</p>
          {/* Body Transformation Video */}
          <video
            src="/assets/vids/Body Transformation.mp4" // Direct path
            autoPlay
            muted
            loop
            playsInline // Important for mobile playback
            onDoubleClick={handleDoubleClick}
            className="w-[50%] object-cover rounded-xl shadow-lg justify-center items-center self-center cursor-pointer"
            // Consider adding poster="/path/to/poster.jpg" for initial frame
          />
          <p className="text-lg md:text-2xl text-black">{t("other_wins.high_reach_content_title")}</p>

          {/* Social Media Swiper */}
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            pagination={{ clickable: true }} // Make sure pagination CSS is loaded if used
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            loopAdditionalSlides={5}
            watchSlidesProgress={true}
            className="w-[40%] testimonial-swiper overflow-visible mx-auto" // Keep original classes
            breakpoints={{ 768: { slidesPerView: 1.3, spaceBetween: 50, }, }}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
          >
            {socialMediaImages.map((item, index) => (
              <SwiperSlide key={index} className="flex justify-center">
                <div className="w-full h-full rounded-xl overflow-hidden"> {/* Added overflow-hidden */}
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {/* Use next/image */}
                    <Image
                      src={item.image} // Direct path
                      alt={`Social Media Content ${index + 1}`}
                      width={300} // Example base width
                      height={500} // Example base height (adjust for TikTok aspect ratio)
                      className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      // Consider adding sizes attribute for responsiveness
                    />
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default OtherWins;