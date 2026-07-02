import React from 'react';
import { Link } from 'react-router-dom';

// Color mapping for consistent theming across all pages
// Adopted from Login.jsx/Register.jsx
const COLOR_MAP = {
  SCI_BG: 'bg-white dark:bg-[#0f1628]',
  TEXT_PRIMARY: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-slate-600 dark:text-slate-400',
  SCI_ACCENT_TEXT: 'text-[#1E3A8A] dark:text-[#3B82F6]',
  BORDER: 'border-gray-200 dark:border-gray-700',
};

// --- Inline SVG Icons (Replacing lucide-react for single-file mandate) ---
const LockIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const TrendingUpIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
const ShieldCheckIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 4.75 2.5 7.5 7.5 7.5S20 17.75 20 13z"></path><path d="m9 12 2 2 4-4"></path></svg>);
const UsersIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const MailIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"></path></svg>);

const Footer = () => (
  <footer className={`${COLOR_MAP.SCI_BG} border-t border-gray-200 dark:border-gray-700 mt-16 py-12`}>
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
      
      {/* 1. Logo and Mission - FIXED TO MATCH NAVBAR/HERO STYLE */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center mb-4">
            {/* Theme-aware E-VoteHub text using gradient */}
            <span 
                className={`text-xl font-bold bg-clip-text text-transparent 
                    bg-gradient-to-r 
                    from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-500`}
            >
                E-VoteHub
            </span>
        </div>
        <p className={`text-xs ${COLOR_MAP.TEXT_SECONDARY} max-w-xs`}>
          Unifying secure online voting with dynamic social campaigning to drive democratic engagement.
        </p>
      </div>

      {/* 2. Navigation Links */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Platform</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Home</Link></li>
          <li><Link to="/user" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Dashboard</Link></li>
          <li><Link to="/profile" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Profile Settings</Link></li>
        </ul>
      </div>

      {/* 3. Resources/Legal Links */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Resources</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/privacyPolicy" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Privacy Policy</Link></li>
          <li><Link to="/terms" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Terms & Conditions</Link></li>
          <li><Link to="/aboutus" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>About Us</Link></li>
        </ul>
      </div>

      {/* 4. Contact */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Contact</h4>
        <p className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} flex items-center mb-2`}>
            <MailIcon className={`w-4 h-4 mr-2 ${COLOR_MAP.SCI_ACCENT_TEXT}`}/>
            rahad@gmail.com
        </p>
        <p className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} flex items-center mb-2`}>
            <MailIcon className={`w-4 h-4 mr-2 ${COLOR_MAP.SCI_ACCENT_TEXT}`}/>
            autanu2020@gmail.com
        </p>
        <p className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} flex items-center mb-2`}>
            <MailIcon className={`w-4 h-4 mr-2 ${COLOR_MAP.SCI_ACCENT_TEXT}`}/>
            shajjad@gmail.com
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-600">
            [Shajalal University of Science and Technology]
        </p>
      </div>

    </div>

    {/* Bottom Copyright and ID */}
    <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t border-gray-300 dark:border-slate-700 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-600">
        &copy; {new Date().getFullYear()} E-VoteHub. All rights reserved <span className="font-mono text-gray-400 dark:text-slate-700/50"></span>
      </p>
    </div>
  </footer>
);

const Terms = () => {
  return (
    <div className={`min-h-screen ${COLOR_MAP.SCI_BG}`}>
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className={`text-4xl font-extrabold mb-2 ${COLOR_MAP.TEXT_PRIMARY}`}>
            Terms and Conditions of Use
          </h1>
          <p className={`text-lg ${COLOR_MAP.TEXT_SECONDARY}`}>
            Governing the use of the E-votehub Platform
          </p>
        </header>

        {/* Content Section */}
        <section className={`space-y-8 ${COLOR_MAP.TEXT_SECONDARY}`}>
          
          {/* 1. Acceptance of Terms */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>1. Acceptance of Terms</h2>
            <p>
              This website/platform is owned and operated by **E-votehub**. Kindly read these terms and conditions ("Terms") carefully as your use of the services is subject to your acceptance of and compliance with these Terms, which constitute a binding contract between you and **E-votehub**. By accessing this platform, registering as a user, or using any of its services (including casting a vote or registering a nomination), you agree that you have read, understood, and are bound by these Terms. If you do not agree to be bound by these Terms, you must not use our services.
            </p>
            <p>
              The Terms set out herein may be altered or amended from time to time. You are recommended to read and understand the Terms regularly, as the continued use of the platform after any changes constitutes your acceptance of the new Terms.
            </p>
          </div>

          {/* 2. Eligibility for Use and Account Obligations */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>2. Eligibility and Account Obligations</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                    **Eligibility:** Use of the platform is available only to persons who can form legally binding contracts (e.g., typically 18 years of age or older). If you are a minor, you shall not use the platform without permission from your guardian.
                </li>
                <li>
                    **Accurate Information:** You agree to provide accurate, true, current, and complete information about yourself as prompted by the registration form. If any information is found to be false, inaccurate, or incomplete, **E-votehub** reserves the right to suspend or terminate your account and refuse any current or future use of the platform.
                </li>
                <li>
                    **Account Security:** You are responsible for maintaining the confidentiality of your Login ID/Password/Registration number/Roll and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account. You must notify **E-votehub** immediately of any unauthorized use of your account or any other breach of security.
                </li>
                <li>
                    **Non-Transferable:** You are prohibited from selling, trading, or otherwise transferring your account to any other party.
                </li>
            </ul>
          </div>

          {/* 3. Electronic and SMS Communications */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>3. Electronic Communications</h2>
            <p>
              When you visit the **E-votehub** platform or send email(s) to us, you are communicating with us electronically. You consent to receive communications from this platform by email or SMS regarding your account, election events, and service updates. You agree that all disclosures, agreements, notices, and other communications provided to you electronically satisfy all legal requirements.
            </p>
          </div>

          {/* 4. Prohibited Uses of the Platform */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>4. Prohibited Uses and Misuse</h2>
            <p>
              You agree and confirm that you shall not use the platform for any of the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Disseminating any unlawful, harassing, libelous, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable material.</li>
                <li>Gaining unauthorized access to other computer systems or user data.</li>
                <li>Interfering with any other person’s use or enjoyment of the platform.</li>
                <li>Using, displaying, mirroring, or framing the platform, its trademark, logo, or other proprietary information without our express written consent.</li>
                <li>Impersonating or misrepresenting your affiliation with any person or entity.</li>
                <li>Making, transmitting, or storing electronic copies of materials protected by copyright without the permission of the copyright owner.</li>
                <li>Breaching or violating any applicable laws, rules, or regulations related to voting or elections.</li>
            </ul>
          </div>

          {/* 5. Payment and Fraudulent Transactions (Updated Section) */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>5. Payment Information (bKash Transactions)</h2>
            <p>
              If a transaction or payment is required (e.g., for nomination fees), you agree and confirm that the payment will be made via the designated **bKash** account number provided by E-votehub. You must accurately provide the bKash transaction ID or reference number as required for verification.
            </p>
            <p>
              **E-votehub** shall not be liable for any loss arising from incorrect bKash account details provided by the user, payment delays caused by the bKash network, or failure to provide correct transaction details. You are solely responsible for ensuring the payment is successful and verifiable.
            </p>
            
            <p className='font-semibold mt-4'>Cancellations and Adjustments:</p>
            <p>
              Fees paid for any service on the platform are generally non-refundable. However, if due to a technical or payment processing error an excess amount is paid, the user must claim the refund of the extra amount within **3 days**. Approved refunds will be processed back to the original bKash or other designated account within **7-10 working days**.
            </p>
          </div>

          {/* 6. Reviews, Feedback, and Submissions */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>6. User Submissions and Intellectual Property</h2>
            <p>
              All reviews, comments, feedback, suggestions, ideas, and other submissions disclosed, submitted, or offered on or by this platform (collectively, the “Comments”) shall be and remain **E-votehub**’s property. By making a Comment, you assign to **E-votehub** all worldwide rights, titles, and interests in all copyrights and other intellectual properties in the Comments. **E-votehub** shall not be limited in any way in its use, commercial or otherwise, of any Comments without compensating you. You are solely responsible for the content of any Comments that you make and you agree to indemnify **E-votehub** and its affiliates for all claims resulting from any Comments you submit.
            </p>
          </div>

          {/* 7. Governing Law and Dispute Resolution */}
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>7. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the applicable laws of the jurisdiction where E-votehub operates. Any disputes or differences arising out of these Terms shall be referred to an independent arbitrator, whose decision shall be final and binding on you, in accordance with applicable arbitration laws. The language and venue of arbitration will be decided by the platform operator.
            </p>
          </div>

        </section>

      </main>

      {/* 6. PERSISTENT FOOTER */}
      <Footer />
    </div>
  );
};

export default Terms;