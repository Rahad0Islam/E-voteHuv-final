import React, { useState } from 'react'
import { registerInit, registerVerify } from '../lib/api'
import { useNavigate, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

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

export default function Register(){
  const [form, setForm] = useState({ FullName:'', UserName:'', Email:'', DateOfBirth:'', Gender:'male', Password:'', NID:'', PhoneNumber:'' })
  const [profile, setProfile] = useState(null)
  const [cover, setCover] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [otpPhase, setOtpPhase] = useState(false)
  const [otpToken, setOtpToken] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const navigate = useNavigate()

  // Custom component for message display
  const MessageBanner = ({ message, type }) => (
    <div className={`p-3 text-sm font-medium border rounded-lg transition-all duration-300 mb-4 animate-fadeIn ${
      type === 'error' ? 'bg-red-800/50 border-red-500 text-red-300' :
      type === 'success' ? 'bg-green-800/50 border-green-500 text-green-300' : ''
    }`}>
      <span className="font-bold mr-2">{type === 'error' ? 'Error:' : 'Success:'}</span> {message}
    </div>
  );

  const onSubmit = async (e)=>{
    e.preventDefault()
    if (isLoading) return;

    setError(null)
    setSuccess(null)

    if(!otpPhase){
      setIsLoading(true)
      const fd = new FormData()
      Object.entries(form).forEach(([k,v])=>fd.append(k,v))
      if(profile) fd.append('ProfileImage', profile)
      if(cover) fd.append('CoverImage', cover)
      try{
        const init = await registerInit(fd)
        if(init?.otpToken){
          setOtpToken(init.otpToken)
          setOtpPhase(true)
          setSuccess('Verification code sent to your email. Enter the 6-digit code to complete registration.')
        } else {
          setError('Failed to initiate registration.')
        }
      }catch(err){
        setError(err?.response?.data?.message || err?.message || 'Registration init failed.')
      } finally { setIsLoading(false) }
    } else {
      if(!otpCode.trim()) return setError('Enter the verification code')
      setIsLoading(true)
      try{
        await registerVerify({ otpToken, code: otpCode.trim() })
        setSuccess('Account created successfully! Redirecting to login...')
        setTimeout(()=> navigate('/login'), 2000)
      }catch(err){
        setError(err?.response?.data?.message || err?.message || 'Verification failed.')
      } finally { setIsLoading(false) }
    }
  }

  // High-tech input style with dark/light mode support
  const inputClass = "w-full p-3 rounded-lg border border-transparent transition-all duration-300 focus:outline-none focus:ring-1 focus:shadow-lg font-mono text-sm " +
                     "dark:bg-black/30 dark:text-white dark:placeholder-slate-500 dark:focus:border-sciAccent dark:focus:ring-sciAccent dark:focus:shadow-cyan-500/20 " +
                     "bg-gray-100 text-lightText placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:shadow-blue-500/20";
  
  // Primary button style with neon gradient and active press effect
  const buttonClass = `w-full py-3 font-bold rounded-lg transition duration-300 transform active:scale-[0.98] ${
    isLoading 
      ? 'bg-gray-600/50 text-gray-400 cursor-wait'
      : 'bg-gradient-to-r from-sciAccent to-sciAccent2 text-sciBg shadow-neon hover:shadow-2xl hover:shadow-cyan-400/40'
  }`;

  // File input styling
  const fileLabelClass = "block text-sm font-medium mb-1 dark:text-slate-300 text-lightText";
  const fileInputClass = "w-full text-sm dark:text-slate-400 text-lightText file:mr-4 file:py-2 file:px-4 " +
                         "file:rounded-full file:border-0 file:text-sm file:font-semibold " +
                         "file:bg-sciAccent/20 dark:file:bg-sciAccent/20 file:text-sciAccent dark:file:text-sciAccent hover:file:bg-sciAccent/30";


  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-3xl p-8 rounded-2xl border transition-all duration-500 
                        dark:bg-sciPanel dark:border-sciAccent/30 dark:shadow-2xl dark:shadow-cyan-900/60 
                        bg-lightPanel border-gray-300 shadow-lg">

          <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent 
                         dark:bg-gradient-to-r dark:from-white dark:to-sciAccent
                         bg-gradient-to-r from-lightText to-blue-800">
            SECURE REGISTRATION
          </h2>

          {error && <MessageBanner message={error} type="error" />}
          {success && <MessageBanner message={success} type="success" />}

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Fields */}
            <input className={inputClass} placeholder="Full Name (Official)" required onChange={e=>setForm({...form, FullName:e.target.value})} disabled={isLoading} />
            <input className={inputClass} placeholder="User ID (Unique Username)" required onChange={e=>setForm({...form, UserName:e.target.value})} disabled={isLoading} />
            <input className={inputClass} placeholder="Email Address" type="email" required onChange={e=>setForm({...form, Email:e.target.value})} disabled={isLoading} />
            <input className={inputClass} placeholder="Date of Birth" type="date" required onChange={e=>setForm({...form, DateOfBirth:e.target.value})} disabled={isLoading} />
            
            <select className={inputClass} value={form.Gender} required onChange={e=>setForm({...form, Gender:e.target.value})} disabled={isLoading}>
              <option value="male">Gender: Male</option>
              <option value="female">Gender: Female</option>
              <option value="other">Gender: Other</option>
            </select>
            <input className={inputClass} placeholder="Secure Password" type="password" required onChange={e=>setForm({...form, Password:e.target.value})} disabled={isLoading} />
            <input className={inputClass} placeholder="NID Number / Govt ID" required onChange={e=>setForm({...form, NID:e.target.value})} disabled={isLoading} />
            <input className={inputClass} placeholder="Phone Number" required onChange={e=>setForm({...form, PhoneNumber:e.target.value})} disabled={isLoading} />
            
            {/* Image Uploads */}
            <div>
              <label className={fileLabelClass}>Upload Profile Avatar</label>
              <input type="file" className={fileInputClass} onChange={e=>setProfile(e.target.files[0])} disabled={isLoading} accept="image/*"/>
            </div>
            <div>
              <label className={fileLabelClass}>Upload Cover Image (Optional)</label>
              <input type="file" className={fileInputClass} onChange={e=>setCover(e.target.files[0])} disabled={isLoading} accept="image/*"/>
            </div>

            {/* Submit Button + OTP Field */}
            <div className="md:col-span-2 mt-4 space-y-4">
              {otpPhase && (
                <input 
                  className={inputClass}
                  placeholder="Enter 6-digit verification code" 
                  value={otpCode}
                  onChange={e=> setOtpCode(e.target.value)}
                  maxLength={6}
                  disabled={isLoading}
                />
              )}
              <button 
                type="submit" 
                className={buttonClass}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-sciBg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{otpPhase ? 'VERIFYING...' : 'PROCESSING CREDENTIALS...'}</span>
                  </span>
                ) : (
                  otpPhase ? 'VERIFY & CREATE ACCOUNT' : 'CREATE ACCOUNT PROTOCOL'
                )}
              </button>

              <p className="text-center text-sm dark:text-slate-400 text-slate-600">
                Already have an account? <Link to="/login" className="dark:text-sciAccent dark:hover:text-sciAccent2 transition-colors duration-200 underline font-semibold text-blue-600 hover:text-blue-800">LOGIN</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
