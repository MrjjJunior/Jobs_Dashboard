import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, Mail, Send, RefreshCw } from 'lucide-react';
import { JobApplication } from '../types';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobApplication[];
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  isOpen,
  onClose,
  jobs,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [emailType, setEmailType] = useState<'thank_you' | 'follow_up' | 'negotiation' | 'withdraw'>('thank_you');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const generateDraft = () => {
    if (!currentJob) return 'Please select a job application to generate a template.';

    const company = currentJob.company;
    const role = currentJob.role;
    const contact = currentJob.contactName || currentJob.interviews?.[0]?.interviewer || 'Hiring Team';

    if (emailType === 'thank_you') {
      return `Subject: Thank you - ${role} interview | [Your Name]

Dear ${contact},

Thank you so much for taking the time to speak with me today regarding the ${role} position at ${company}. I really enjoyed learning more about the team's upcoming initiatives and the impact of this role.

Our discussion reinforced my enthusiasm for joining ${company}. I am confident that my background and problem-solving approach align well with your objectives.

Please let me know if there are any additional materials or details I can provide. Looking forward to hearing from you.

Best regards,
[Your Name]
[Your Phone Number]
[Your LinkedIn / Portfolio]`;
    }

    if (emailType === 'follow_up') {
      return `Subject: Checking in: ${role} Application - [Your Name]

Dear ${contact},

I hope you're having a productive week.

I am following up on my application for the ${role} role at ${company}. I remain very interested in the opportunity and would love to know if you have any updates on the next steps in the hiring process.

Thank you again for your time and consideration.

Warm regards,
[Your Name]`;
    }

    if (emailType === 'negotiation') {
      return `Subject: ${company} - ${role} Offer Discussion - [Your Name]

Dear ${contact},

Thank you so much for offering me the ${role} role at ${company}. I am thrilled about the opportunity to work together!

After carefully reviewing the offer details and considering the scope of responsibilities and market benchmarks for this seniority level, I would like to discuss the possibility of adjusting the base compensation towards [Target Amount] or exploring additional equity/signing bonus structures.

I am eager to find a mutually great package and look forward to speaking soon.

Sincerely,
[Your Name]`;
    }

    return `Subject: Update regarding ${role} application - [Your Name]

Dear ${contact},

Thank you for your consideration for the ${role} position at ${company}. 

I am writing to respectfully withdraw my application as I have accepted another offer that closely aligns with my current timeline. I appreciate your time and hope our paths cross again in the future.

Best regards,
[Your Name]`;
  };

  const draftText = generateDraft();

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Career Coach AI Email Assistant</h3>
              <p className="text-[11px] text-blue-100">Draft professional follow-ups and thank-you emails in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Application
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} - {j.role} ({j.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Purpose
              </label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="thank_you">Post-Interview Thank You</option>
                <option value="follow_up">Status Follow-up Check-in</option>
                <option value="negotiation">Offer Negotiation Request</option>
                <option value="withdraw">Respectful Withdrawal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Draft Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Generated Message Preview
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Ready to customize & send</span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
            {draftText}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
