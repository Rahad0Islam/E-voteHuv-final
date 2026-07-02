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

const PrivacyPolicy = () => {
  return (
    <div className={`min-h-screen ${COLOR_MAP.SCI_BG}`}>
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className={`text-4xl font-extrabold mb-2 ${COLOR_MAP.TEXT_PRIMARY}`}>
            Privacy Policy for E-votehub
          </h1>
          <p className={`text-lg ${COLOR_MAP.TEXT_SECONDARY}`}>
            Last Updated: November 2025
          </p>
        </header>

        {/* Content Section */}
        <section className={`space-y-6 ${COLOR_MAP.TEXT_SECONDARY}`}>
          
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Introduction</h2>
            <p>
              Kindly read this privacy policy thoroughly so that you may learn more about the ways in which we use and protect your personal information. **E-votehub** is committed to the highest ethical standards and is sensitive to the perspective that **E-votehub** would be dealing with data and information that may be personal in nature.
            </p>
            <p>
              By using this platform/website and providing your personal information, you agree to the terms of **E-votehub**'s online privacy policy and to its processing of such personal information for the purposes explained in this policy. As part of our normal operations we collect, and in some cases, disclose information about you.
            </p>
            <p>
              By registering on the site or by subscribing to a service and providing your contact details (telephone, email, mobile number, etc.), you agree that this action constitutes a consent, for the purposes of the telemarketing laws, to receive information about products and services (“Services”) from **E-votehub**. You hereby agree to our contacting you pursuant to the business relationship established using the information you provide to **E-votehub**.
            </p>
            <p>
              We advise you to read this privacy policy regarding the collection, use, and disclosure of your information. If you are not comfortable with any of the terms or policies described in this Privacy Policy, you must discontinue use of our platform/Website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Privacy and Security</h2>
            <p>
              Your privacy is of utmost importance to us. We follow stringent procedures to protect the security of the information and data stored on our platform/Website. The information that you have shared on our Website is stored in a secure server with encryption and can be accessed only for official purposes. Any of our employees who violate our privacy and/or security policies related to user’s data is subject to disciplinary action, including possible termination and civil and/or criminal prosecution.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Registration</h2>
            <p>
              On signing up on the **E-votehub** platform, you are required to provide us with certain basic mandatory information including your e-mail id, name, gender, password, etc. Once the registration is completed, the said e-mail, password, roll, registration, etc., or a certain combination can be used to access your account every time you visit our platform/Website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Information We Collect</h2>
            <p>
              **E-votehub** collects information that is either anonymous or personally identifiable.
            </p>
            
            <h3 className={`text-xl font-semibold ${COLOR_MAP.TEXT_PRIMARY} mt-6`}>Anonymous/Automatic Information</h3>
            <p>
              When you visit our site, we collect and store the name of the domain from which you access the internet, the date and time you access our site, the internet address of the website from which you link to our site, the search terms you enter, browser software, and internet service provider you use, and any other relevant information, in order to improve security, analyze trends and administer the site. Our analytic tools may also capture anonymous information such as your demographic and geographic information, with a view to assist us in improving customer experience. We use this information to evaluate traffic patterns on our site, so that we can make it more useful to our visitors.
            </p>
            
            <h3 className={`text-xl font-semibold ${COLOR_MAP.TEXT_PRIMARY} mt-6`}>Information You Provide Us (Personally Identifiable)</h3>
            <p>
              We receive and store any information you enter on our platform or give us in any other way, including but not limited to name, profile picture, gender, email id, telephone number, mobile number, course details, grade etc.
            </p>
            <p>
              *Note: If E-votehub implements roles such as "Student" or "Tutor" (as in the original policy), the following information would apply:*
              **As a Nominee/Candidate (If Applicable):** Information collected may include your name, role/post sought, academic details, and personal statement/profile information.
            </p>
            <p>
              You can choose not to provide certain information, but in such event you may not be able to take advantage of many of our features (e.g., voting or nomination). We use the information you provide for such purposes as responding to your requests, customizing future interactions for you, improving our platform, and communicating with you.
            </p>
            <p>
              **Sharing of Information:** **E-votehub** may, as required or permitted by law or in the course of performing our regulatory responsibilities, provide personally identifiable information, such as your name and address, or any other information that you provide, without your permission to persons or organizations that request this information.
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Communications</h2>
            
            <h3 className={`text-xl font-semibold ${COLOR_MAP.TEXT_PRIMARY} mt-6`}>E-mail Communications</h3>
            <p>
              Registration to **E-votehub** Services shall entitle us to send you promotional and transactional emails from **E-votehub**. If you do not want to receive promotional e-mails, you may unsubscribe by clicking on ‘unsubscribe’ at the footer of any promotional email received from **E-votehub**.
            </p>

            <h3 className={`text-xl font-semibold ${COLOR_MAP.TEXT_PRIMARY} mt-6`}>SMS and Voice Communications</h3>
            <p>
              Upon subscribing to any services on our platform, we shall be entitled to use your registered mobile number to send transaction related SMS/Voice calls to you, irrespective of DND services being activated on your mobile (where legally permissible). We may occasionally send promotional SMS/Voice Calls to your registered mobile number.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Payment Information (If Applicable)</h2>
            <p>
              When a payment is required (e.g., for nomination fees or services), **E-votehub** currently facilitates transactions through **bKash**. We will provide a designated bKash account number for the transaction.
            </p>
            <p>
              We want to assure you that **we do not store any bKash account details, PINs, or any other financial information** on our platform/website. The transaction is conducted entirely through the bKash mobile financial service system.
            </p>
            <p>
              Upon successful completion of the bKash transaction, you may be required to provide the transaction reference ID for verification purposes. As the payment process is external to our platform, we are not responsible for the security or confidentiality of the bKash transaction itself.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Cookies and Tracking Technologies</h2>
            <p>
              Some of our applications use **cookies**. The cookies are files which will identify your computer or your “session” to our server as a unique user when you visit pages on our website. Once you exit our site, these “session cookies” typically expire. We also use “tracking cookies” to collect information regarding website usage (e.g., the number of visitors to different sections of our website) to analyze traffic to our platform and improve user experience.
            </p>
            <p>
              We use cookies only to ensure your improved experience and not for obtaining or using any other personally identifiable information about you. You may configure your browser to prevent cookies from being set on your computer. If you reject cookies, you may still use the site, but your ability to use some features of the website may be limited and you may not be able to use certain features of the platform.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Social Media Links/Widgets</h2>
            <p>
              The Website may include certain social media features, such as the ‘Facebook like’ button and widgets such as the ‘Share this button’ or interactive mini-programs that run on the Website. On using these features, the IP addresses of the user may be collected depending on the page that is being visited and the Website may set appropriate cookies to enable the feature to function properly. The social media features and widgets are either hosted by a third party or hosted directly on the Website. Your interactions with these features are governed by the privacy policy of the company providing them.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Server Logs</h2>
            <p>
              In order to ensure easy and comfortable surfing on our Website, each time you visit our Website, the server collects certain statistical information. These statistics are only used to provide us information in relation to the type of user using our website by maintaining history of page viewed and at no point do they identify the personal details of the user. We may make use of this data to understand how our Website is being used.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${COLOR_MAP.TEXT_PRIMARY}`}>Data Security</h2>
            <p>
              We have in place appropriate technical and security measures to prevent unauthorized or unlawful access to or accidental loss of or destruction or damage to your information. When we collect data through our platform, we collect your personal details on a secured server. 
            </p>
            <p>
              **E-votehub** utilizes various information security measures such as firewalls, encrypted data transmission, and other security techniques to protect your personal data. However, please keep in mind that transmitting information via the internet is never completely secure and thus any information submitted may be intercepted, collected, used or disclosed by others. As per our security procedures, we may occasionally request proof of identity before we disclose personal information to you. **You are responsible for protecting against unauthorized access to your password and to your computer.** We are not responsible for the security or confidentiality of communications you send to us through the internet using email messages.
            </p>
          </div>

        </section>

      </main>

      {/* 6. PERSISTENT FOOTER */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;