      // components/common/Octagonal Profile.jsx
      "use client"; // Keep this, although technically might not be needed if just rendering props/styles

      import React from "react";
      import Image from 'next/image'; // Import next/image

      function OctagonalProfile({
          size = 50,
          borderColor = "#BFA200", // Default border color (darkGold)
          innerBorderColor = "#000000", // Default inner border (black)
          onClick,
          imageSrc, // Expecting a URL string (e.g., "/assets/avatars/user.png" or absolute URL)
          fallbackText = "?", // Fallback initial/icon
          altText = "Profile picture" // Added alt text prop
      }) {
        // Octagon shape CSS clip-path
        const octagonClipPath = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

        // Calculate dynamic sizes based on the main size prop
        const borderThickness = Math.max(1, size * 0.05); // Ensure minimum 1px
        const whiteSpaceThickness = Math.max(1, size * 0.05); // Ensure minimum 1px
        const innerSize = size - 2 * (borderThickness + whiteSpaceThickness);

        // Style objects (optional, could use Tailwind classes too)
        const containerStyle = {
          width: `${size}px`,
          height: `${size}px`,
          cursor: onClick ? 'pointer' : 'default', // Add cursor pointer if clickable
        };
        const outerBorderStyle = {
          backgroundColor: borderColor,
          clipPath: octagonClipPath,
        };
        const innerBorderStyle = {
          // Position slightly inside the outer border
          top: `${borderThickness}px`,
          left: `${borderThickness}px`,
          right: `${borderThickness}px`,
          bottom: `${borderThickness}px`,
          backgroundColor: innerBorderColor,
          clipPath: octagonClipPath,
        };
        const contentStyle = {
           // Position inside the inner border
          top: `${borderThickness + whiteSpaceThickness}px`,
          left: `${borderThickness + whiteSpaceThickness}px`,
          right: `${borderThickness + whiteSpaceThickness}px`,
          bottom: `${borderThickness + whiteSpaceThickness}px`,
          clipPath: octagonClipPath,
          backgroundColor: "#002147", // oxfordBlue fallback background
        };
        // Style for fallback text, scale with size
        const fallbackTextStyle = {
           color: "#BFA200", // darkGold
           fontSize: `${Math.max(16, size * 0.5)}px`, // Scale font size, minimum 16px
           fontWeight: 'bold',
           lineHeight: 1, // Ensure text is centered vertically
        };


        return (
          <div
            className="relative drop-shadow-lg" // Keep shadow if desired
            style={containerStyle}
            onClick={onClick}
            role={onClick ? "button" : undefined} // Add role if clickable
            tabIndex={onClick ? 0 : undefined} // Make clickable focusable
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined} // Allow activation with Enter/Space
          >
            {/* 1) Outer layer: colored border */}
            <div className="absolute inset-0" style={outerBorderStyle} />

            {/* 2) Middle layer: inner border */}
            <div className="absolute" style={innerBorderStyle} />

            {/* 3) Inner layer: image or fallback text */}
            <div
              className="absolute overflow-hidden flex items-center justify-center" // Keep flex centering
              style={contentStyle}
            >
              {imageSrc ? (
                // Use next/image component
                <Image
                  src={imageSrc}
                  alt={altText} // Use alt text prop
                  width={innerSize > 0 ? Math.floor(innerSize) : size} // Use calculated inner size
                  height={innerSize > 0 ? Math.floor(innerSize) : size} // Use calculated inner size
                  className="w-full h-full object-cover" // Ensure image covers the area
                  // Optional: Add error handling or placeholder
                  onError={(e) => { e.target.style.display = 'none'; /* Hide broken image */ }}
                />
              ) : (
                // Fallback Text/Initial
                <div style={fallbackTextStyle}>
                  {fallbackText}
                </div>
              )}
            </div>
          </div>
        );
      }

      export default OctagonalProfile;
      