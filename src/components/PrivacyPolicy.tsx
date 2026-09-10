import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#001a18] p-6 lg:p-12 font-sans text-[#F3E8EE]">
      <button onClick={onBack} className="flex items-center gap-2 text-[#ADFCF9] font-bold mb-8 hover:underline transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto pt-4 pb-12">
        <h1 className="text-3xl font-extrabold text-[#F3E8EE] mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-[#917C78] mb-6">Last updated: September 2026</p>
        
        <div className="space-y-6 text-sm text-[#F3E8EE]/90 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">1. Introduction</h2>
            <p>Welcome to Jobbdash. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#F3E8EE]/80">
              <li><strong className="text-[#F3E8EE]">Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong className="text-[#F3E8EE]">Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong className="text-[#F3E8EE]">Career Data:</strong> includes your resumes, job applications, interview notes, and target goals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">3. Local-First Storage</h2>
            <p>Jobbdash is designed with a local-first architecture. By default, much of your career data is stored locally in your browser to maximize your privacy and security. Cloud synchronization only occurs if you explicitly create an account and log in.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#ADFCF9] mb-2">4. AI Processing</h2>
            <p>When you use our AI features (such as ATS Match or Job Auto-fill), necessary data snippets are securely sent to our AI providers (such as Google Gemini). This data is strictly used to generate your requested insights and is not used to train public models.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
