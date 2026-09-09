import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('jobbdash_cookie_consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('jobbdash_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#001f1c] border-t border-[#917C78]/30 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-[#F3E8EE] text-xs sm:text-sm max-w-4xl">
        <p>
          We use cookies to ensure you get the best experience on our website, analyze site traffic, and personalize content. 
          By continuing to use Jobbdash, you consent to our use of cookies in accordance with our <a href="#" className="text-[#ADFCF9] underline">Privacy Policy</a>.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={handleAccept}
          className="px-6 py-2 bg-[#90A955] hover:bg-[#a2be64] text-[#00221f] font-bold rounded-lg text-sm transition-colors"
        >
          Accept & Continue
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-[#917C78] hover:text-[#F3E8EE] rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
