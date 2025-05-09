      // components/home-sections/Services.jsx
      "use client"; // Needed for hooks and client-side logic

      import React, { useContext } from "react";
      import { useRouter } from 'next/navigation'; // Use Next.js router
      import { ServiceContext } from "../../contexts/ServiceContext"; // Adjust path if needed
      import { useTranslation } from "react-i18next";
      // Icon imports are removed

      function Services() {
        const { t } = useTranslation();
        const router = useRouter(); // Use Next.js router hook
        const { setService } = useContext(ServiceContext);

        const openForm = (service) => {
          setService(service);
          document
            .getElementById("service-selection") // Ensure this ID exists
            ?.scrollIntoView({ behavior: "smooth" });
        };

        // Simplified: Clicking a service grid item does nothing for now.
        // The main CTA button calls openForm('booking').
        // Add specific onClick handlers to grid items if needed.
        // const handleServiceClick = (service) => { ... }; // Removed complex logic

        const serviceItems = [
           { title: t("services.service_1"), iconSrc: "/assets/icons/Brain Branco.svg" },
           { title: t("services.service_2"), iconSrc: "/assets/icons/Phone Branco.svg" },
           { title: t("services.service_3"), iconSrc: "/assets/icons/MoneyBag Branco.svg" },
           { title: t("services.service_4"), iconSrc: "/assets/icons/Target Branco.svg" },
           { title: t("services.service_5"), iconSrc: "/assets/icons/Bag Branco.svg" },
           { title: t("services.service_6"), iconSrc: "/assets/icons/Heart Branco.svg" },
           { title: t("services.service_7"), iconSrc: "/assets/icons/Fitness Branco.svg" },
           { title: t("services.service_8"), iconSrc: "/assets/icons/Onlyfans Branco.svg" },
           { title: t("services.service_9"), iconSrc: "/assets/icons/Robot Branco.svg" },
           { title: t("services.service_10"), iconSrc: "/assets/icons/More Branco.svg" },
        ];

        return (
          <section id="services" className="py-8 px-4 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold"> {t("services.services_title")} </h2>
              <p className="md:text-xl"> {t("services.services_description")} </p>
              {/* Services Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-white">
                {serviceItems.map((item, index) => (
                  <div key={index} className="flex flex-col items-center justify-center h-full p-6 border-2 border-darkGold rounded-lg text-center shadow-lg">
                    <div className="flex items-center justify-center mb-3">
                       <img
                         src={item.iconSrc} // Use direct path
                         alt={item.title}
                         className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain" // Adjusted sizes
                       />
                    </div>
                    <div className="font-semibold text-[13px] md:text-lg">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="w-full mx-auto px-4 mt-8 md:mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Video Call Feature */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> </svg>
                  </div>
                  <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("services.services_structure_1_title")} </h4>
                  <p className="text-white md:text-xl"> {t("services.services_structure_1_description")} </p>
                </div>
                {/* Duration Feature */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>
                  </div>
                  <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("services.services_structure_2_title")} </h4>
                  <p className="text-white md:text-xl"> {t("services.services_structure_2_description")} </p>
                </div>
                {/* Recording Feature */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gentleGray text-oxfordBlue rounded-full mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> </svg>
                  </div>
                  <h4 className="text-xl md:text-3xl font-medium text-white mb-2"> {t("services.services_structure_3_title")} </h4>
                  <p className="text-white md:text-xl"> {t("services.services_structure_3_description")} </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-10 text-center">
                <p className="text-lg md:text-2xl text-white max-w-3xl mx-auto"> {t("services.services_structure_description")} </p>
                <div className="mt-6 w-full">
                  <h1 className="text-white text-2xl md:text-3xl py-2 font-bold"> {t("services.services_price")} </h1>
                  <p className="text-white text-sm md:text-lg pb-6"> {t("services.services_price_minimum_time")} </p>
                  <div className="flex justify-center pt-2">
                  <button
                    onClick={() => openForm("booking")} // Opens form pre-set for booking
                    className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
                  >
                    {t("services.services_book_consultation")}
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      export default Services;
      