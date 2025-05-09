      // components/carousel/FAQs.jsx
      "use client"; // Directive needed for hooks and state

      import React, { useState, useEffect } from 'react';
      import { useTranslation } from 'react-i18next';
      // --- IMPORTANT: Adjust this import path ---
      // Ensure this points to your configured i18n instance if it's not globally provided
      // import i18n from '../../i18n'; // Example path
      // --- End Adjust Path ---

      // Helper function remains the same
      const renderFormattedContent = (content) => {
        if (!content) return null;
        const lines = content.split('\n');
        const result = [];
        let currentList = [];
        let listType = null; // 'bullet' or 'numeric'

        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          const isBullet = trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ');
          const isNumeric = /^\d+\.\s/.test(trimmedLine);

          if (isBullet || isNumeric) {
            const newListType = isBullet ? 'bullet' : 'numeric';
            // Finish previous list if type changes or if starting a new list
            if (listType !== newListType && currentList.length > 0) {
              result.push(
                listType === 'bullet'
                  ? <ul key={`list-${result.length}`} className="list-disc pl-6 mb-4">{currentList}</ul>
                  : <ol key={`list-${result.length}`} className="list-decimal pl-6 mb-4">{currentList}</ol>
              );
              currentList = []; // Reset for the new list
            }
            listType = newListType; // Set the current list type
            // Add list item
            const itemContent = trimmedLine.replace(/^[•*]\s|^\d+\.\s/, '');
            currentList.push(<li key={index} className="mb-2">{itemContent}</li>);
          } else if (trimmedLine) { // Regular paragraph
            // Finish any pending list before adding paragraph
            if (currentList.length > 0) {
              result.push(
                listType === 'bullet'
                  ? <ul key={`list-${result.length}`} className="list-disc pl-6 mb-4">{currentList}</ul>
                  : <ol key={`list-${result.length}`} className="list-decimal pl-6 mb-4">{currentList}</ol>
              );
              currentList = [];
              listType = null;
            }
            // Add the paragraph
            result.push(<p key={index} className="mb-3">{trimmedLine}</p>);
          }
          // Ignore empty lines for rendering purposes
        });

        // Add any remaining list at the end
        if (currentList.length > 0) {
          result.push(
            listType === 'bullet'
              ? <ul key={`list-${result.length}`} className="list-disc pl-6 mb-4">{currentList}</ul>
              : <ol key={`list-${result.length}`} className="list-decimal pl-6 mb-4">{currentList}</ol>
          );
        }
        return result;
      };


      function FAQs() {
        const { t, i18n } = useTranslation(); // Get i18n instance
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

        // Define questions structure using translation keys
        const questionKeys = [
          'faqs.questions.coaching.tiers',
          'faqs.questions.coaching.right_package',
          'faqs.questions.coaching.change_subscription',
          'faqs.questions.coaching.communication',
          'faqs.questions.consultation.booking',
          'faqs.questions.consultation.preparation',
          'faqs.questions.consultation.reschedule',
          'faqs.questions.consultation.advance_booking',
          'faqs.questions.consultation.followup',
          'faqs.questions.analysis.types',
          'faqs.questions.analysis.information',
          'faqs.questions.analysis.delivery',
          'faqs.questions.pitch_deck.offering',
          'faqs.questions.chatbot.purpose',
          'faqs.questions.general.payments',
        ];

        // Function to get translated questions and answers
        const getTranslatedQuestions = () => questionKeys.map(key => ({
          key: key, // Store key for comparison
          question: t(`${key}.question`),
          answer: t(`${key}.answer`),
        }));

        // Initialize state with translated content
        const [questions, setQuestions] = useState(getTranslatedQuestions());
        const [currentQuestion, setCurrentQuestion] = useState(questions[0] || { key: '', question: 'Loading...', answer: '' });

        // Update questions and current question when language changes
        useEffect(() => {
          const translated = getTranslatedQuestions();
          setQuestions(translated);
          // Try to keep the same question selected if possible, otherwise default to first
          const currentKey = currentQuestion.key;
          const newCurrent = translated.find(q => q.key === currentKey) || translated[0];
          setCurrentQuestion(newCurrent || { key: '', question: 'Loading...', answer: '' });
        }, [t, i18n.language]); // Depend on t and language

        const toggleDropdown = (e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        };

        const handleQuestionSelect = (selectedKey) => {
          const selectedQuestion = questions.find(q => q.key === selectedKey);
          if (selectedQuestion) {
             setCurrentQuestion(selectedQuestion);
          }
          setIsDropdownOpen(false);
        };

        // Close dropdown if clicked outside
        useEffect(() => {
          const handleClickOutside = () => {
             if (isDropdownOpen) {
                setIsDropdownOpen(false);
             }
          };
          document.addEventListener('click', handleClickOutside);
          return () => document.removeEventListener('click', handleClickOutside);
        }, [isDropdownOpen]);


        return (
          <section id="faqs" className="w-full h-auto"> {/* Removed id="faqs2" */}
            <div className="max-w-4xl md:max-w-6xl mx-auto h-full flex flex-col">
              <h2 className="text-2xl md:text-4xl py-4 font-bold text-center text-black">
                {t('faqs.title')}
              </h2>

              <div className="relative w-full flex flex-col flex-1">
                <div className="rounded-xl overflow-hidden flex flex-col h-full">
                  <div className="flex flex-col h-full">
                    <div className="relative">
                      {/* Selected Question Header - Stop propagation */}
                      <div
                        className="py-3 flex flex-col cursor-pointer rounded-xl"
                        onClick={toggleDropdown}
                      >
                        <div className="flex justify-between items-center w-full px-4">
                          <h3 className="text-lg md:text-2xl font-semibold text-black flex-grow text-left mr-2"> {/* Added text-left and margin */}
                            {currentQuestion.question}
                          </h3>
                          <svg
                            className={`w-6 h-6 md:w-8 md:h-8 transform transition-transform duration-300 flex-shrink-0 ${ // Added flex-shrink-0
                              isDropdownOpen ? 'rotate-180' : ''
                            }`}
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {/* Separator */}
                        <span className="block w-[95%] my-2 mx-auto border-b-2 border-oxfordBlue rounded-xl" />
                      </div>

                      {/* Dropdown List - Stop propagation */}
                      {isDropdownOpen && (
                        <div
                          className="absolute rounded-xl left-0 right-0 z-20 bg-white -mt-1 shadow-lg py-2 max-h-[40vh] overflow-y-auto border border-gray-200" // Added border
                          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking dropdown itself
                        >
                          {questions.map((option) => (
                            <div
                              key={option.key}
                              className={`relative w-[95%] md:w-[97%] mx-auto rounded-lg py-2 px-4 cursor-pointer transition-colors duration-200 my-1 ${ // Adjusted width/margin
                                currentQuestion.key === option.key
                                  ? 'bg-oxfordBlue text-white font-medium' // Highlight selected
                                  : 'hover:bg-gray-100 text-gray-800'
                              }`}
                              onClick={() => handleQuestionSelect(option.key)}
                            >
                              {option.question}
                              {/* Separator only for non-selected items */}
                              {currentQuestion.key !== option.key && (
                                <span className="block w-full mx-auto border-b border-gray-200 mt-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Answer Section */}
                    <div className="flex-1 flex items-start p-4 overflow-y-auto min-h-[200px]"> {/* Added min-height */}
                      <div className="text-base md:text-xl text-black leading-relaxed text-left"> {/* Added text-left */}
                        {renderFormattedContent(currentQuestion.answer)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      export default FAQs;
      