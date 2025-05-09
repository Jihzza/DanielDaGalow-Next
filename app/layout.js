      // app/layout.js
      import './globals.css';
      import { Providers } from './providers';
      import { Inter } from 'next/font/google';

      // Import the adapted layout components
      import Header from '../components/layout/Header'; // Adjust path if needed
      import Footer from '../components/layout/Footer'; // Adjust path if needed
      import NavigationBar from '../components/layout/NavigationBar'; // Adjust path if needed

      const inter = Inter({
        subsets: ['latin'],
        variable: '--font-inter',
        display: 'swap',
      });

      export const metadata = {
        title: "Daniel Da'Galow",
        description: "Daniel Da'Galow's personal and professional platform.",
      };

      export default function RootLayout({ children }) {
        // Note: Managing chatbot open state might need to be lifted here
        // or handled within a dedicated ChatProvider if it gets complex.
        // For now, NavigationBar expects an `onChatbotClick` prop.
        // We'll pass a placeholder function for now.
        const handleChatbotToggle = () => {
          console.log("Chatbot toggle clicked - implement state logic here");
          // Example: setIsChatOpen(prev => !prev); // Requires state in this component
        };

        return (
          <html lang="en" className={`${inter.variable} font-sans`}>
            <body>
              <Providers>
                <Header /> {/* Render the adapted Header */}
                <main className="pt-14 md:pt-24 lg:pt-20"> {/* Add padding-top to avoid content going under sticky Header */}
                  {children}
                </main>
                {/* Footer is just a spacer, NavigationBar is fixed */}
                <NavigationBar onChatbotClick={handleChatbotToggle} />
                <Footer /> {/* Renders the spacer div */}
              </Providers>
            </body>
          </html>
        );
      }
      