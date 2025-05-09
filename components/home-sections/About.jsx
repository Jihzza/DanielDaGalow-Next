      // components/home-sections/About.jsx
      "use client"; // Needed for useTranslation hook

      import React from 'react';
      import { useTranslation } from "react-i18next";

      function About() {
        const { t } = useTranslation();
        return (
          <section id="about" className="py-8 px-4 text-white text-center">
            <div className="max-w-2xl mx-auto ">
              <h2 className="text-2xl md:text-4xl font-bold mb-8">
                {t("about.about_title")}
              </h2>
              <div className="space-y-8">
                <p className="md:text-xl">
                  {t("about.about_description")}
                </p>
              </div>
            </div>
          </section>
        );
      }

      export default About;
      