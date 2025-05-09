      // components/home-sections/Projects.jsx
      "use client"; // Needed for useTranslation hook

      import React from 'react';
      import Image from 'next/image'; // Import next/image
      import { useTranslation } from 'react-i18next';
      // Asset imports are removed

      function Projects() {
        const { t } = useTranslation();

        // Use direct paths for images relative to the /public folder
        const projects = [
          {
            name: t("projects.project_1_name"),
            description: t("projects.project_1_description"),
            image: "/assets/logos/Perspectiv Banner.svg" // Direct path
          },
          {
            name: t("projects.project_2_name"),
            description: t("projects.project_2_description"),
            image: "/assets/logos/Galow Banner.png" // Direct path
          },
          // Add more projects as needed…
        ];

        return (
          <section id="projects" className="py-8 px-4 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-2xl md:text-4xl font-bold">
                {t("projects.projects_title")}
              </h2>
              <div className="space-y-8 flex flex-col items-center">
                {projects.map((project, index) => (
                  <div key={index} className="flex flex-col md:w-[60vw] items-center gap-6 border-2 border-darkGold rounded-lg py-8 px-8">
                    {/* Use next/image */}
                    <Image
                      src={project.image}
                      alt={project.name}
                      width={300} // Provide base width
                      height={100} // Provide base height (adjust for aspect ratio)
                      className="w-[200px] md:w-[300px] h-auto object-contain rounded" // Use object-contain if aspect ratio varies
                    />
                    <div className="text-left md:text-center md:space-y-4 mt-4">
                      <h3 className="text-xl md:text-3xl font-semibold">{project.name}</h3>
                      <p className="text-sm md:text-lg">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      export default Projects;
      