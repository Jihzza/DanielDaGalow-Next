      // components/carousel/BottomCarouselPages.jsx
      "use client"; // Directive needed for useState hook

      import React, { useState } from "react";
      import { useTranslation } from "react-i18next";

      // --- IMPORTANT: Adjust these import paths ---
      // Ensure these paths correctly point to where FAQs, Bugs, and SocialMedia
      // components are located in your NEW Next.js project structure.
      // Example assumes they are in the same directory:
      import FAQs from "./FAQs";
      import Bugs from "./Bugs";
      import SocialMedia from "./SocialMedia";
      // --- End Adjust Paths ---

      export default function BottomCarouselPages() { // Renamed from PageCarousel for clarity
        const { t } = useTranslation();
        const pages = [
          { label: t("bottom_carousel.pages.faqs"), Component: FAQs },
          { label: t("bottom_carousel.pages.bugs"), Component: Bugs },
          { label: t("bottom_carousel.pages.social_media"), Component: SocialMedia },
        ];

        const [activeIdx, setActiveIdx] = useState(0);
        // Ensure pages array is not empty before accessing Component
        const ActiveComponent = pages.length > 0 ? pages[activeIdx].Component : null;

        return (
          <section id="bottom-carousel" className="py-8 overflow-visible px-4">
            {/* Tab Buttons */}
            <div className="flex overflow-x-auto hide-scrollbar space-x-4 -mx-4 px-4 pb-2"> {/* Added pb-2 */}
              {pages.map((p, i) => (
                <button
                  key={p.label}
                  type="button" // Prevent form submission if inside a form
                  onClick={() => setActiveIdx(i)}
                  className={`
                    px-3 py-1 md:px-4 md:py-2 rounded-lg whitespace-nowrap font-medium md:text-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold
                    ${
                      i === activeIdx
                        ? "bg-darkGold text-black border-2 border-darkGold shadow-md" // Active state
                        : "bg-white text-black border-darkGold border-2 hover:bg-darkGold/10" // Inactive state
                    }
                  `}
                  role="tab" // Accessibility
                  aria-selected={i === activeIdx} // Accessibility
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Active Page Content */}
            <div className="mt-6">
              {/* Render the active component */}
              {ActiveComponent ? <ActiveComponent /> : <p>Loading content...</p>}
            </div>
          </section>
        );
      }
      