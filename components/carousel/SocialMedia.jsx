      // components/carousel/SocialMedia.jsx
      "use client"; // Needed for useTranslation hook

      import React from "react";
      import Image from 'next/image'; // Import next/image
      import { useTranslation } from "react-i18next";
      // Icon imports are removed

      function SocialMedia() {
        const { t } = useTranslation();
        // Links remain the same
        const instagramLink = "https://www.instagram.com/danieldagalow/";
        const tiktokLink = "https://www.tiktok.com/@galo_portugues"; // Corrected link likely
        const twitterLink = "https://x.com/galo_portugues"; // Corrected link likely

        // Define platform data with direct icon paths
        const platforms = [
          {
            title: t("social_media.platforms.instagram.title"),
            iconSrc: "/assets/icons/Instagram.svg", // Direct path from public
            alt: t("social_media.platforms.instagram.alt"),
            link: instagramLink,
          },
          {
            title: t("social_media.platforms.tiktok.title"),
            iconSrc: "/assets/icons/TikTok.svg", // Direct path from public
            alt: t("social_media.platforms.tiktok.alt"),
            link: tiktokLink,
          },
          // Add LinkedIn if needed
          // {
          //   title: t("social_media.platforms.linkedin.title"),
          //   iconSrc: "/assets/icons/LinkedIn.svg", // Direct path from public
          //   alt: t("social_media.platforms.linkedin.alt"),
          //   link: linkedinLink,
          // },
          {
            title: t("social_media.platforms.twitter.title"),
            iconSrc: "/assets/icons/X Twitter.svg", // Direct path from public
            alt: t("social_media.platforms.twitter.alt"),
            link: twitterLink,
          },
        ];


        return (
          <section id="social-media" className="py-6 px-4 text-black">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold text-center text-black">
                {t("social_media.title")}
              </h2>

              {/* Grid layout for social links */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 text-black">
                {platforms.map((platform) => (
                  <a
                    key={platform.title}
                    href={platform.link}
                    className="flex flex-col items-center justify-center h-full p-4 md:p-6 border-2 border-darkGold rounded-lg text-center shadow-lg hover:shadow-xl hover:border-darkGold/80 transition-all duration-200"
                    style={{ textDecoration: 'none' }} // Keep inline style if needed
                    target="_blank"
                    rel="noopener noreferrer" // Security best practice
                  >
                    {/* Use next/image for icons */}
                    <Image
                       src={platform.iconSrc}
                       alt={platform.alt}
                       width={48} // Example base size (md:w-12)
                       height={48} // Example base size (md:h-12)
                       className="w-8 h-8 md:w-12 md:h-12 object-contain" // Keep responsive classes
                    />
                    <div className="font-semibold text-[13px] md:text-lg mt-3">{platform.title}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      }

      export default SocialMedia;
      