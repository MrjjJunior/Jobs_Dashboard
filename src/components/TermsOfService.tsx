import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#001a18] p-6 lg:p-12 font-sans text-[#F3E8EE]">
      <button onClick={onBack} className="flex items-center gap-2 text-[#ADFCF9] font-bold mb-8 hover:underline transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto bg-[#002824] p-8 sm:p-12 rounded-2xl shadow-xl border border-[#917C78]/30">
        <h1 className="text-3xl font-extrabold text-[#F3E8EE] mb-6 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-[#917C78] mb-6">Last updated: September 2026</p>
        
        <div className="space-y-6 text-sm text-[#F3E8EE]/90 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">1. Agreement to Terms</h2>
            <p>By accessing or using Jobbdash, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Jobbdash for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">3. Disclaimer</h2>
            <p>The materials on Jobbdash are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">4. User Account and Data</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. Jobbdash provides robust data export and deletion tools. It is your responsibility to maintain backups of your local-first career data if you choose not to synchronize it to our cloud servers.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
