// app/page.js
// This file defines the content for your homepage route ('/').

import React from 'react';

// --- Import Your Homepage Section Components ---
// !! CRITICAL: Ensure these paths are correct for your new Next.js project structure !!
// Example: import Hero from '../components/home-sections/Hero';
// OR if you set up path aliases: import Hero from '@/components/home-sections/Hero';

import Hero from '../components/home-sections/Hero'; // Assuming components are now in a root 'components' folder
import About from '../components/home-sections/About';
import Services from '../components/home-sections/Services';
import Coaching from '../components/home-sections/Coaching';
import Analysis from '../components/home-sections/Analysis';
import Projects from '../components/home-sections/Projects';
import VentureInvestment from '../components/home-sections/VentureInvestment';
import Testimonials from '../components/home-sections/Testimonials';
import Interviews from '../components/home-sections/Interviews';
import IncentivePage from '../components/home-sections/IncentivePage';
import OtherWins from '../components/home-sections/OtherWins';
import MergedServiceForm from '../components/Forms/MergedServiceForm';
import BottomCarouselPages from '../components/carousel/BottomCarouselPages';

/**
 * HomePage Component (Can remain a Server Component by default)
 *
 * This component renders the main content for the root route ('/').
 * It aggregates the various sections that make up the homepage.
 * The individual imported sections handle their own client-side logic
 * if they are marked with "use client";
 */
export default function HomePage() {
  // Props like 'openAuthModal' are no longer passed from here.
  // Client components like Header, or sections like Testimonials,
  // will use the AuthModalContext directly if they need to trigger the modal.

  return (
    <>
      {/* Render the sections in the desired order */}
      <Hero />
      <About />
      <Services /> {/* No longer needs onAuthModalOpen prop */}
      <Coaching />
      <Analysis />
      <Projects />
      <VentureInvestment />
      <Interviews />
      <IncentivePage />
      <Testimonials /> {/* No longer needs onAuthModalOpen prop */}
      <OtherWins />
      <MergedServiceForm /> {/* This is the main form section */}
      <BottomCarouselPages /> {/* Contains FAQs, Bugs, SocialMedia */}
    </>
  );
}

// --- Homepage Specific Metadata ---
// This defines SEO metadata (title, description, etc.) for this specific page.
// It will override or merge with the default metadata in app/layout.js.
export const metadata = {
  title: "Daniel Da'Galow - Unlock Your Potential", // Specific title for the homepage
  description: "Master mindset, wealth, and relationships with Daniel Da'Galow. Explore consultations, coaching, analysis, and investment opportunities.",
  // You can add more specific OpenGraph tags for the homepage here if desired:
  // openGraph: {
  //   title: "Daniel Da'Galow - Unlock Your Potential",
  //   description: "Explore consultations, coaching, analysis, and investment opportunities.",
  //   images: ['/assets/og-image-homepage.jpg'], // Ensure image is in the public/assets folder
  // },
};
