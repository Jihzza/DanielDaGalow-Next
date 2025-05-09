      // components/layout/NavigationBar.jsx
      "use client"; // Add this directive because we use hooks and client-side logic

      import React, { useContext } from 'react'; // Import useContext
      // Import Link from Next.js, useRouter and usePathname from next/navigation
      import Link from 'next/link';
      import { usePathname, useRouter } from 'next/navigation';

      import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
      import { AuthModalContext } from '../../app/providers'; // Import context from providers

      // Assuming assets are moved to public/assets/
      // Using direct paths instead of imports for static assets in public
      // import home from '/assets/icons/Home Branco.svg'; // No need to import like this

      import { useTranslation } from 'react-i18next';

      // Keep onChatbotClick as prop, remove onAuthModalOpen
      const NavigationBar = ({ onChatbotClick }) => {
        const router = useRouter(); // Use Next.js router
        const pathname = usePathname(); // Use Next.js pathname hook
        const { user } = useAuth();
        const { openAuthModal } = useContext(AuthModalContext); // Use context
        const { t } = useTranslation();

        const handleHomeIconClick = () => {
          if (pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push("/"); // Use Next.js router
          }
        };

        const handleAccountClick = () => {
          if (user) {
            router.push('/profile'); // Use Next.js router
          } else {
            openAuthModal(); // Use context function
          }
        };

        // Define navigation items directly
        const icons = [
          { src: "/assets/icons/Home Branco.svg", alt: t("navigation.home"), action: handleHomeIconClick, href: "/" },
          { src: "/assets/icons/Calendar Branco.svg", alt: t("navigation.calendar"), action: user ? () => router.push('/calendar') : openAuthModal, href: user ? "/calendar" : null }, // Adjusted path
          { src: "/assets/icons/Dagalow Branco.svg", alt: t("navigation.chatbot"), action: onChatbotClick, href: null }, // Keep action prop
          { src: "/assets/icons/Settings Branco.svg", alt: t("navigation.settings"), action: () => router.push('/settings'), href: "/settings" }, // Adjusted path
          { src: "/assets/icons/Profile Branco.svg", alt: t("navigation.account"), action: handleAccountClick, href: user ? "/profile" : null },
        ];

        return (
          <div className="fixed h-[56px] bottom-0 left-0 w-full px-8 lg:px-10 lg:h-[60px] z-50 bg-black flex justify-between items-center">
            {icons.map((icon, i) => {
              // Decide whether to wrap with Link or just use onClick
              const content = (
                <img
                  src={icon.src}
                  alt={icon.alt}
                  // Use next/image if you need optimization, otherwise img is fine for small icons
                  width={32} // Example size
                  height={32} // Example size
                  className="w-8 h-8 md:w-12 md:h-12 lg:w-8 lg:h-8 cursor-pointer drop-shadow-lg transition-all duration-300"
                />
              );

              // If there's an action, use a button for semantics
              if (icon.action && !icon.href) {
                return (
                  <button key={i} onClick={icon.action} aria-label={icon.alt} className="p-1">
                    {content}
                  </button>
                );
              }

              // If there's an href (and potentially an action like scrolling), use Link
              // Note: If the action is *only* navigation, Link handles it.
              // If the action does something *else* besides navigation, handle it carefully.
              if (icon.href) {
                 return (
                   <Link key={i} href={icon.href} onClick={icon.action || undefined} aria-label={icon.alt} className="p-1">
                     {content}
                   </Link>
                 );
              }

              // Fallback for items that might only open the auth modal (handled by action)
               if (icon.action) {
                 return (
                   <button key={i} onClick={icon.action} aria-label={icon.alt} className="p-1">
                     {content}
                   </button>
                 );
               }

              return null; // Should not happen with current logic
            })}
          </div>
        );
      };

      export default NavigationBar;
      