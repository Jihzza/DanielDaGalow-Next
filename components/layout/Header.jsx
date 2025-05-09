      // components/layout/Header.jsx
      "use client"; // Add this directive because we use hooks and client-side logic

      import React, { useState, useEffect, useRef, useContext } from "react";
      // Import Link from Next.js, useRouter and usePathname from next/navigation
      import Link from 'next/link';
      import { usePathname, useRouter } from 'next/navigation';

      import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed
      import { useTranslation } from "react-i18next";
      // Assuming assets are moved to public/assets/
      import { supabase } from "../../utils/supabaseClient"; // Adjust path if needed
      // AuthModal is likely rendered globally in providers.js now
      // import AuthModal from "../Auth/AuthModal";
      import OctagonalProfile from "../common/Octagonal Profile"; // Adjust path if needed
      import { AuthModalContext } from "../../app/providers"; // Import context from providers

      // Define language mapping (keep as is)
      const languageConfig = {
        en: { code: "US", name: "en" },
        pt: { code: "PT", name: "pt-pt" },
        "pt-BR": { code: "BR", name: "pt-br" },
        es: { code: "ES", name: "es" }
      };

      // useBreakpoint hook likely needs adaptation or removal in Next.js
      // For server components, you can't rely on window.innerWidth.
      // For client components, it works, but consider CSS-based responsiveness first.
      // Let's simplify for now and assume a fixed size or use Tailwind classes.
      // function useBreakpoint() { ... }

      function Header(/* Removed onAuthModalOpen prop */) {
        const [menuOpen, setMenuOpen] = useState(false);
        // const [show, setShow] = useState(true); // Logic for hiding header on scroll might need review/re-implementation if desired
        // const lastY = useRef(0);
        const { user, signOut } = useAuth();
        const pathname = usePathname(); // Get current path
        const router = useRouter(); // Get router object for navigation
        const { t, i18n } = useTranslation();
        const [langOpen, setLangOpen] = useState(false);
        const langRef = useRef(null);
        const [avatarUrl, setAvatarUrl] = useState(null);
        const { openAuthModal } = useContext(AuthModalContext); // Get function from context

        // Use Tailwind classes for responsive size or pass size prop
        const profileSize = 40; // Example fixed size, adjust or make responsive

        const currentLanguage = i18n.language || "en";
        // Ensure 'cimode' and '*' are filtered out correctly
        const allLangs = (i18n.options?.supportedLngs || [])
           .filter(l => typeof l === 'string' && l !== "cimode" && l !== "*");


        // Fetch avatar URL (useEffect runs client-side)
        useEffect(() => {
          if (!user?.id) {
            setAvatarUrl(null); // Clear avatar if user logs out
            return;
          }
          let isMounted = true; // Flag to prevent state update on unmounted component
          (async () => {
            // Ensure environment variable is loaded correctly
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Use NEXT_PUBLIC_ for client-side access if needed, otherwise fetch server-side
            if (!supabaseUrl) {
              console.error("Supabase URL environment variable not set.");
              return;
            }

            const { data, error } = await supabase
              .from("profiles")
              .select("avatar_url")
              .eq("id", user.id)
              .maybeSingle();

            if (isMounted) {
              if (error) {
                console.error("Error fetching avatar:", error);
              } else if (data?.avatar_url) {
                // Construct the public URL correctly
                const publicURL = `${supabaseUrl}/storage/v1/object/public/avatars/${data.avatar_url}`;
                setAvatarUrl(publicURL);
              } else {
                 setAvatarUrl(null); // Set to null if no avatar_url found
              }
            }
          })();
          return () => { isMounted = false; }; // Cleanup function
        }, [user]); // Re-run when user changes

        // Click outside handler for language dropdown (useEffect runs client-side)
        useEffect(() => {
          function onClick(e) {
            if (langRef.current && !langRef.current.contains(e.target)) {
              setLangOpen(false);
            }
          }
          document.addEventListener("mousedown", onClick);
          return () => document.removeEventListener("mousedown", onClick);
        }, []);

        const handleProfileClick = () => {
          if (user) {
            router.push("/profile"); // Use Next.js router
          } else {
            openAuthModal(); // Use context function
          }
        };

        const handleLogoClick = () => {
          if (pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push("/"); // Use Next.js router
          }
        };

        // Function to get flag image (keep as is, ensure paths are correct if moved)
        const getFlagImage = (langCode) => {
          const normalized = langCode.toLowerCase();
          if (normalized === "pt-br" || normalized === "br") {
            return ( <img src="https://flagcdn.com/w40/br.png" alt="Brazilian flag" className="w-6 h-4 object-cover rounded-sm" onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E"; }} /> );
          }
          const language = languageConfig[langCode] || languageConfig[normalized] || languageConfig.en;
          const countryCode = language.code.toLowerCase();
          return ( <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt={`${language.name} flag`} className="w-6 h-4 object-cover rounded-sm" onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3C/svg%3E"; }} /> );
        };

        // Function to get language name (keep as is)
        const getLanguageName = (langCode) => {
          const normalized = langCode.toLowerCase();
          if (normalized === "pt-br" || normalized === "br") return "pt-br";
          return languageConfig[langCode]?.name || languageConfig[normalized]?.name || langCode.toUpperCase();
        };

        // Determine fallback initial for avatar
        const fallbackInitial = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || '?').toUpperCase();


        return (
          <>
            {/* Use `sticky` instead of `fixed` if you want it to scroll with the page but stick at the top */}
            <header
              className={`sticky flex items-center justify-between top-0 p-4 md:p-8 lg:p-10 left-0 right-0 z-30 h-14 md:h-24 lg:h-20 bg-black text-white shadow-lg`}
              // className={`fixed flex items-center justify-between top-0 p-4 md:p-8 lg:p-10 left-0 right-0 z-30 h-14 md:h-24 lg:h-20 bg-black text-white shadow-lg transform transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}
            >
              {/* Profile Icon/Button */}
              <div
                onClick={handleProfileClick}
                className="absolute left-4 md:left-8 lg:left-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
                aria-label={user ? "Go to profile" : "Login or Sign up"}
              >
                <OctagonalProfile
                  size={profileSize}
                  borderColor="#002147" // oxfordBlue
                  innerBorderColor="#000" // black
                  imageSrc={avatarUrl}
                  fallbackText={fallbackInitial}
                />
              </div>

              {/* Logo */}
              <div
                onClick={handleLogoClick}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                aria-label="Go to homepage"
              >
                {/* Use next/image for the logo */}
                <img
                  src="/assets/logos/DaGalow Logo.svg" // Direct path from public folder
                  alt="DaGalow Logo"
                  // Use fixed width/height or layout='responsive'/'intrinsic'
                  width={150} // Adjust as needed
                  height={40} // Adjust based on aspect ratio
                  className="h-auto object-contain w-[150px] md:w-[275px]" // Keep responsive classes
                />
              </div>

              {/* Right Side Controls: Language & Menu */}
              <div className="absolute right-4 md:right-8 lg:right-10 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
                {/* Language Switcher */}
                <div ref={langRef} className="relative">
                  <button
                    onClick={() => setLangOpen(o => !o)}
                    className="focus:outline-none p-1 flex items-center justify-center"
                    aria-label="Switch language"
                  >
                    {getFlagImage(currentLanguage)}
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50 min-w-[160px] overflow-hidden">
                      {allLangs.map(lng => (
                        <button
                          key={lng}
                          onClick={() => { i18n.changeLanguage(lng); setLangOpen(false); }}
                          className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                        >
                          <span className="mr-3 flex-shrink-0">{getFlagImage(lng)}</span>
                          <span className="text-sm md:text-base">{getLanguageName(lng)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Hamburger Menu Button */}
                <button onClick={() => setMenuOpen(o => !o)} className="focus:outline-none">
                  {/* Use next/image for the icon */}
                  <img
                    src="/assets/icons/Hamburger.svg" // Direct path from public
                    alt="Menu"
                    width={24} // Adjust size
                    height={24} // Adjust size
                    className="w-6 h-6 md:w-8 md:h-8"
                  />
                </button>
              </div>
            </header>

            {/* Dropdown Menu Overlay & Content (Keep structure, adapt internal links/actions) */}
            {/* The menu content needs to be updated to use next/link and appropriate actions */}
            <div className={`fixed top-0 right-0 h-full w-[70%] md:w-[50%] lg:w-[30%] bg-black transform transition-transform duration-300 ease-in-out z-50 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
              {/* TODO: Add Menu Items Here using <Link href="..."> and correct onClick handlers */}
              <div className="p-5 text-white">
                 <button onClick={() => setMenuOpen(false)} className="text-xl mb-4">Close</button>
                 {/* Example Menu Item */}
                 <Link href="/profile" onClick={() => setMenuOpen(false)} className="block py-2">Profile</Link>
                 {user ? (
                     <button onClick={() => { signOut(); setMenuOpen(false); }} className="block py-2 w-full text-left">Sign Out</button>
                 ) : (
                     <button onClick={() => { openAuthModal(); setMenuOpen(false); }} className="block py-2 w-full text-left">Login / Signup</button>
                 )}
                 {/* Add other menu links... */}
              </div>
            </div>
            {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)} />}

            {/* AuthModal is now likely rendered globally via providers.js, so remove from here */}
            {/* <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} /> */}
          </>
        );
      }

      export default Header;
      