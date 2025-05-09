// components/home-sections/Hero.jsx
"use client"; // Needed for hooks and client-side libraries

import React, { useState, useContext } from "react";
import Image from "next/image"; // Import next/image
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination"; // Keep if you use pagination in Swiper
import { Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";
import { ServiceContext } from "../../contexts/ServiceContext"; // Adjust path if needed

function Hero() {
  const { t } = useTranslation();
  const { setService, setServiceWithTier } = useContext(ServiceContext);
  const [selectedTier, setSelectedTier] = useState(null); // Default to null, let user select

  // Scroll function remains the same, relies on browser API
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const headerHeight = 56; // Adjust if header height changes
      window.scrollTo({
        top: el.offsetTop - headerHeight,
        behavior: "smooth",
      });
    }
  };

  // Open form function remains the same
  const openForm = (service) => {
    setService(service);
    document
      .getElementById("service-selection") // Ensure this ID exists
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Click handlers for cards/buttons
  const handleCardScroll = (sectionId) => () => scrollTo(sectionId);

  const handleOpenForm = (service) => (e) => {
    e.stopPropagation();
    openForm(service);
  };

  const openCoachingForm = (e) => {
    e.stopPropagation();
    const selectedTierId = selectedTier !== null ? selectedTier : "basic"; // Default if needed
    setServiceWithTier("coaching", selectedTierId);
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTierSelect = (e, tier) => {
    e.stopPropagation();
    setSelectedTier(tier);
  };

  return (
    <section
      id="hero"
      className="p-4 text-white min-h-screen flex flex-col justify-center items-center text-center overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-center md:py-4 lg:py-2 space-x-2">
        <h1 className="text-lg md:text-3xl font-extrabold">
          {t("hero.learn_from")}
        </h1>
        {/* Use next/image for logo */}
        <Image
          src="/assets/logos/DaGalow Logo.svg" // Direct path from public
          alt="DaGalow"
          width={150} // Base width
          height={40} // Base height
          className="w-[150px] md:w-[275px] h-auto" // Responsive classes
        />
      </div>

      <div className="w-full h-full max-w-3xl mx-auto text-center">
        {/* Use next/image for hero image */}
        <Image
          src="/assets/img/Pessoas/Daniel.jpg" // Direct path from public
          alt="Hero"
          width={1000} // Example width (adjust based on original image size)
          height={600} // Example height (adjust based on original image size)
          className="w-full h-auto object-cover rounded-xl my-4 shadow-lg" // Keep responsive classes
          priority // Load this image first
        />
        {/* Auto Carousel of topics */}
        <div className="my-8 mx-auto md:text-2xl w-40 md:w-60 flex self-center justify-center items-center">
          <Marquee
            speed={70}
            gradient={true}
            gradientColor="#002147"
            gradientWidth={40}
          >
            <div className="mx-10">{t("hero.carousel_money")}</div>
            <div className="mx-10">{t("hero.carousel_health")}</div>
            <div className="mx-10">{t("hero.carousel_relationships")}</div>
            <div className="mx-10">{t("hero.carousel_mindset")}</div>
            <div className="mx-10">{t("hero.carousel_social_media")}</div>
            <div className="mx-10">{t("hero.carousel_business")}</div>
          </Marquee>
        </div>

        {/* Hero text */}
        <h1 className="text-2xl md:text-4xl font-extrabold my-8">
          {" "}
          {t("hero.hero_title")}{" "}
        </h1>
        <p className="text-lg md:text-2xl my-8 max-w-md mx-auto md:max-w-2xl">
          {" "}
          {t("hero.hero_description")}{" "}
        </p>

        {/* Achievements carousel */}
        <div className="my-14 ">
          <Swiper
            spaceBetween={40}
            slidesPerView={1.5}
            breakpoints={{
              200: { slidesPerView: 1.2 },
              400: { spaceBetween: 60, slidesPerView: 1.5 },
              1000: { spaceBetween: 60, slidesPerView: 2 },
            }}
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
            loopAdditionalSlides={5}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
            className="w-full overflow-visible mx-auto max-w-[800px] md:w-full px-10 md:px-20"
          >
            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_1_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_1_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_2_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_2_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_3_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_3_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_4_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_4_description")}
                </div>
              </div>
            </SwiperSlide>

            {/* Your other achievements */}
            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_5_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_5_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_6_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_6_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_7_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_7_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_8_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_8_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_9_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_9_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_10_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_10_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_11_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_11_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_12_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_12_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_13_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_13_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_14_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_14_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_15_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_15_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_16_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_16_description")}
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-[216px] h-[130px] md:w-[300px] md:h-[180px] bg-charcoalGray rounded-lg shadow-lg flex flex-col justify-center items-center p-4 md:gap-2">
                <span className="font-extrabold text-lg md:text-3xl">
                  {t("hero.achievement_17_title")}
                </span>
                <div className="text-md md:text-2xl">
                  {t("hero.achievement_17_description")}
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Individual Consultation Card */}
        <div
          onClick={handleCardScroll("services")}
          className="flex flex-col items-center justify-center mt-16 border-2 border-darkGold rounded-xl p-4 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {" "}
                {t("hero.hero_individual_consultation")}{" "}
              </h2>
              <p className="text-3xl md:text-4xl font-extrabold mb-2">
                {" "}
                {t("hero.hero_individual_consultation_price")}{" "}
              </p>
              <p className="text-sm md:text-lg font-normal mb-2">
                {" "}
                {t("hero.hero_individual_consultation_minimum_time")}{" "}
              </p>
            </div>
            <button
              onClick={handleOpenForm("booking")}
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t("hero.hero_book_consultation")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {" "}
              {t("hero.common_learn_more")}{" "}
            </p>
          </div>
        </div>

        {/* Direct Coaching Card */}
        <div
          onClick={handleCardScroll("coaching")}
          className="flex flex-col items-center justify-center mt-8 border-2 border-darkGold rounded-xl p-4 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {" "}
                {t("hero.hero_coaching_title")}{" "}
              </h2>
              {/* Tier Selection */}
              <div className="flex space-x-2 md:space-x-4 mb-4">
                {/* Tiers: Basic, Standard, Premium */}
                {[
                  {
                    id: "basic",
                    priceKey: "hero.hero_coaching_basic_price",
                    labelKey: "hero.hero_coaching_basic",
                  }, // Assuming basic is free or has a price
                  {
                    id: "standard",
                    priceKey: "hero.hero_coaching_standard_price",
                    labelKey: "hero.hero_coaching_standard",
                  },
                  {
                    id: "premium",
                    priceKey: "hero.hero_coaching_premium_price",
                    labelKey: "hero.hero_coaching_premium",
                  },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={(e) => handleTierSelect(e, tier.id)}
                    className={`w-20 md:w-32 h-18 md:h-24 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 ${selectedTier === tier.id ? "border-darkGold transform scale-110 z-10" : "border-gray-600 hover:border-darkGold/70"}`}
                  >
                    <span className="text-[16px] md:text-2xl font-extrabold">
                      {t(tier.priceKey)}
                    </span>
                    <span className="text-xs md:text-lg">
                      {t(tier.labelKey)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm md:text-md font-normal mb-2">
                {" "}
                {t("hero.hero_coaching_limited_spots")}{" "}
              </p>
            </div>
            <button
              onClick={openCoachingForm}
              disabled={selectedTier === null}
              className={`bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 mt-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10 ${selectedTier === null ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {t("hero.hero_get_my_number")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {" "}
              {t("hero.common_learn_more")}{" "}
            </p>
          </div>
        </div>

        {/* Expert Analysis Card */}
        <div
          onClick={handleCardScroll("expert-analysis")}
          className="flex flex-col items-center justify-center space-y-6 mt-8 border-2 border-darkGold rounded-xl p-4 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center my-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {" "}
              {t("hero.hero_get_analysis_title")}{" "}
            </h2>
            <p className="text-lg md:text-xl md:max-w-xl font-normal mb-8">
              {" "}
              {t("hero.hero_get_analysis_description")}{" "}
            </p>
            <button
              onClick={handleOpenForm("analysis")}
              className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
            >
              {t("hero.hero_get_analysis")}
            </button>
            <p role="button" className="text-sm md:text-md font-normal">
              {" "}
              {t("hero.common_learn_more")}{" "}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
