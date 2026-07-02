import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, renew } from '../lib/api';
import { Mail } from 'lucide-react';

// Color mapping for consistent theming across all pages
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

export default function Login(){
  const [UserName, setUserName] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bgStyle, setBgStyle] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    if (isDark) {
      setBgStyle({
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Cpath fill=\'%230f1628\' fill-opacity=\'0.5\' d=\'M3 0h1v1h-1zM6 0h1v1h-1zM9 0h1v1h-1zM12 0h1v1h-1zM15 0h1v1h-1zM18 0h1v1h-1zM21 0h1v1h-1zM24 0h1v1h-1zM27 0h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM6 3h1v1h-1zM9 3h1v1h-1zM12 3h1v1h-1zM15 3h1v1h-1zM18 3h1v1h-1zM21 3h1v1h-1zM24 3h1v1h-1zM27 3h1v1h-1zM0 6h1v1h-1zM3 6h1v1h-1zM6 6h1v1h-1zM9 6h1v1h-1zM12 6h1v1h-1zM15 6h1v1h-1zM18 6h1v1h-1zM21 6h1v1h-1zM24 6h1v1h-1zM27 6h1v1h-1zM0 9h1v1h-1zM3 9h1v1h-1zM6 9h1v1h-1zM9 9h1v1h-1zM12 9h1v1h-1zM15 9h1v1h-1zM18 9h1v1h-1zM21 9h1v1h-1zM24 9h1v1h-1zM27 9h1v1h-1zM0 12h1v1h-1zM3 12h1v1h-1zM6 12h1v1h-1zM9 12h1v1h-1zM12 12h1v1h-1zM15 12h1v1h-1zM18 12h1v1h-1zM21 12h1v1h-1zM24 12h1v1h-1zM27 12h1v1h-1zM0 15h1v1h-1zM3 15h1v1h-1zM6 15h1v1h-1zM9 15h1v1h-1zM12 15h1v1h-1zM15 15h1v1h-1zM18 15h1v1h-1zM21 15h1v1h-1zM24 15h1v1h-1zM27 15h1v1h-1zM0 18h1v1h-1zM3 18h1v1h-1zM6 18h1v1h-1zM9 18h1v1h-1zM12 18h1v1h-1zM15 18h1v1h-1zM18 18h1v1h-1zM21 18h1v1h-1zM24 18h1v1h-1zM27 18h1v1h-1zM0 21h1v1h-1zM3 21h1v1h-1zM6 21h1v1h-1zM9 21h1v1h-1zM12 21h1v1h-1zM15 21h1v1h-1zM18 21h1v1h-1zM21 21h1v1h-1zM24 21h1v1h-1zM27 21h1v1h-1zM0 24h1v1h-1zM3 24h1v1h-1zM6 24h1v1h-1zM9 24h1v1h-1zM12 24h1v1h-1zM15 24h1v1h-1zM18 24h1v1h-1zM21 24h1v1h-1zM24 24h1v1h-1zM27 24h1v1h-1zM0 27h1v1h-1zM3 27h1v1h-1zM6 27h1v1h-1zM9 27h1v1h-1zM12 27h1v1h-1zM15 27h1v1h-1zM18 27h1v1h-1zM21 27h1v1h-1zM24 27h1v1h-1zM27 27h1v1h-1z\'%3E%3C/svg%3E")'
      });
    } else {
      setBgStyle({ backgroundImage: 'none' });
    }
  }, []);

  // Custom component for the error message display
  const ErrorBanner = ({ message }) => (
    <div className="p-3 text-sm font-medium border rounded-lg transition-all duration-300 mb-4 animate-fadeIn dark:bg-red-800/50 dark:border-red-500 dark:text-red-300 bg-red-100 border-red-400 text-red-700">
      <span className="font-bold mr-2">Access Denied:</span> {message}
    </div>
  );

  const onSubmit = async (e)=>{
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try{
      await login({ UserName, Password });
      await renew(); // ensure fresh tokens
      
      // Navigate after successful login
      navigate('/user');

    }catch(err){
      const errorMessage = err?.response?.data?.message || 'Authentication failed. Check your User ID and Password.';
      setError(errorMessage);
      
      // Auto-clear the error message after a few seconds
      setTimeout(() => setError(null), 5000);
      
    } finally {
      setIsLoading(false);
    }
  }

  // --- Styling Classes ---
  // High-tech input style with glow effect on focus - supports both light and dark modes
  const inputClass = "w-full p-3 rounded-lg border border-transparent transition-all duration-300 focus:outline-none focus:ring-1 focus:shadow-lg font-mono text-sm " +
                     "dark:bg-black/30 dark:text-white dark:placeholder-slate-500 dark:focus:border-sciAccent dark:focus:ring-sciAccent dark:focus:shadow-cyan-500/20 " +
                     "bg-gray-100 text-slate-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:shadow-blue-500/20";
  
  // Primary button style with neon gradient and active press effect
  const buttonClass = `w-full py-3 font-bold rounded-lg transition duration-300 transform active:scale-[0.98] ${
    isLoading 
      ? 'bg-gray-600/50 text-gray-400 cursor-wait'
      : 'bg-gradient-to-r from-sciAccent to-sciAccent2 text-sciBg shadow-neon hover:shadow-2xl hover:shadow-cyan-400/40'
  }`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 py-12">
        <div 
          className="w-full max-w-sm p-8 rounded-2xl border transition-all duration-500 dark:bg-sciPanel dark:border-sciAccent/30 dark:shadow-2xl dark:shadow-cyan-900/60 dark:hover:border-sciAccent2/50 bg-white border-gray-300 shadow-lg hover:shadow-xl"
          style={bgStyle}
        >
          <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-white dark:to-sciAccent bg-gradient-to-r from-slate-900 to-blue-800">
            SYSTEM LOGIN
          </h2>

          {/* Error Banner */}
          {error && <ErrorBanner message={error} />}

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1 dark:text-slate-300 text-slate-700">
                User ID
              </label>
              <input 
                id="username"
                className={inputClass} 
                placeholder="Voter ID, Candidate ID, or Admin User" 
                value={UserName} 
                onChange={e=>setUserName(e.target.value)} 
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-slate-300 text-slate-700">
                Encrypted Key
              </label>
              <input 
                id="password"
                className={inputClass} 
                placeholder="••••••••••••••••" 
                type="password" 
                value={Password} 
                onChange={e=>setPassword(e.target.value)} 
                disabled={isLoading}
                required
              />
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              className={buttonClass}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  {/* Custom loading spinner using SVG */}
                  <svg className="animate-spin h-5 w-5 text-sciBg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ACCESSING SYSTEM...</span>
                </span>
              ) : (
                'INITIATE SIGN-IN PROTOCOL'
              )}    
            </button>
          </form>
          
          <p className="text-center mt-6 text-sm dark:text-slate-400 text-slate-600">
            Don't have an account? <Link to="/register" className="dark:text-sciAccent dark:hover:text-sciAccent2 transition-colors duration-200 underline font-semibold text-blue-600 hover:text-blue-800">REGISTER</Link>
          </p>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}