// Final fixed Testimonials.jsx - resolving DOM props and loop       // components/home-sections/Testimonials.jsx
      "use client"; // Needed for hooks, Swiper, client-side logic

      import React, { useState, useEffect, useRef, useContext } from "react";
      import Image from 'next/image'; // Import next/image
      import { useTranslation } from "react-i18next";
      import { supabase } from "../../utils/supabaseClient"; // Adjust path if needed
      import { Swiper, SwiperSlide } from "swiper/react";
      import { Autoplay, Pagination } from "swiper/modules";
      import "swiper/css";
      import "swiper/css/pagination";
      import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed
      import { AuthModalContext } from "../../app/providers"; // Adjust path if needed
      // Asset imports are removed

      function Testimonials() {
        const { t } = useTranslation();
        const swiperRef = useRef(null);
        const { openAuthModal } = useContext(AuthModalContext); // Use context
        const { user } = useAuth();
  const defaultTestimonials = [
    {
      id: "static-1",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: "/assets/img/Pessoas/Rafa.jpeg",
    },
    {
      id: "static-2",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: "/assets/img/Pessoas/Gonçalo.png",
    },
    {
      id: "static-3",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: "/assets/img/Pessoas/Rafa.jpeg",
    },
    {
      id: "static-4",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: "/assets/img/Pessoas/Gonçalo.png",
    },
    {
      id: "static-5",
      quote: t("testimonials.testimonial_1_quote"),
      author: t("testimonials.testimonial_1_author"),
      image_url: "/assets/img/Pessoas/Rafa.jpeg",
    },
    {
      id: "static-6",
      quote: t("testimonials.testimonial_2_quote"),
      author: t("testimonials.testimonial_2_author"),
      image_url: "/assets/img/Pessoas/Gonçalo.png",
    },
  ];

  const [testimonials, setTestimonials] = useState(defaultTestimonials);
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setModalOpen] = useState(false);
        const [author, setAuthor] = useState("");
        const [quote, setQuote] = useState("");
        const [imageFile, setImageFile] = useState(null);
        const [submitting, setSubmitting] = useState(false);

        // --- Swiper Pagination Styling ---
        // Inject styles dynamically client-side
        useEffect(() => {
          const styleId = 'swiper-pagination-styles';
          if (document.getElementById(styleId)) return; // Prevent duplicate styles

          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            .testimonial-swiper .swiper-pagination {
              position: relative !important; /* Use relative to place it below swiper */
              bottom: auto !important; /* Reset bottom */
              margin-top: 20px !important; /* Space above bullets */
              display: flex;
              justify-content: center;
              z-index: 10; /* Ensure bullets are clickable */
            }
            .testimonial-swiper .swiper-pagination-bullet {
              background: rgba(255, 255, 255, 0.5) !important; /* Lighter bullets for dark bg */
              opacity: 0.6 !important;
              margin: 0 5px !important;
              width: 8px !important;
              height: 8px !important;
              transition: background-color 0.3s ease, opacity 0.3s ease;
            }
            .testimonial-swiper .swiper-pagination-bullet-active {
              background: #BFA200 !important; /* darkGold */
              opacity: 1 !important;
            }
          `;
          document.head.appendChild(style);
          return () => { // Cleanup
             const styleElement = document.getElementById(styleId);
             if (styleElement) {
                document.head.removeChild(styleElement);
             }
          };
        }, []);

        // --- Fetch Testimonials ---
        useEffect(() => {
          fetchApprovedTestimonials();
          // Set up Supabase real-time subscription (ensure this works with your RLS policies)
          const channel = supabase
            .channel('testimonials-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, payload => {
              console.log('Change received!', payload);
              fetchApprovedTestimonials(); // Refetch on any change (or filter by payload.new.status === 'approved')
            })
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        }, []); // Run once on mount

        async function fetchApprovedTestimonials() {
          try {
            setLoading(true);
            const { data, error } = await supabase
              .from("testimonials")
              .select("*")
              .eq("status", "approved")
              .order("created_at", { ascending: false });

            if (error) throw error;

            // Ensure Supabase URL is available client-side
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!supabaseUrl) {
               console.error("NEXT_PUBLIC_SUPABASE_URL not set");
               // Handle error appropriately, maybe show default testimonials only
               setTestimonials(defaultTestimonials);
               return;
            }

            const processedData = data.map((item) => ({
              ...item,
              // Construct public URL correctly
              image_url: item.image_url.startsWith("http")
                ? item.image_url // Already a full URL (e.g., from storage publicUrl)
                : `${supabaseUrl}/storage/v1/object/public/testimonials/${item.image_url}`, // Construct if just filename
            }));

            // Combine fetched approved with defaults
            setTestimonials([...processedData, ...defaultTestimonials]);

          } catch (error) {
            console.error("Error loading testimonials:", error);
            setTestimonials(defaultTestimonials); // Fallback to defaults on error
          } finally {
            setLoading(false);
          }
        }

        // --- Modal & Form Logic ---
        const handleTestimonialButtonClick = () => {
          if (user) {
            setModalOpen(true);
          } else {
            openAuthModal(); // Use context function
          }
        };

        const handleSubmit = async (e) => {
           e.preventDefault(); // Prevent default form submission
           if (!author.trim() || !quote.trim() || !imageFile || quote.length > 110) {
             alert(t("testimonials.modal_validation"));
             return;
           }
           if (!user) {
             alert(t("testimonials.modal_auth_required"));
             openAuthModal(); // Prompt login if somehow user got lost
             return;
           }

           setSubmitting(true);
           try {
             // 1. Upload image
             const fileExt = imageFile.name.split('.').pop();
             const fileName = `${user.id}-${Date.now()}.${fileExt}`;
             const filePath = `${fileName}`; // Store in root of 'testimonials' bucket

             let { error: uploadError } = await supabase.storage
               .from('testimonials') // Bucket name
               .upload(filePath, imageFile);

             if (uploadError) throw uploadError;

             // 2. Get public URL (ensure bucket is public or use signed URLs if private)
             const { data: urlData } = supabase.storage
               .from('testimonials')
               .getPublicUrl(filePath);

             if (!urlData || !urlData.publicUrl) {
                throw new Error("Could not get public URL for uploaded image.");
             }

             // 3. Insert testimonial data
             const { data: insertedData, error: insertError } = await supabase
               .from('testimonials')
               .insert({
                 user_id: user.id,
                 author: author.trim(),
                 quote: quote.trim(),
                 image_url: urlData.publicUrl, // Store the full public URL
                 status: 'pending', // Default status
               })
               .select() // Select the inserted row to potentially add to state
               .single();

             if (insertError) throw insertError;

             // Optional: Add to local state immediately (or wait for refetch)
             // setTestimonials(prev => [insertedData, ...prev]);

             setModalOpen(false);
             setAuthor("");
             setQuote("");
             setImageFile(null);
             alert(t("testimonials.modal_success"));

           } catch (error) {
             console.error("Testimonial submission error:", error);
             alert(`${t("testimonials.modal_error")}: ${error.message}`);
           } finally {
             setSubmitting(false);
           }
        };

        return (
          <section id="testimonials" className="py-8 px-4 text-black">
            <div className="max-w-3xl mx-auto text-center space-y-6 px-4 overflow-visible">
              <h2 className="text-2xl md:text-4xl font-bold text-white"> {/* Changed text color */}
                {t("testimonials.testimonials_title")}
              </h2>
              <p className="md:text-xl text-white">{t("testimonials.testimonials_description")}</p> {/* Changed text color */}

              {loading ? (
                <p className="text-white">Loading…</p> /* Changed text color */
              ) : (
                <Swiper
                  ref={swiperRef}
                  modules={[Autoplay, Pagination]}
                  slidesPerView={1.2}
                  spaceBetween={30}
                  centeredSlides={true}
                  initialSlide={0}
                  loop={testimonials.length > 1} // Only loop if more than 1 slide
                  autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                  pagination={{ clickable: true }}
                  className="testimonial-swiper overflow-visible" // Added class for specific styling
                  breakpoints={{ 768: { slidesPerView: 1, spaceBetween: 50 } }} // Simplified for better looping
                  observer={true}
                  observeParents={true}
                  updateOnWindowResize={true}
                >
                  {testimonials.map((testimonial, index) => (
                    <SwiperSlide key={testimonial.id || `testimonial-${index}`}>
                      <div className="bg-white w-full h-72 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center overflow-hidden text-base">
                        {/* Use next/image for testimonial avatar */}
                        <Image
                          src={testimonial.image_url || '/assets/icons/Profile Branco.svg'} // Fallback image
                          alt={testimonial.author}
                          width={80} // Example size
                          height={80} // Example size
                          className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-darkGold mb-4"
                          onError={(e) => { e.target.src = '/assets/icons/Profile Branco.svg'; }} // Handle image load errors
                        />
                        <div className="flex-1 flex items-center justify-center overflow-y-auto">
                          <p className="italic text-md md:text-xl px-2">"{testimonial.quote}"</p>
                        </div>
                        <div className="mt-4 font-semibold text-md md:text-xl">{testimonial.author}</div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              <button
                onClick={handleTestimonialButtonClick}
                className="bg-darkGold w-60 md:w-80 text-black md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 mb-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 z-10 mt-6" // Added margin-top
              >
                {t("testimonials.leave_testimonial")}
              </button>
            </div>

            {/* Testimonial Submission Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="bg-oxfordBlue rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 animate-fade-in">
                   {/* Modal Header */}
                   <div className="border-b border-darkGold/30 p-4 flex justify-between items-center">
                      <div>
                         <h3 className="text-2xl md:text-3xl font-bold text-white mb-1"> {t("testimonials.modal_title")} </h3>
                         <p className="text-gray-300 text-sm md:text-base"> {t("testimonials.modal_subtitle")} </p>
                      </div>
                      <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                   </div>

                   {/* Modal Body */}
                   <div className="p-4 space-y-6">
                     {/* Image Upload */}
                     <div className="space-y-3">
                       <label className="block text-white font-medium"> {t("testimonials.modal_photo_label")} </label>
                       <div className="flex flex-col items-center space-y-4">
                         {/* Image Preview */}
                         <div className="w-20 h-20 rounded-full border-2 border-darkGold border-dashed flex items-center justify-center text-darkGold/50 overflow-hidden bg-gray-700">
                            {imageFile ? (
                               <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path> </svg>
                            )}
                         </div>
                         {/* Upload Button */}
                         <label className="w-full">
                           <div className="px-4 py-2 bg-darkGold text-black font-medium rounded-lg hover:bg-opacity-90 transition cursor-pointer text-center">
                             {imageFile ? t("testimonials.modal_photo_change") : t("testimonials.modal_photo_select")}
                           </div>
                           <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" required={!imageFile} />
                         </label>
                       </div>
                       {!imageFile && <p className="text-gray-400 text-xs md:text-base text-center"> {t("testimonials.modal_photo_placeholder")} </p>}
                     </div>
                     {/* Name Field */}
                     <div className="space-y-2">
                       <label className="block text-white font-medium"> {t("testimonials.modal_name_label")} </label>
                       <input type="text" placeholder={t("testimonials.modal_name_placeholder")} value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 border-2 border-darkGold rounded-xl bg-oxfordBlue/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darkGold" required />
                     </div>
                     {/* Testimonial Text */}
                     <div className="space-y-2">
                       <div className="flex justify-between">
                         <label className="block text-white font-medium"> {t("testimonials.modal_testimonial_label")} </label>
                         <span className={`text-xs md:text-base ${quote.length > 110 ? "text-red-400" : "text-gray-400"}`}> {quote.length}/110 </span>
                       </div>
                       <textarea placeholder={t("testimonials.modal_testimonial_placeholder")} maxLength={110} value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full px-3 py-2 border-2 border-darkGold rounded-xl bg-oxfordBlue/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darkGold h-28 resize-none" required />
                     </div>
                   </div>

                   {/* Modal Footer */}
                   <div className="px-4 pb-4 pt-2 flex justify-end space-x-3">
                     <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-darkGold text-darkGold rounded-lg hover:bg-darkGold/10 transition"> {t("testimonials.modal_cancel")} </button>
                     <button type="submit" disabled={ submitting || !author.trim() || !quote.trim() || !imageFile || quote.length > 110 } className={`px-3 py-2 bg-darkGold text-black font-bold rounded-lg ${ submitting || !author.trim() || !quote.trim() || !imageFile || quote.length > 110 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-90" } transition`} >
                       {submitting ? (
                         <div className="flex items-center">
                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                           {t("testimonials.modal_submitting")}
                         </div>
                       ) : (
                         t("testimonials.modal_submit")
                       )}
                     </button>
                   </div>
                </form>
              </div>
            )}
          </section>
        );
      }

      export default Testimonials;
      