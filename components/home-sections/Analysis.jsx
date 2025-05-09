      // components/home-sections/Analysis.jsx
      "use client"; // Needed for hooks and client-side logic

      import React, { useContext } from "react";
      import { useRouter } from 'next/navigation'; // Use Next.js router
      import { ServiceContext } from "../../contexts/ServiceContext"; // Adjust path if needed
      import { useTranslation } from "react-i18next";
      // Icon imports are removed

      function Analysis() {
        const router = useRouter(); // Use Next.js router hook
        const { setService } = useContext(ServiceContext);
        const { t } = useTranslation();

        const openForm = (serviceType) => {
          setService(serviceType);
          document
            .getElementById("service-selection") // Make sure this ID exists on the page, likely in MergedServiceForm
            ?.scrollIntoView({ behavior: "smooth" });
        };

        // Simplified: Clicking an item now just opens the generic analysis form.
        // Add more specific logic if needed, but avoid old router methods.
        const handleGridItemClick = (serviceId) => {
           console.log(`Analysis service clicked: ${serviceId}`);
           openForm("analysis"); // Opens the form section, pre-selecting 'analysis'
        };

        const analysisServices = [
          {
            id: "social",
            title: t("analysis.analysis_service_1"),
            iconSrc: "/assets/icons/Phone Branco.svg", // Direct path
          },
          {
            id: "stocks",
            title: t("analysis.analysis_service_2"),
            iconSrc: "/assets/icons/MoneyBag Branco.svg", // Direct path
          },
          {
            id: "business",
            title: t("analysis.analysis_service_4"),
            iconSrc: "/assets/icons/Bag Branco.svg", // Direct path
          },
        ];

        return (
          <section id="expert-analysis" className="py-8 px-4 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold">{t("analysis.analysis_title")}</h2>
              <p className="md:text-xl">{t("analysis.analysis_description")}</p>

              {/* UNIFIED GRID FOR ANALYSIS SERVICES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-white">
                {analysisServices.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleGridItemClick(item.id)} // Simplified click handler
                  >
                    <div className="flex items-center justify-center mb-3">
                       <img
                         src={item.iconSrc} // Use direct path
                         alt={item.title}
                         className="w-8 h-8 md:w-12 md:h-12 object-contain"
                       />
                    </div>
                    <div className="font-semibold text-[13px] md:text-lg">{item.title}</div>
                  </div>
                ))}
              </div>

              {/* FEATURES SECTION */}
              <div className="w-full mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Quick Consultations Feature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                      {/* SVG inline or use next/image */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>
                    </div>
                    <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("analysis.analysis_feature_1_title")} </h4>
                    <p className="text-white md:text-xl"> {t("analysis.analysis_feature_1_description")} </p>
                  </div>
                  {/* Detailed Analysis */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> </svg>
                    </div>
                    <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("analysis.analysis_feature_2_title")} </h4>
                    <p className="text-white md:text-xl"> {t("analysis.analysis_feature_2_description")} </p>
                  </div>
                  {/* Actionable Suggestions */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" /> </svg>
                    </div>
                    <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("analysis.analysis_feature_3_title")} </h4>
                    <p className="text-white md:text-xl"> {t("analysis.analysis_feature_3_description")} </p>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <p className="text-lg md:text-xl text-white max-w-3xl mx-auto"> {t("analysis.analysis_summary")} </p>
                  <div className="mt-8 w-full">
                    <h1 className="text-white text-2xl md:text-3xl py-2 font-bold"> {t("analysis.analysis_quote_title")} </h1>
                    <p className="text-white text-sm md:text-lg pb-6">{t("analysis.analysis_quote_subtitle")}</p>
                    <button
                      onClick={() => openForm("analysis")}
                      className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
                    >
                      {t("analysis.analysis_get_analysis")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      export default Analysis;
      