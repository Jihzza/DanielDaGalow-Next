      // components/home-sections/IncentivePage.jsx
      "use client"; // Needed for useRouter hook

      import React from "react";
      import { useRouter } from 'next/navigation'; // Use Next.js router
      import { useTranslation } from "react-i18next";

      function IncentivePage() { // Renamed component
        const router = useRouter(); // Use Next.js router hook
        const { t } = useTranslation();

        const handleSignUp = () => {
          router.push("/signup"); // Use Next.js router push
        };

        return (
          <section id="account-incentive" className="py-8 px-4 text-black">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Main Heading */}
              <h2 className="text-2xl md:text-4xl font-bold"> {t('incentive.title')} </h2>
              <p className="md:text-xl"> {t('incentive.description')} </p>

              {/* Benefits */}
              <div className="bg-oxfordBlue text-white p-6 rounded-xl border-2 border-darkGold mb-8">
                <h3 className="text-xl md:text-3xl font-bold mb-4">{t('incentive.benefits.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* Benefit items */}
                  <div className="flex items-start"> <span className="text-darkGold mr-2">✓</span> <p className="text-sm md:text-xl">{t('incentive.benefits.items.consultation')}</p> </div>
                  <div className="flex items-start"> <span className="text-darkGold mr-2">✓</span> <p className="text-sm md:text-xl">{t('incentive.benefits.items.history')}</p> </div>
                  <div className="flex items-start"> <span className="text-darkGold mr-2">✓</span> <p className="text-sm md:text-xl">{t('incentive.benefits.items.content')}</p> </div>
                  <div className="flex items-start"> <span className="text-darkGold mr-2">✓</span> <p className="text-sm md:text-xl">{t('incentive.benefits.items.dashboard')}</p> </div>
                </div>
              </div>

              {/* Chatbot Info */}
              <div className="bg-oxfordBlue text-white p-6 rounded-xl border-2 border-darkGold mb-10">
                <h3 className="text-xl md:text-3xl font-bold mb-4">{t('incentive.chatbot.title')}</h3>
                <p className="mb-4 text-sm md:text-xl"> {t('incentive.chatbot.description')} </p>
                <div className="text-left max-w-md mx-auto">
                  <p className="mb-2 text-sm md:text-xl">{t('incentive.chatbot.capabilities.title')}</p>
                  {/* Capabilities list */}
                  <div className="flex items-start mb-2"> <span className="text-darkGold mr-2">•</span> <p className="text-sm md:text-xl">{t('incentive.chatbot.capabilities.info')}</p> </div>
                  <div className="flex items-start mb-2"> <span className="text-darkGold mr-2">•</span> <p className="text-sm md:text-xl">{t('incentive.chatbot.capabilities.recommendations')}</p> </div>
                  <div className="flex items-start"> <span className="text-darkGold mr-2">•</span> <p className="text-sm md:text-xl">{t('incentive.chatbot.capabilities.preparation')}</p> </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSignUp}
                className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
              >
                {t('incentive.cta.button')}
              </button>
            </div>
          </section>
        );
      }

      export default IncentivePage; // Export with correct name
      