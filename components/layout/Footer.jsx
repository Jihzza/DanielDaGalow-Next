      // components/layout/Footer.jsx
      // This component is simple and doesn't use hooks or client-side logic,
      // so it can remain a Server Component (no "use client" needed).

      import React from "react";

      function Footer() {
        // This div acts as a spacer to prevent content from going under the fixed NavigationBar
        return (
          <div className="h-[56px] md:h-[80px] lg:h-[60px] bg-black">
             {/* You could add actual footer content here if desired */}
             {/* <p className="text-center text-gray-500 text-sm py-4">© {new Date().getFullYear()} Daniel DaGalow</p> */}
          </div>
        );
      }

      export default Footer;
      