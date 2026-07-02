import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, updateCoverImage as apiUpdateCoverImage, updateProfileImage as apiUpdateProfileImage } from '../lib/api'

// --- THEME-AWARE COLOR MAPPING (Copied from Home.jsx for consistency) ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

const COLOR_MAP = {
  // New Backgrounds: #ECEBEB (Light) and #1A2129 (Dark)
  BG_COLOR: 'bg-[#ECEBEB] dark:bg-[#1A2129]', 
  
  // Background for primary sections (Hero/Footer)
  SCI_BG: 'bg-[#ECEBEB] dark:bg-[#1A2129]', 
  
  // Background for cards and panels
  SCI_PANEL: 'bg-white dark:bg-[#111827]', // Using lighter/darker shades for contrast in card panels
  
  // Text colors for dark/light contrast
  TEXT_MAIN: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-gray-600 dark:text-slate-400',
  
  // Accent colors for buttons/highlights
  SCI_ACCENT: `bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`,
  SCI_ACCENT_TEXT: `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`,

  //Shade color for Headlines
  SHADE_MAIN: 'text-gray-900 dark:white',
  SHADE_SECONDARY: 'text-gray-500 dark:text-gray-500',
};
// --- END COLOR MAP ---

// --- Inline SVG Icons for Footer ---
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

// Mock API Functions (Unchanged)
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const getUser = () => {
  return JSON.parse(localStorage.getItem('user'))
};

// Custom component for message display (replaces alert()) (Theming applied)
const StatusMessage = ({ message, type }) => {
  if (!message) return null;
  
  // Adjusted for new theme colors and better visibility
  const baseClasses = "fixed top-4 left-1/2 -translate-x-1/2 p-4 text-sm font-medium border rounded-xl z-50 transition-all duration-300 shadow-2xl";
  let typeClasses;
  
  if (type === 'error') {
    // Brighter, more consistent error
    typeClasses = 'bg-red-700/80 border-red-500 text-white shadow-red-900/60 backdrop-blur-sm'; 
  } else if (type === 'success') {
    // Green success styling
    typeClasses = 'bg-green-600/80 dark:bg-green-700/80 border-green-500 dark:border-green-600 text-white shadow-lg shadow-green-500/40 dark:shadow-green-700/40 backdrop-blur-sm';
  } else {
      return null;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="font-bold mr-2">{type === 'error' ? 'ERROR::' : 'SUCCESS::'}</span> {message}
    </div>
  );
};

// Helper components for clean presentation (Theming applied)
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-800 last:border-b-0">
    <span className={`${COLOR_MAP.TEXT_SECONDARY} font-mono text-xs uppercase tracking-wider`}>{label}</span>
    <span className={`${COLOR_MAP.TEXT_MAIN} font-semibold text-base`}>{value || '—'}</span>
  </div>
);

// --- REMOVED ActionItem Component ---


export default function Profile(){
  // Initialize state using the mock getUser function
  const [user, setUserState] = useState(()=> getUser() || {}) // Added fallback for user object
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  const [showPwd, setShowPwd] = useState(false)
  const [pwdOld, setPwdOld] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdNew2, setPwdNew2] = useState('')

  const coverInput = useRef(null)
  const avatarInput = useRef(null)

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };

  // Sync state with localStorage changes
  useEffect(()=>{
    const onStorage = ()=> setUserState(getUser() || {}) // Added fallback for user object
    window.addEventListener('storage', onStorage)
    const id = setInterval(onStorage, 800) // Poll for changes as 'storage' event is inconsistent
    return ()=> { window.removeEventListener('storage', onStorage); clearInterval(id); }
  },[])

  const onPickCover = ()=> coverInput.current?.click()
  const onPickAvatar = ()=> avatarInput.current?.click()

  const onCoverChange = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return
    
    setMessage(null);
    setBusy(true);

    try{ 
      // Use real API to update cover image (persists in DB)
      const updated = await apiUpdateCoverImage(file); 
      if(updated){ 
        setUserState(updated);
        showMessage('Cover image successfully updated.', 'success');
      } 
    }
    catch(err){ 
      showMessage(err?.response?.data?.message || err?.message || 'Failed to update cover image.', 'error');
    }
    finally{ 
      setBusy(false);
      e.target.value = null; 
    }
  }
  
  const onAvatarChange = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return

    setMessage(null);
    setBusy(true);

    try{ 
      // Use real API to update profile image (persists in DB)
      const updated = await apiUpdateProfileImage(file); 
      if(updated){ 
        setUserState(updated);
        showMessage('Profile photo successfully updated.', 'success');
      } 
    }
    catch(err){ 
      showMessage(err?.response?.data?.message || err?.message || 'Failed to update profile photo.', 'error');
    }
    finally{ 
      setBusy(false); 
      e.target.value = null;
    }
  }

  const onChangePassword = async ()=>{
    if(!pwdOld || !pwdNew || !pwdNew2){ return showMessage('All password fields are required') }
    if(pwdNew !== pwdNew2){ return showMessage('New passwords do not match') }
    try{
      setBusy(true)
      await changePassword({ OldPassword: pwdOld, NewPassword: pwdNew })
      setPwdOld(''); setPwdNew(''); setPwdNew2(''); setShowPwd(false)
      showMessage('Password updated successfully', 'success')
    }catch(err){
      showMessage(err?.response?.data?.message || 'Failed to update password')
    }finally{ setBusy(false) }
  }

  // --- Design Variables (Updated with COLOR_MAP) ---
  const accentColorClass = COLOR_MAP.SCI_ACCENT_TEXT; // e.g., text-[blue] dark:text-[lightblue]
  const panelBgClass = COLOR_MAP.SCI_PANEL; // e.g., bg-white dark:bg-[#111827]
  const cardBorderClass = 'border-gray-200 dark:border-slate-800'; // Theme consistent border
  const shadowEffectClass = 'shadow-xl shadow-gray-300/50 dark:shadow-gray-900/50';

  // Enhanced primary button class (Updated with COLOR_MAP)
  const accentButtonClass = (primary = true) => "px-4 py-2 text-sm rounded-lg transition duration-200 font-semibold shadow-lg " +
    (primary 
      // Primary button uses SCI_ACCENT for background
      ? `${COLOR_MAP.SCI_ACCENT} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`
      // Secondary button uses border/text with hover background effect
      : `border border-gray-400 dark:border-gray-600 ${COLOR_MAP.TEXT_MAIN} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800/50`);
                            
  const panelClass = `p-6 rounded-xl border ${cardBorderClass} ${panelBgClass} ${shadowEffectClass}`;

  // Check if user is null or empty object, provide fallback defaults
  const safeUser = user || {};
  const fullName = safeUser.FullName || 'UNKNOWN USER';
  const userName = safeUser.UserName || 'user.name';
  const role = safeUser.Role ? safeUser.Role.toUpperCase() : 'VOTER';


  return (
    <div className={`min-h-screen flex flex-col ${COLOR_MAP.BG_COLOR}`}>
      <div className={`max-w-6xl mx-auto w-full px-4 py-8 relative flex-1`}>
        <StatusMessage message={message} type={messageType} />

        {/* --- Header / Cover Area --- */}
        <div className={`relative rounded-xl overflow-hidden shadow-2xl ${shadowEffectClass} border ${cardBorderClass} mb-8`}>
          
          {/* Cover Image */}
          <div className={`aspect-[3/1] ${panelBgClass}`}>
            {safeUser.CoverImage ? (
              <img 
                src={safeUser.CoverImage} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01] opacity-90" 
                alt="cover" 
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${COLOR_MAP.TEXT_SECONDARY} text-lg font-mono`}>
                [COVER: UPLOAD REQUIRED]
              </div>
            )}
          </div>
          
          {/* Change Cover Button */}
          <button 
            onClick={onPickCover} 
            disabled={busy} 
            className={`absolute top-4 right-4 z-10 ${accentButtonClass(true)}`}
          >
            {busy ? 'SYNCHRONIZING...' : 'CHANGE COVER'}
          </button>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />

          {/* Profile Avatar and Info Block */}
          <div className="absolute bottom-0 rounded-full left-10 flex items-end gap-3 z-20"> 
            
          
            <div className={`relative w-32 h-32 border-4 md:w-40 md:h-40 rounded-full overflow-hidden ${panelBgClass} shadow-2xl shadow-gray-800/30 dark:shadow-black/70 group border-white dark:border-slate-900`}>
              {safeUser.ProfileImage ? (
                <img 
                  src={safeUser.ProfileImage} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  alt="avatar" 
                />
              ) : (
                // Fallback
                <div className={`w-full h-full flex items-center justify-center text-5xl font-bold ${accentColorClass}`}>
                  {fullName[0]}
                </div>
              )}
              
              {/* Change Avatar Button (Overlay) */}
              <button 
                onClick={onPickAvatar} 
                disabled={busy} 
                className="absolute inset-0 w-full h-full rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera mb-1"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5L14.5 4z"/><circle cx="12" cy="13" r="3"/></svg>
                <span className="text-xs font-semibold">{busy ? 'UPLOADING...' : 'CHANGE AVATAR'}</span>
              </button>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </div>
            
            {/* User Display Name */}
            <div className="pb-4 font-sans hidden md:block">
              <div className={`text-3xl font-extrabold bg-clip-text text-transparent 
                  bg-gradient-to-r from-gray-900 to-gray-500 
                  dark:from-white dark:to-gray-400`
              }>
                {fullName}
              </div>
              <div className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} font-mono italic`}>
                @{userName}
              </div>
              <div className={`mt-2 text-xs px-3 py-1 rounded-full bg-black/40 dark:bg-white/10 ${accentColorClass} font-semibold inline-block border border-gray-400/40 dark:border-slate-700/40`}>
                ACCESS LEVEL: {role}
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Body / Details Area --- */}
        <div className="mt-20 grid lg:grid-cols-3 gap-6">
          
          {/* About Card */}
          <div className={`lg:col-span-2 ${panelClass}`}>
            <h3 className={`text-xl font-bold mb-4 ${accentColorClass} border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog mr-2"><circle cx="18" cy="15" r="3"/><path d="M21.7 16.4V15h-2.5m-2.2 0h-2.5V16.4M12 20a6 6 0 0 0-6-6H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6"/><path d="M18.8 17.5l-1.6 1.6l1.6 1.6"/></svg>
              REGISTRY RECORD
            </h3>
            <div className="text-sm space-y-4 pt-2">
              <DetailItem label="Full Name" value={safeUser.FullName} />
              <DetailItem label="Contact Email" value={safeUser.Email} />
              <DetailItem label="Gender Code" value={safeUser.Gender} />
              <DetailItem label="NID / ID" value={safeUser.NID} />
              <DetailItem label="Phone Number" value={safeUser.Phone || 'Not provided'} />
              <DetailItem label="Account Role" value={safeUser.Role || 'voter'} />
              <DetailItem label="Member Since" value={safeUser.createdAt ? new Date(safeUser.createdAt).toLocaleDateString() : 'Unknown'} />
            </div>
          </div>

          {/* Change Password Card */}
          <div className={`${panelClass}`}>
            <h3 className={`text-xl font-bold mb-4 ${accentColorClass} border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock mr-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              CHANGE PASSWORD
            </h3>
            <div className="space-y-3 pt-2">
              <input 
                type={showPwd ? "text" : "password"} 
                placeholder="Current Password" 
                value={pwdOld}
                onChange={(e)=> setPwdOld(e.target.value)}
                disabled={busy}
                className={`w-full p-2 rounded-lg border border-gray-300 dark:border-slate-700 ${panelBgClass} ${COLOR_MAP.TEXT_MAIN} placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500`}
              />
              <input 
                type={showPwd ? "text" : "password"} 
                placeholder="New Password" 
                value={pwdNew}
                onChange={(e)=> setPwdNew(e.target.value)}
                disabled={busy}
                className={`w-full p-2 rounded-lg border border-gray-300 dark:border-slate-700 ${panelBgClass} ${COLOR_MAP.TEXT_MAIN} placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500`}
              />
              <input 
                type={showPwd ? "text" : "password"} 
                placeholder="Confirm New Password" 
                value={pwdNew2}
                onChange={(e)=> setPwdNew2(e.target.value)}
                disabled={busy}
                className={`w-full p-2 rounded-lg border border-gray-300 dark:border-slate-700 ${panelBgClass} ${COLOR_MAP.TEXT_MAIN} placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500`}
              />
              <label className="flex items-center gap-2 cursor-pointer select-none pt-2">
                <input 
                  type="checkbox" 
                  checked={showPwd}
                  onChange={(e)=> setShowPwd(e.target.checked)}
                  disabled={busy}
                  className="w-4 h-4 rounded"
                />
                <span className={`text-xs font-medium ${COLOR_MAP.TEXT_SECONDARY}`}>Show Passwords</span>
              </label>
              <button 
                onClick={onChangePassword}
                disabled={busy}
                className={`w-full ${accentButtonClass(true)} mt-3`}
              >
                {busy ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
