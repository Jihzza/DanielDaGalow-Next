"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function VentureInvestment() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleServiceClick = (service) => {
    const mapping = {
      pitchdeck: "#pitch-deck-request",
    };
    router.push(`/?service=${service}${mapping[service]}`);
    setTimeout(() => {
      const id = mapping[service].slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <section id="venture-investment" className="py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-2xl md:text-4xl font-bold">{t("venture_investment.venture_title")}</h2>
        <p className="text-white text-center mx-auto md:text-lg">
          {t("venture_investment.venture_description")}
        </p>
        <button
          onClick={() => handleServiceClick("pitchdeck")}
          className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10"
        >
          {t("venture_investment.venture_request_pitch")}
        </button>
      </div>
    </section>
  );
}
