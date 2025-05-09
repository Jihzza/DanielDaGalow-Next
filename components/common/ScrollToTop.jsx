      // components/common/ScrollToTop.jsx
      "use client"; // Directive needed for hooks and window access

      import { useEffect } from 'react';
      // Import usePathname from Next.js instead of useLocation from react-router-dom
      import { usePathname } from 'next/navigation';

      // WARNING: Next.js App Router often handles scroll restoration automatically.
      // This component forces scroll to top on *every* path change, which might
      // override expected behavior (like maintaining scroll position on back/forward).
      // Test your app WITHOUT this component first. Use only if absolutely necessary.
      function ScrollToTop() {
          const pathname = usePathname(); // Use Next.js hook to get the current path

          useEffect(() => {
            // Check if window is defined (runs only on client)
            if (typeof window !== 'undefined') {
              // Scroll to top without delay or smooth scroll
              window.scrollTo(0, 0);
            }
            // No cleanup needed for simple scrollTo
          }, [pathname]); // Re-run effect when the pathname changes

          // This component doesn't render anything
          return null;
        }

      export default ScrollToTop;
      