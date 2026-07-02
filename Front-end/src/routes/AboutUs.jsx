import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github } from 'lucide-react';

// --- THEME-AWARE COLOR MAPPING ---
const COLOR_MAP = {
  SCI_BG: 'bg-white dark:bg-[#0f1628]',
  TEXT_PRIMARY: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-slate-600 dark:text-slate-400',
  SCI_ACCENT_TEXT: 'text-[#1E3A8A] dark:text-[#3B82F6]',
  BORDER: 'border-gray-200 dark:border-gray-700',
  CARD_BG: 'bg-gray-50 dark:bg-[#1a2129]',
  SHADOW: 'shadow-lg dark:shadow-2xl dark:shadow-[#0c1322]',
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

// --- TEAM DATA ---
const teamMembers = [
  {
    name: "Rahad Islam",
    role: "Core Backend Architect",
    // use public/ folder images (place files at public/images/...)
    image: "/rahad.jpeg",
    social: { linkedin: 'https://www.linkedin.com/in/rahad-islam-5b2868249/', github: 'https://github.com/Rahad0Islam' } // Placeholder links
  },
  {
    name: "Autanu Datta",
    role: "UI/UX & Frontend Specialist",
    image: "/autanu.jpeg",
    social: { linkedin: 'https://www.linkedin.com/in/autanu-datta-5b7509383/', github: 'https://github.com/AD-053' } // Placeholder links
  },
  {
    name: "Md Shajjadul Ferdous",
    role: "Database & Security Engineer",
    image: "/shajjad.jpeg",
    social: { linkedin: 'https://www.linkedin.com/in/md-shajjadul-ferdous-9b01262b1/', github: 'https://github.com/shajjadulferdous' } // Placeholder links
  },
];

// --- TEAM MEMBER CARD COMPONENT ---
const TeamMemberCard = ({ member }) => (
  <div className={`p-6 ${COLOR_MAP.CARD_BG} rounded-xl ${COLOR_MAP.SHADOW} transition-all duration-300 transform hover:scale-[1.03] border ${COLOR_MAP.BORDER} flex flex-col items-center text-center`}>
    
    {/* Profile Image */}
    <div className="relative mb-6">
      <img
        src={member.image}
        alt={`Photo of ${member.name}`}
        className="w-32 h-32 object-cover rounded-full border-4 border-[#1E3A8A] dark:border-[#3B82F6] shadow-xl"
        // Fallback placeholder in case the URL fails to load
        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/128x128/9CA3AF/FFFFFF?text=PROFILE"; }}
      />
    </div>
    
    {/* Name and Role */}
    <h3 className={`text-xl font-bold mb-1 ${COLOR_MAP.TEXT_PRIMARY}`}>{member.name}</h3>
    <p className={`text-sm font-medium ${COLOR_MAP.SCI_ACCENT_TEXT} mb-4`}>{member.role}</p>

    {/* Social Links */}
    <div className="flex space-x-4">
      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${member.name}`} className={`text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition duration-150`}>
        <Linkedin size={20} />
      </a>
      <a href={member.social.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub profile of ${member.name}`} className={`text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition duration-150`}>
        <Github size={20} />
      </a>
    </div>
  </div>
);


// --- MAIN ABOUT COMPONENT ---
const About = () => {
  return (
    <div className={`min-h-screen ${COLOR_MAP.SCI_BG}`}>
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero / Title Section */}
        <section className="text-center mb-16">
          <h1 className={`text-5xl font-extrabold mb-4 ${COLOR_MAP.TEXT_PRIMARY}`}>
            Building the Future of Digital Voting
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${COLOR_MAP.TEXT_SECONDARY}`}>
            E-votehub is dedicated to providing a secure, transparent, and accessible platform for organizational and academic elections.
          </p>
          <div className="w-24 h-1 mx-auto mt-6 bg-[#1E3A8A] dark:bg-[#3B82F6] rounded-full"></div>
        </section>

        {/* 2. Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-12 mb-20">
            <div className={`p-8 rounded-xl ${COLOR_MAP.CARD_BG} ${COLOR_MAP.SHADOW} border ${COLOR_MAP.BORDER}`}>
                <h2 className={`text-3xl font-bold mb-4 ${COLOR_MAP.SCI_ACCENT_TEXT}`}>Our Mission</h2>
                <p className={`${COLOR_MAP.TEXT_SECONDARY} leading-relaxed`}>
                    To eliminate the friction and potential fraud of traditional paper-based elections by offering a robust, cryptographic e-voting solution. We aim to increase voter turnout and streamline the administrative burden of election management for universities and professional bodies.
                </p>
            </div>
            <div className={`p-8 rounded-xl ${COLOR_MAP.CARD_BG} ${COLOR_MAP.SHADOW} border ${COLOR_MAP.BORDER}`}>
                <h2 className={`text-3xl font-bold mb-4 ${COLOR_MAP.SCI_ACCENT_TEXT}`}>Our Vision</h2>
                <p className={`${COLOR_MAP.TEXT_SECONDARY} leading-relaxed`}>
                    We envision a future where every vote counts, and the integrity of the electoral process is guaranteed by cutting-edge technology. E-votehub strives to be the leading name in secure, privacy-preserving digital elections globally.
                </p>
            </div>
        </section>


        {/* 3. Meet the Team Section */}
        <section className="text-center mb-16">
          <h2 className={`text-4xl font-extrabold mb-4 ${COLOR_MAP.TEXT_PRIMARY}`}>
            Meet the Builders
          </h2>
          <p className={`text-lg max-w-3xl mx-auto mb-10 ${COLOR_MAP.TEXT_SECONDARY}`}>
            A small, dedicated team passionate about cryptography, decentralized systems, and transparent governance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </div>
        </section>

      </main>

      {/* 6. PERSISTENT FOOTER */}
      <Footer />
    </div>
  );
};

export default About;