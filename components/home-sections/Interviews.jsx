      // components/home-sections/Interviews.jsx
      "use client"; // Needed for useTranslation hook

      import React from 'react';
      import Image from 'next/image'; // Import next/image
      import { useTranslation } from 'react-i18next';
      // Asset imports are removed

      const Interviews = () => {
        const { t } = useTranslation();

        // Use direct paths for images relative to the /public folder
        const interviews = [
          {
            title: t("interviews.interview_1_title"),
            description: t("interviews.interview_1_description"),
            date: t("interviews.interview_1_date"),
            link: "https://x.com/JornalNoticias/status/1642802512435777536",
            image: "/assets/img/Noticias/News 2.png" // Direct path
          },
          // Add more interviews as needed
        ];

        const mediaLogos = [
           { name: t("interviews.media_cm"), href: "https://www.cmjornal.pt/cmtv/programas/especiais/investigacao-cm/detalhe/conteudos-sexuais-na-internet-rendem-milhares-de-euros-e-dao-vida-de-luxo-a-utilizadores-veja-agora-na-cmtv-cmtv", src: "/assets/logos/CM Logo.png"},
           { name: t("interviews.media_jn"), href: "https://x.com/JornalNoticias/status/1642802512435777536", src: "/assets/logos/JN Logo.png"},
           { name: t("interviews.media_coutinho"), href: "https://www.youtube.com/watch?v=yr68LJvYDWc", src: "/assets/logos/Coutinho.png"}
        ];

        return (
          <section id="interviews" className="py-8 px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="text-center space-y-6">
                <h2 className="text-2xl md:text-4xl font-bold text-white"> {t("interviews.interviews_title")} </h2>
                <p className='text-white md:text-lg mx-auto'>{t("interviews.interviews_description")}</p>
              </div>

              {/* Interview Image Section */}
              <div className="gap-4 justify-center items-center">
                {interviews.map((interview, index) => (
                  <a key={index} href={interview.link} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden justify-center items-center transition-shadow duration-300 hover:shadow-lg">
                    {/* Use next/image for the interview image */}
                    <Image
                      src={interview.image}
                      alt={interview.title}
                      width={500} // Provide appropriate base width
                      height={281} // Provide appropriate base height (adjust for aspect ratio)
                      className="w-full h-auto md:w-[50vw] lg:w-[20vw] justify-center items-center object-contain mx-auto" // Use object-contain if aspect ratio varies
                    />
                    {/* Optionally add title/description overlay or below */}
                  </a>
                ))}
              </div>

              {/* Media Logos Section */}
              <div className='flex flex-row justify-center items-center gap-12 pt-4'>
                {mediaLogos.map((logo) => (
                   <a key={logo.name} href={logo.href} target="_blank" rel="noopener noreferrer" aria-label={logo.name}>
                     {/* Use next/image for logos */}
                     <Image
                       src={logo.src}
                       alt={logo.name}
                       width={100} // Example width
                       height={48} // Example height (adjust based on logo aspect ratio)
                       className='h-12 md:h-16 w-auto object-contain rounded opacity-85 shadow-lg hover:opacity-100 transition-opacity'
                     />
                   </a>
                ))}
              </div>
            </div>
          </section>
        );
      };

      export default Interviews;
      