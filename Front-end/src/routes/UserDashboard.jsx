import Swal from 'sweetalert2'
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { 
  listEvents, voterRegister, getNominees, giveVote, countVote, 
  getAvailableBallots, nomineeRegister, getVoteStatus, 
  getVoterRegStatus, getNomineeRegStatus, getPendingNominees, 
  api as apiClient, 
  logout,
  // campaign api helpers
  listCampaignPosts, createCampaignPost, reactCampaignPost, addCampaignComment, deleteCampaignPost, deleteCampaignComment,
  sendOnlineVoteCode,
  // NEW: edit post helper
  editCampaignPost
} from '../lib/api' 
import { getVoters } from '../lib/votersApi' 
import { io } from 'socket.io-client'
import { Link, useNavigate } from 'react-router-dom'

// --- Inline SVG Icons ---
const DashboardIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18.7 8.7L12 15.4 9.3 12.7 6 16"/></svg>);
const UpcomingIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const RunningIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const PreviousIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>);
const ProfileIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CalendarIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>);

// Social/Post Icons
const ThreeDotsIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>);
const ThumbUpIcon = ({ className = '', fill = "none" }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>);
const ThumbDownIcon = ({ className = '', fill = "none" }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>);
const CommentIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>);
const SendIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const EditIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>);
const TrashIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const PhotoIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>);
const VideoIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>);
const XIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'

// --- Color Palette Mapping ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue

// Backgrounds
const BG_BODY = 'bg-[#ECEBEB] dark:bg-[#1A2129]' 
const BG_SIDEBAR = 'bg-white dark:bg-[#111827]'
const BG_CARD = 'bg-white dark:bg-[#111827]'
const BG_DARK_CARD = 'bg-white dark:bg-[#111827]' 

// Text colors
const TEXT_PRIMARY = 'text-gray-900 dark:text-white'
const TEXT_SECONDARY = 'text-gray-600 dark:text-slate-400'
const ACCENT_PRIMARY_TEXT = `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`
const ACCENT_SUCCESS = 'text-[#10B981] dark:text-[#10B981]'
const ACCENT_WARNING = 'text-[#F59E0B] dark:text-[#F59E0B]'
const ACCENT_ERROR = 'text-[#DC2626] dark:text-[#DC2626]'
const ACCENT_VIOLET = 'text-violet-600 dark:text-violet-400'

// Button/Interactive elements
const BTN_PRIMARY = `bg-[${ACCENT_PRIMARY_HEX}] text-white hover:bg-[${ACCENT_SECONDARY_HEX}] transition duration-200 shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40`

// --- THEME-AWARE COLOR MAPPING FOR FOOTER ---
// Defined color variables for easy adjustment and theme consistency
const COLOR_MAP = {
  // New Backgrounds: #ECEBEB (Light) and #1A2129 (Dark)
  BG_COLOR: 'bg-[#ECEBEB] dark:bg-[#1A2129]',
  
  // Background for primary sections (Hero/Footer)
  SCI_BG: 'bg-[#ECEBEB] dark:bg-[#1A2129]',
  
  // Background for cards and panels
  SCI_PANEL: 'bg-white dark:bg-[#111827]',
  
  // Text colors for dark/light contrast
  TEXT_MAIN: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-gray-600 dark:text-slate-400',
  
  // Accent colors for buttons/highlights
  SCI_ACCENT: `bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`,
  SCI_ACCENT_TEXT: `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`,
};

// --- Inline SVG Icons for Footer ---
const MailIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"></path></svg>);

// --- Constants for Sidebar Navigation ---
const NAV_ITEMS = {
  DASHBOARD: 'Dashboard',
  UPCOMING: 'Upcoming Events',
  RUNNING: 'Running Events',
  PREVIOUS: 'Previous Events',
  PROFILE: 'Update Profile'
}

// Helper to format "Time Ago"
const timeAgo = (dateParam) => {
  if (!dateParam) return null;
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const today = new Date();
  const seconds = Math.round((today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(); 
};

// --- Footer Component ---
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
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Security Policy</a></li>
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Terms of Service</a></li>
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Privacy Statement</a></li>
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
        &copy; {new Date().getFullYear()} E-VoteHub. All rights reserved
      </p>
    </div>
  </footer>
);

// Edit Post Modal Component
const EditPostModal = ({ post, isOpen, onClose, onSave, isLoading }) => {
  const [editContent, setEditContent] = useState(post?.content || '')
  const [editPictures, setEditPictures] = useState([])
  const [editVideos, setEditVideos] = useState([])
  const [existingPictures, setExistingPictures] = useState(post?.picture || [])
  const [existingVideos, setExistingVideos] = useState(post?.video || [])

  useEffect(() => {
    if (post) {
      setEditContent(post.content || '')
      setExistingPictures(post.picture || [])
      setExistingVideos(post.video || [])
      setEditPictures([])
      setEditVideos([])
    }
  }, [post, isOpen])

  const handleRemoveExistingPicture = (publicId) => {
    setExistingPictures(prev => prev.filter(p => p.publicId !== publicId))
  }

  const handleRemoveExistingVideo = (publicId) => {
    setExistingVideos(prev => prev.filter(v => v.publicId !== publicId))
  }

  const handleRemoveNewPicture = (index) => {
    setEditPictures(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNewVideo = (index) => {
    setEditVideos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!editContent.trim() && existingPictures.length === 0 && existingVideos.length === 0 && editPictures.length === 0 && editVideos.length === 0) {
      Swal.fire({title: 'Invalid Post', text: 'Your post cannot be empty', icon: 'error', confirmButtonText: 'OK', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
      return
    }
    onSave({
      content: editContent.trim(),
      existingPictures,
      existingVideos,
      newPictures: editPictures,
      newVideos: editVideos
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#111827]">
          <h3 className={`text-2xl font-bold ${TEXT_PRIMARY}`}>Edit Post</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Text Content */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${TEXT_PRIMARY}`}>Post Content</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className={`w-full p-4 bg-gray-100 dark:bg-[#3A3B3C] rounded-lg min-h-[120px] ${TEXT_PRIMARY} placeholder-gray-500 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none`}
              disabled={isLoading}
            />
          </div>

          {/* Existing Media */}
          {(existingPictures.length > 0 || existingVideos.length > 0) && (
            <div>
              <label className={`block text-sm font-semibold mb-3 ${TEXT_PRIMARY}`}>Current Media</label>
              <div className="grid grid-cols-2 gap-3">
                {existingPictures.map((pic) => (
                  <div key={pic.publicId} className="relative group">
                    <img src={pic.url} alt="existing" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPicture(pic.publicId)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isLoading}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">Photo</span>
                  </div>
                ))}
                {existingVideos.map((vid) => (
                  <div key={vid.publicId} className="relative group">
                    <video src={vid.url} className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingVideo(vid.publicId)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isLoading}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">Video</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Media */}
          {(editPictures.length > 0 || editVideos.length > 0) && (
            <div>
              <label className={`block text-sm font-semibold mb-3 ${TEXT_PRIMARY}`}>New Media to Add</label>
              <div className="grid grid-cols-2 gap-3">
                {editPictures.map((pic, idx) => (
                  <div key={idx} className="relative group">
                    <img src={URL.createObjectURL(pic)} alt="new" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPicture(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isLoading}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">+Photo</span>
                  </div>
                ))}
                {editVideos.map((vid, idx) => (
                  <div key={idx} className="relative group">
                    <video src={URL.createObjectURL(vid)} className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewVideo(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isLoading}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">+Video</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Media Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className={`block text-sm font-semibold mb-3 ${TEXT_PRIMARY}`}>Add More Media</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4A4B4C] cursor-pointer transition text-gray-700 dark:text-gray-200 text-sm font-medium">
                <PhotoIcon className="w-5 h-5 text-green-500" />
                <span>Add Photos</span>
                <input type="file" multiple accept="image/*" onChange={(e) => setEditPictures([...editPictures, ...Array.from(e.target.files || [])])} className="hidden" disabled={isLoading} />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4A4B4C] cursor-pointer transition text-gray-700 dark:text-gray-200 text-sm font-medium">
                <VideoIcon className="w-5 h-5 text-red-500" />
                <span>Add Videos</span>
                <input type="file" multiple accept="video/*" onChange={(e) => setEditVideos([...editVideos, ...Array.from(e.target.files || [])])} className="hidden" disabled={isLoading} />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              isLoading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Helper Components ---
const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClass = isActive 
    ? `bg-[#1E3A8A] text-white dark:bg-[#3B82F6] dark:text-white shadow-xl shadow-[#1E3A8A]/40 dark:shadow-[#3B82F6]/40 font-bold`
    : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`;
  
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeClass}`}>
      <Icon className={`w-5 h-5 mr-3 ${!isActive && ACCENT_PRIMARY_TEXT}`} />
      <span className="text-sm">{label}</span>
    </button>
  );
};

const MetricBox = ({ title, value, accentClass = ACCENT_PRIMARY_TEXT, icon: Icon, iconBgClass, isDashboard = true }) => (
  <div className={`p-6 rounded-xl ${isDashboard ? BG_CARD : BG_DARK_CARD} shadow-md transition duration-300 border border-gray-200 dark:border-gray-700`}>
    {isDashboard && (
        <div className="flex items-center justify-between mb-3">
          <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium`}>{title}</div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass}`}>
            <Icon className={`w-5 h-5 text-white`} />
          </span>
        </div>
    )}
    {!isDashboard && (
        <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium mb-1`}>{title}</div>
    )}
    <div className={`text-4xl font-extrabold ${accentClass}`}>{value}</div>
  </div>
);

const EventListItem = ({ event, onClick }) => {
  let statusClass = ACCENT_PRIMARY_TEXT; 
  let statusDetail = 'Registration Open';
  let statusSymbol = '✍️'; 

  const now = new Date().getTime();
  const start = new Date(event.VoteStartTime).getTime();
  const end = new Date(event.VoteEndTime).getTime();
  const regEnd = new Date(event.RegEndTime).getTime();

  if (end <= now) {
    event.status = 'finished';
  } else if (start <= now) {
    event.status = 'voting';
  } else if (regEnd <= now) {
    event.status = 'waiting';
  } else {
    event.status = 'registration';
  }

  if (event.status === 'voting') {
    statusClass = ACCENT_VIOLET;
    statusDetail = 'Voting Live';
    statusSymbol = '🗳️';
  } else if (event.status === 'finished') {
    statusClass = ACCENT_SUCCESS;
    statusDetail = 'Results Available';
    statusSymbol = '🏆';
  } else if (event.status === 'waiting' || event.status === 'registration') {
    statusClass = ACCENT_WARNING;
    statusDetail = event.status === 'waiting' ? 'Waiting to Vote' : 'Registration Open';
    statusSymbol = event.status === 'waiting' ? '⏳' : '✍️';
  }

  const countdown = (iso) => {
    const d = new Date(iso); const t = d.getTime() - Date.now();
    if(isNaN(d.getTime()) || t <= 0) return '00:00:00';
    const h = String(Math.floor(t/3600000)).padStart(2,'0');
    const m = String(Math.floor((t%3600000)/60000)).padStart(2,'0');
    const s = String(Math.floor((t%60000)/1000)).padStart(2,'0');
    return `${h}:${m}:${s}`;
  }
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition duration-200 ${BG_CARD} shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className={`font-bold text-lg ${TEXT_PRIMARY}`}>{event.Title}</div>
          <div className={`text-xs font-mono mt-1 px-2 py-0.5 rounded-full ${statusClass} border border-current inline-block`}>
            <span className="mr-1">{statusSymbol}</span>
            <span className="font-semibold">{statusDetail.toUpperCase()}</span>
          </div>
        </div>
        <div className={`text-sm ${TEXT_SECONDARY}`}>Type: {event.ElectionType}</div>
      </div>
      <div className={`text-xs ${TEXT_SECONDARY} mt-3`}>
        {event.status === 'registration' && `Reg ends: ${new Date(event.RegEndTime).toLocaleDateString()}`}
        {event.status === 'voting' && `Voting ends: ${new Date(event.VoteEndTime).toLocaleDateString()} • ${countdown(event.VoteEndTime)}`}
        {event.status === 'waiting' && `Starts: ${new Date(event.VoteStartTime).toLocaleDateString()} • ${countdown(event.VoteStartTime)}`}
        {event.status === 'finished' && `Finished: ${new Date(event.VoteEndTime).toLocaleDateString()}`}
      </div>
    </button>
  );
};


export default function UserDashboard(){
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeView, setActiveView] = useState(NAV_ITEMS.DASHBOARD)
  const [nominees, setNominees] = useState([])
  const [voteSelection, setVoteSelection] = useState({})
  const [rankOrder, setRankOrder] = useState([]) 
  const [ballots, setBallots] = useState([])
  const [selectedBallot, setSelectedBallot] = useState(null)
  const [desc, setDesc] = useState('')
  const [results, setResults] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoterRegistered, setIsVoterRegistered] = useState(false)
  const [isNomineeRegistered, setIsNomineeRegistered] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [voteCode, setVoteCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  
  // Event Metrics state
  const [voterCount, setVoterCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [participationRate, setParticipationRate] = useState('0.0%')
  const [phaseRefreshed, setPhaseRefreshed] = useState({ reg:false, start:false, end:false })

  // Campaign feature states
  const [campaignPosts, setCampaignPosts] = useState([])
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [campaignError, setCampaignError] = useState(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostPictures, setNewPostPictures] = useState([])
  const [newPostVideos, setNewPostVideos] = useState([])
  const [postingLoading, setPostingLoading] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const [eventRenderNonce, setEventRenderNonce] = useState(0)
  
  // NEW: State for tracking open menu in posts & expanded comments
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)
  const [expandedComments, setExpandedComments] = useState({})

  // NEW: State for edit modal
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingPost, setEditingPost] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  // Focus ref for reply functionality
  const commentInputRefs = useRef({})

  const user = useMemo(() => { 
    try{ return JSON.parse(localStorage.getItem('user')||'null') } catch{ return null } 
  }, [])
  const navigate = useNavigate()

  useEffect(()=>{ listEvents().then(setEvents).catch(()=>{}) },[])

  // --- Event Categorization ---
  const categorizedEvents = useMemo(() => {
    const categories = { upcoming: [], running: [], previous: [] };
    const nowMs = now.getTime();

    events.forEach(event => {
      const voteStartMs = new Date(event.VoteStartTime).getTime();
      const voteEndMs = new Date(event.VoteEndTime).getTime();
      
      if (nowMs >= voteStartMs && nowMs < voteEndMs) {
          categories.running.push(event);
      } else if (nowMs < voteStartMs) {
          categories.upcoming.push(event);
      } else if (nowMs >= voteEndMs) {
          categories.previous.push(event);
      }
    });
    return categories;
  }, [events, now]);
  
  const currentEventsList = useMemo(() => {
    switch (activeView) {
      case NAV_ITEMS.UPCOMING: return categorizedEvents.upcoming;
      case NAV_ITEMS.RUNNING: return categorizedEvents.running;
      case NAV_ITEMS.PREVIOUS: return categorizedEvents.previous;
      default: return [];
    }
  }, [activeView, categorizedEvents]);

  const nomineeLookup = useMemo(() => {
    const m = {};
    nominees.forEach(n => {
      const id = n?.UserID?._id || n?.UserID;
      if(!id) return;
      m[id] = {
        displayName: n?.UserID?.FullName || id,
        ballotUrl: n?.SelectedBalot?.url || null,
        profileImage: n?.UserID?.ProfileImage || null,
      };
    });
    return m;
  }, [nominees]);

  // --- Active Event Details Fetching ---
  useEffect(()=>{
    if(!activeEvent) return
    
    setVoteSelection({})
    setRankOrder([])
    setResults(null)
    setSelectedBallot(null)
    setDesc('')
    setVoterCount(0)
    setApprovedCount(0)
    setPendingCount(0)
    setParticipationRate('0.0%')
    setExpandedComments({}) // Reset expanded comments on event switch


    let status = 'registration';
    const nowMs = Date.now();
    if (new Date(activeEvent.VoteEndTime).getTime() <= nowMs) {
        status = 'finished';
    } else if (new Date(activeEvent.VoteStartTime).getTime() <= nowMs) {
        status = 'voting';
    } else if (new Date(activeEvent.RegEndTime).getTime() <= nowMs) {
        status = 'waiting';
    }
    
    if(status === 'registration'){
      getAvailableBallots(activeEvent._id).then(setBallots)
      getVoterRegStatus(activeEvent._id).then(s=> setIsVoterRegistered(!!s.registered))
      getNomineeRegStatus(activeEvent._id).then(s=> setIsNomineeRegistered(!!s.registered))
    } else {
      setIsVoterRegistered(false)
      setIsNomineeRegistered(false)
    }
    
    if(status === 'finished'){
      countVote(activeEvent._id).then(setResults)
    }

    if(status === 'voting'){
      getVoteStatus(activeEvent._id).then(s=> setHasVoted(s.voted)).catch(()=>setHasVoted(false))
    } else { setHasVoted(false) }

    const fetchMetrics = async () => {
      try{
        const approved = await getNominees(activeEvent._id)
        setNominees(approved)
        setApprovedCount(approved.length)
      }catch(e){console.error("Failed to fetch approved nominees:", e)}
      try{
        const pending = await getPendingNominees(activeEvent._id) 
        setPendingCount(pending.length)
      }catch(e){console.error("Failed to fetch pending nominees:", e)}
      try{
        const votersRes = await getVoters(activeEvent._id) 
        setVoterCount(votersRes.length)
      }catch(e){console.error("Failed to fetch registered voters:", e)}
      try{
        const part = await apiClient.get('/api/V1/admin/getVoterPerticipate', { params: { EventID: activeEvent._id } })
        const d = part.data?.data
        if(d) setParticipationRate(`${d.VoterPerticapteRate || '0.0'}%`)
      }catch(e){
        setParticipationRate('0.0%')
      }
    }
    fetchMetrics()
    
    let s;
    if(status === 'voting'){
      s = io(API_BASE, { withCredentials: true })
      s.emit('joinEvent', activeEvent._id)
      s.on('countUpdate', (payload)=>{
        if(payload.eventId === activeEvent._id){
          countVote(activeEvent._id).then(setResults)
        }
      })
    }
    return ()=>{ 
      if(s){ s.emit('leaveEvent', activeEvent._id); s.disconnect() }
    }
  },[activeEvent]) 

  // --- Time and Auto-Refresh Logic ---
  useEffect(()=>{
    const id = setInterval(()=> setNow(new Date()), 1000)
    return ()=> clearInterval(id)
  },[])
  
  useEffect(()=>{
    if(!activeEvent) return
    const nowMs = now.getTime()
    const toMs = (v)=>{ const d=new Date(v); return isNaN(d.getTime())? null : d.getTime() }
    const regMs = toMs(activeEvent.RegEndTime)
    const startMs = toMs(activeEvent.VoteStartTime)
    const endMs = toMs(activeEvent.VoteEndTime)

    const shouldReg = !!regMs && !phaseRefreshed.reg && nowMs >= regMs
    const shouldStart = !!startMs && !phaseRefreshed.start && nowMs >= startMs
    const shouldEnd = !!endMs && !phaseRefreshed.end && nowMs >= endMs

    if(shouldReg || shouldStart || shouldEnd){
      const refresh = () => listEvents().then(evts=>{
        setEvents(evts||[])
        const updated = (evts||[]).find(e=> e._id === activeEvent._id)
        if(updated) setActiveEvent(updated)
      }).catch(()=>{})
      refresh() 

      setPhaseRefreshed(p=>({ reg: p.reg || shouldReg, start: p.start || shouldStart, end: p.end || shouldEnd }))
    }
  }, [now, activeEvent]) 
  
  useEffect(()=>{
    setPhaseRefreshed({ reg:false, start:false, end:false })
  }, [activeEvent?._id])

  const timeLeft = (iso)=>{
    const d = new Date(iso)
    if (!(d instanceof Date) || isNaN(d.getTime())) return '00:00:00'
    const t = d.getTime() - now.getTime()
    if (t <= 0) return '00:00:00'
    const h = String(Math.floor(t/3600000)).padStart(2,'0')
    const m = String(Math.floor((t%3600000)/60000)).padStart(2,'0')
    const s = String(Math.floor((t%60000)/1000)).padStart(2,'0')
    return `${h}:${m}:${s}`
  }

  // --- Handlers ---
  const onRegisterVoter = useCallback(async (e)=>{
    if(e) { e.preventDefault(); e.stopPropagation() }
    if(!activeEvent) return
    try{ 
      await voterRegister(activeEvent._id); 
      setIsVoterRegistered(true); 
      Swal.fire({title: 'Registration Successful!', text: 'You have been registered as a voter', icon: 'success', confirmButtonText: 'Great!', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--text-primary)'}) 
    }catch(err){ 
      Swal.fire({title: 'Registration Failed', text: err?.response?.data?.message || 'Failed to register as voter', icon: 'error', confirmButtonText: 'Try Again', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'}) 
    }
  }, [activeEvent])

  const onNominate = useCallback(async (e)=>{
    if(e) { e.preventDefault(); e.stopPropagation() }
    if(!activeEvent) return
    if(!selectedBallot){ Swal.fire({title: 'Missing Ballot', text: 'Please select a ballot image to continue', icon: 'warning', confirmButtonText: 'OK', background: 'rgba(239, 193, 68, 0.15)', color: 'var(--text-primary)'}); return }
    try{
      await nomineeRegister({ EventID: activeEvent._id, SelectedBalot:{ url: selectedBallot.url, publicId: selectedBallot.publicId }, Description: desc })
      setIsNomineeRegistered(true)
      Swal.fire({title: 'Submitted Successfully!', text: 'Your nominee registration has been submitted and is awaiting admin approval', icon: 'success', confirmButtonText: 'Perfect!', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--text-primary)'})
    }catch(err){
      Swal.fire({title: 'Registration Failed', text: err?.response?.data?.message || 'Failed to register as nominee', icon: 'error', confirmButtonText: 'Try Again', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
    }
  }, [activeEvent, selectedBallot, desc])

  const onVote = useCallback(async (e)=>{
    if(e) { e.preventDefault(); e.stopPropagation() }
    if(!activeEvent || hasVoted || isSubmittingVote) return
    const requiresCode = activeEvent?.votingMode === 'online' || activeEvent?.votingMode === 'onCampus'
    if(requiresCode){
      const normalized = String(voteCode||'').trim()
      if(normalized.length !== 6 || !/^[0-9]{6}$/.test(normalized)){
        Swal.fire({title: 'Invalid Code', text: 'Please enter a valid 6-digit code to submit your vote', icon: 'error', confirmButtonText: 'OK', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
        return
      }
    }
    try{
      setIsSubmittingVote(true)
      const ElectionType = activeEvent.ElectionType
      let SelectedNominee = []
      if(ElectionType === 'Single'){
        const id = Object.keys(voteSelection)[0]
        if(id) SelectedNominee = [{ NomineeId: id }]
      }else if(ElectionType === 'MultiVote'){
        SelectedNominee = Object.keys(voteSelection).filter(k=>voteSelection[k]).map(id=>({ NomineeId:id }))
      }else{ 
        SelectedNominee = rankOrder.map((id, idx)=>({ NomineeId:id, Rank: idx+1 }))
      }
      await giveVote({ EventID: activeEvent._id, ElectionType, SelectedNominee, code: voteCode })
      setHasVoted(true)
      Swal.fire({title: 'Vote Submitted!', text: 'Your vote has been successfully submitted and recorded', icon: 'success', confirmButtonText: 'Thank You!', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--text-primary)'})
    }catch(err){
      Swal.fire({title: 'Vote Failed', text: err?.response?.data?.message || 'Failed to submit your vote', icon: 'error', confirmButtonText: 'Try Again', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
    } finally {
      setIsSubmittingVote(false)
    }
  }, [activeEvent, voteSelection, rankOrder, hasVoted, isSubmittingVote, voteCode])

  const handleBallotSelection = useCallback((ballot, e) => {
    if(e) { e.preventDefault(); e.stopPropagation() }
    if(isNomineeRegistered) return
    setSelectedBallot(ballot)
  }, [isNomineeRegistered])

  const handleVoteChange = useCallback((nomineeId, electionType, e) => {
    if(e) { e.stopPropagation() }
    if(hasVoted) return
    
    if(electionType === 'Rank'){
      if(e.target.checked){ 
        setRankOrder(prevOrder => prevOrder.includes(nomineeId) ? prevOrder : [...prevOrder, nomineeId])
      } else { 
        setRankOrder(prevOrder => prevOrder.filter(x => x !== nomineeId))
      }
    } else if(electionType === 'Single'){
      setVoteSelection({ [nomineeId]: true })
    } else {
      setVoteSelection(prevSelection => ({ ...prevSelection, [nomineeId]: e.target.checked }))
    }
  }, [hasVoted])

  const handleDescriptionChange = useCallback((e) => {
    if(isNomineeRegistered) return
    setDesc(e.target.value)
  }, [isNomineeRegistered])

  const handleNavigation = useCallback((view, e) => {
    if(e) { e.preventDefault(); e.stopPropagation() }
    setActiveView(view)
    setActiveEvent(null)
  }, [])

  const handleEventSelection = useCallback((event, e) => {
    if(e) { e.preventDefault(); e.stopPropagation() }
    setActiveEvent(event)
  }, [])

  const onLogout = useCallback(async (e)=>{
    if(e) { e.preventDefault(); e.stopPropagation() }
    try { await logout(); navigate('/login') } 
    catch(err) { navigate('/login') }
  }, [navigate])

  const selectionInvalid = activeEvent?.ElectionType === 'Rank' 
    ? rankOrder.length === 0 
    : Object.keys(voteSelection).length === 0
  const requiresCode = activeEvent?.votingMode === 'online' || activeEvent?.votingMode === 'onCampus'
  const codeInvalid = requiresCode ? !(String(voteCode||'').trim().length === 6 && /^[0-9]{6}$/.test(String(voteCode||'').trim())) : false
  const isVoteDisabled = selectionInvalid || codeInvalid

  // --- Campaign Posts Logic ---
  
  // Use event ID as dependency to avoid object reference loop
  useEffect(()=>{
    let cancelled = false
    if(!activeEvent){
      setCampaignPosts([])
      setCampaignError(null)
      return
    }
    setCampaignLoading(true)
    setCampaignError(null)
    listCampaignPosts(activeEvent._id)
      .then(data=>{ if(!cancelled){ setCampaignPosts(Array.isArray(data)? data : (data?.posts||[])) }})
      .catch(err=>{ if(!cancelled){ console.error('Campaign posts load failed:', err); setCampaignError(err?.response?.data?.message || 'Failed to load posts') }})
      .finally(()=>{ if(!cancelled){ setCampaignLoading(false); setEventRenderNonce(n=>n+1) }})
    return ()=>{ cancelled = true }
  }, [activeEvent?._id]) // Changed dependency to ID only

  const onPicturesChange = useCallback((e)=>{
    const files = Array.from(e.target.files||[])
    setNewPostPictures(files)
  },[])
  const onVideosChange = useCallback((e)=>{
    const files = Array.from(e.target.files||[])
    setNewPostVideos(files)
  },[])

  const handleCreateCampaignPost = useCallback(async (e)=>{
    if(e){ e.preventDefault(); e.stopPropagation() }
    if(!activeEvent) return
    if(!newPostContent.trim() && newPostPictures.length===0 && newPostVideos.length===0){
      setCampaignError('Post cannot be empty')
      return
    }
    try{
      setPostingLoading(true)
      setCampaignError(null)
      await createCampaignPost({ 
        eventID: activeEvent._id, 
        content: newPostContent.trim(), 
        pictures: newPostPictures, 
        videos: newPostVideos 
      })
      setNewPostContent('')
      setNewPostPictures([])
      setNewPostVideos([])
      const refreshed = await listCampaignPosts(activeEvent._id)
      setCampaignPosts(Array.isArray(refreshed)? refreshed : (refreshed?.posts||[]))
    }catch(err){
      setCampaignError(err?.response?.data?.message || 'Failed to create post')
    }finally{
      setPostingLoading(false)
    }
  }, [activeEvent, newPostContent, newPostPictures, newPostVideos])

  const handleReact = useCallback(async (postId, action)=>{
    if(!activeEvent) return
    try{
      await reactCampaignPost({ eventID: activeEvent._id, postID: postId, type: action })
      const refreshed = await listCampaignPosts(activeEvent._id)
      setCampaignPosts(Array.isArray(refreshed)? refreshed : (refreshed?.posts||[]))
    }catch(err){ console.error('Reaction failed:', err) }
  }, [activeEvent])

  const handleAddComment = useCallback(async (postId)=>{
    if(!activeEvent) return
    const text = (commentInputs[postId]||'').trim()
    if(!text) return
    try{
      await addCampaignComment({ eventID: activeEvent._id, postID: postId, comment: text })
      setCommentInputs(c=> ({ ...c, [postId]: '' }))
      setExpandedComments(prev => ({ ...prev, [postId]: true })) // Open comments after commenting
      const refreshed = await listCampaignPosts(activeEvent._id)
      setCampaignPosts(Array.isArray(refreshed)? refreshed : (refreshed?.posts||[]))
    }catch(err){ console.error('Add comment failed:', err) }
  }, [activeEvent, commentInputs])

  // NEW: Toggle Menu Handler
  const toggleMenu = useCallback((postId) => {
    setActiveMenuPostId(prev => prev === postId ? null : postId);
  }, []);

  // NEW: Edit Handler
  const handleEditPost = useCallback((postId) => {
    const post = campaignPosts.find(p => p._id === postId)
    if (post) {
      setEditingPost(post)
      setEditingPostId(postId)
      setActiveMenuPostId(null)
    }
  }, [campaignPosts]);

  // NEW: Save Edit Handler
  const handleSaveEditPost = useCallback(async (editData) => {
    if (!activeEvent || !editingPostId) return
    try {
      setEditLoading(true)
      const formData = new FormData()
      formData.append('eventID', activeEvent._id)
      formData.append('postID', editingPostId)
      if (typeof editData.content === 'string') formData.append('content', editData.content)
      // compute media to remove by publicId
      const removePicIds = (editingPost.picture||[]).filter(p => !(editData.existingPictures||[]).find(ep => ep.publicId === p.publicId)).map(p => p.publicId)
      const removeVidIds = (editingPost.video||[]).filter(v => !(editData.existingVideos||[]).find(ev => ev.publicId === v.publicId)).map(v => v.publicId)
      // backend expects removeMediaIds repeated keys
      ;[...removePicIds, ...removeVidIds].forEach(id => formData.append('removeMediaIds', id))
      // new uploads must use keys 'picture' and 'video'
      ;(editData.newPictures||[]).forEach(pic => formData.append('picture', pic))
      ;(editData.newVideos||[]).forEach(vid => formData.append('video', vid))

      // Use API helper that posts FormData to /api/v1/post/editPost
      await editCampaignPost({ eventID: activeEvent._id, postID: editingPostId, content: editData.content, pictures: editData.newPictures||[], videos: editData.newVideos||[], removeMediaIds: [...removePicIds, ...removeVidIds] })
      const refreshed = await listCampaignPosts(activeEvent._id)
      setCampaignPosts(Array.isArray(refreshed)? refreshed : (refreshed?.posts||[]))
      setEditingPostId(null)
      setEditingPost(null)
      Swal.fire({title: 'Success!', text: 'Your post has been updated successfully', icon: 'success', confirmButtonText: 'Done', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--text-primary)'})
    } catch (err) {
      setCampaignError(err?.response?.data?.message || 'Failed to update post')
      Swal.fire({title: 'Update Failed', text: err?.response?.data?.message || 'Failed to update your post', icon: 'error', confirmButtonText: 'Retry', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
    } finally {
      setEditLoading(false)
    }
  }, [activeEvent, editingPostId, editingPost])

  const handleDeletePost = useCallback(async (postId)=>{
    if(!activeEvent) return
    const result = await Swal.fire({title: 'Delete Post?', text: 'This action cannot be undone. Your post will be permanently deleted.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel', confirmButtonColor: '#DC2626', cancelButtonColor: '#6B7280', background: 'rgba(239, 193, 68, 0.15)', color: 'var(--text-primary)'}); if (!result.isConfirmed) return
    try{
      await deleteCampaignPost({ eventID: activeEvent._id, postID: postId })
      setCampaignPosts(p=> p.filter(x=> x._id!==postId))
    }catch(err){
      setCampaignError(err?.response?.data?.message || 'Failed to delete post')
    }
    setActiveMenuPostId(null);
  }, [activeEvent])

  const handleDeleteComment = useCallback(async (postId, commentId)=>{
    if(!activeEvent) return
    try{
      await deleteCampaignComment({ eventID: activeEvent._id, commentID: commentId })
      setCampaignPosts(p=> p.map(post=> post._id===postId ? { ...post, comments: (post.comments||[]).filter(c=> c._id!==commentId) } : post))
    }catch(err){ console.error('Delete comment failed:', err) }
  }, [activeEvent])

  // NEW: Toggle Comments Visibility
  const toggleComments = useCallback((postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  // NEW: Reply to Comment (Fills input)
  const handleReplyComment = useCallback((postId, authorName) => {
    setCommentInputs(prev => ({ ...prev, [postId]: `@${authorName} ` }));
    if(commentInputRefs.current[postId]) {
      commentInputRefs.current[postId].focus();
    }
    setExpandedComments(prev => ({ ...prev, [postId]: true })); // Ensure expanded
  }, []);

  // NEW: React to Comment (Optimistic UI only as API is missing)
  const handleReactComment = useCallback((postId, commentId) => {
    setCampaignPosts(prevPosts => prevPosts.map(post => {
        if(post._id !== postId) return post;
        return {
            ...post,
            comments: post.comments.map(c => {
                if(c._id !== commentId) return c;
                // Optimistic toggle of like
                const hasLiked = c.likedByMe; // Assumed local state for now
                return { 
                    ...c, 
                    likedByMe: !hasLiked,
                    likesCount: (c.likesCount || 0) + (hasLiked ? -1 : 1)
                };
            })
        };
    }));
  }, []);


  const requestVoteCode = useCallback(async () => {
    try{
      if (!activeEvent) return
      if (activeEvent?.votingMode !== 'online') return
      setSendingCode(true)
      await sendOnlineVoteCode(activeEvent._id)
      Swal.fire({title: 'Code Sent!', text: 'A verification code has been sent to your email address', icon: 'success', confirmButtonText: 'OK', background: 'rgba(134, 239, 172, 0.15)', color: 'var(--text-primary)'})
    }catch(err){
      Swal.fire({title: 'Failed to Send', text: err?.response?.data?.message || 'Failed to send verification code', icon: 'error', confirmButtonText: 'Try Again', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)'})
    }finally{
      setSendingCode(false)
    }
  }, [activeEvent, setSendingCode])


  // --- Rendering Functions ---

  const renderDashboardView = () => (
    <>
      <h2 className={`text-5xl font-extrabold ${TEXT_PRIMARY} mb-10 flex items-center`}>
        <span className={`mr-4 text-6xl ${ACCENT_PRIMARY_TEXT}`}>🗳️</span>
        E-Voting Dashboard
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricBox 
          title="Running Events" 
          value={categorizedEvents.running.length} 
          icon={RunningIcon} 
          iconBgClass="bg-violet-600 dark:bg-violet-400"
          accentClass={ACCENT_VIOLET}
        />
        <MetricBox 
          title="Upcoming Events" 
          value={categorizedEvents.upcoming.length} 
          icon={UpcomingIcon} 
          iconBgClass={`bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`}
          accentClass={ACCENT_PRIMARY_TEXT}
        />
        <MetricBox 
          title="Past Events" 
          value={categorizedEvents.previous.length} 
          icon={PreviousIcon} 
          iconBgClass="bg-red-600 dark:bg-red-400"
          accentClass={ACCENT_ERROR}
        />
      </div>

      <h3 className={`text-2xl font-bold ${TEXT_PRIMARY} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
        Quick Access
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_VIOLET} mb-3`}>
            <CalendarIcon className="w-6 h-6 mr-2" />
            Join Running Event
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Quickly navigate to any event that is currently in its voting or registration phase.
          </p>
          <button 
            onClick={(e) => handleNavigation(NAV_ITEMS.RUNNING, e)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
          >
            Browse Running Events ({categorizedEvents.running.length})
          </button>
        </div>

        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>
            <ProfileIcon className="w-6 h-6 mr-2" />
            Manage Your Profile
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Update your account details, profile picture, or change your password.
          </p>
          <button 
            onClick={(e) => handleNavigation(NAV_ITEMS.PROFILE, e)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
          >
            Go to Profile Settings
          </button>
        </div>
      </div>
    </>
  );

  const renderEventListView = (title) => (
    <>
      <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
        {title} ({currentEventsList.length})
      </h2>
      <div className="space-y-4">
        {currentEventsList.length === 0 ? (
          <div className={`text-center p-8 rounded-xl ${BG_CARD} ${TEXT_SECONDARY} border border-gray-200 dark:border-gray-700 shadow-lg`}>
            No {title.toLowerCase()} found at this time.
          </div>
        ) : (
          currentEventsList.map(ev => (
            <EventListItem
              key={ev._id}
              event={ev}
              onClick={(e) => handleEventSelection(ev, e)} 
            />
          ))
        )}
      </div>
    </>
  );

  const renderProfileView = () => (
    <>
      <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
        Profile Settings
      </h2>
      <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col items-center text-center gap-6 mb-8">
          <img 
            src={user?.ProfileImage || 'https://placehold.co/120x120/f3f4f6/111827?text=User'}
            className={`w-32 h-32 rounded-full object-cover ring-4 ring-current ${ACCENT_PRIMARY_TEXT} shadow-xl`} 
            alt="Profile"
          />
          <div>
            <div className={`text-2xl font-bold ${TEXT_PRIMARY}`}>{user?.FullName || 'User Name'}</div>
            <div className={`text-base font-mono ${TEXT_SECONDARY}`}>{user?.Email || 'user@example.com'}</div>
          </div>
        </div>
        <p className={`${TEXT_SECONDARY} text-center mb-6`}>
            Use the dedicated **Update Profile** section to change your images, name, or password.
        </p>
        <Link 
          to="/profile" 
          className={`block w-full text-center px-6 py-3 rounded-lg font-bold text-base ${BTN_PRIMARY}`}
        >
          Go to Profile Editor
        </Link>
      </div>
    </>
  );

  const renderActiveContent = () => {
    if (activeEvent) {
      let currentStatus = 'registration';
      const nowMs = now.getTime();
      if (new Date(activeEvent.VoteEndTime).getTime() <= nowMs) {
          currentStatus = 'finished';
      } else if (new Date(activeEvent.VoteStartTime).getTime() <= nowMs) {
          currentStatus = 'voting';
      } else if (new Date(activeEvent.RegEndTime).getTime() <= nowMs) {
          currentStatus = 'waiting';
      }

      return (
        <div key={eventRenderNonce} className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}> 
          {/* Event Header and Status */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <h3 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-2`}>{activeEvent.Title}</h3>
            <div className="flex justify-between items-end">
              <div className={`${TEXT_SECONDARY} text-sm`}>
                Type: <span className={`font-semibold ${ACCENT_VIOLET}`}>{activeEvent.ElectionType}</span>
              </div>
              <div className={`${TEXT_SECONDARY} text-sm`}>
                  Status: <span className={`font-bold text-lg ${currentStatus === 'finished' ? ACCENT_SUCCESS : ACCENT_WARNING}`}>{currentStatus.toUpperCase()}</span>
              </div>
            </div>
            {currentStatus === 'voting' && (
              <div className={`mt-2 text-xs font-mono ${ACCENT_VIOLET}`}>
                Voting ends in: <span className="font-bold">{timeLeft(activeEvent.VoteEndTime)}</span>
              </div>
            )}
            {currentStatus === 'waiting' && (
              <div className={`mt-2 text-xs font-mono ${ACCENT_WARNING}`}>
                Voting starts in: <span className="font-bold">{timeLeft(activeEvent.VoteStartTime)}</span>
              </div>
            )}
            {currentStatus === 'registration' && (
              <div className={`mt-2 text-xs font-mono ${ACCENT_WARNING}`}>
                Registration ends in: <span className="font-bold">{timeLeft(activeEvent.RegEndTime)}</span>
              </div>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricBox title="REGISTERED VOTERS" value={voterCount} accentClass="text-[#3B82F6] dark:text-[#60A5FA]" isDashboard={false}/>
              <MetricBox title="APPROVED NOMINEES" value={approvedCount} accentClass={ACCENT_SUCCESS} isDashboard={false}/>
              <MetricBox title="PENDING NOMINEES" value={pendingCount} accentClass={ACCENT_WARNING} isDashboard={false}/>
              <MetricBox title="PARTICIPATION RATE" value={participationRate} accentClass={ACCENT_VIOLET} isDashboard={false}/>
          </div>

          {/* ELECTION RESULTS & TALLY (Moved here as requested) */}
          {currentStatus === 'finished' && (
            <div className={`mb-10 p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}>
              <h4 className={`font-bold text-xl ${ACCENT_SUCCESS} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center`}>
                <span className="mr-2">🥇</span>
                ELECTION RESULTS & TALLY
              </h4>
              {results ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {results.NomineeListForSingleAndMultiVote && results.NomineeListForSingleAndMultiVote.length > 0 && (
                    <div>
                      <div className={`text-sm ${TEXT_SECONDARY} mb-3 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 pb-1`}>Total Votes Count</div>
                      <ul className="space-y-3">
                        {results.NomineeListForSingleAndMultiVote?.sort((a,b)=>b.TotalVote-a.TotalVote).map((r, index) => {
                          const id = r.NomineeID;
                          const meta = nomineeLookup[id] || {};
                          const displayName = r.NomineeIDName || meta.displayName || id;
                          const imgSrc = meta.ballotUrl || meta.profileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=AD';
                          return (
                            <li key={id} className={`flex justify-between items-center bg-white dark:bg-gray-800/50 p-3 rounded-lg border-l-4 border-current ${ACCENT_SUCCESS}`}>
                              <div className="flex items-center gap-3">
                                <img src={imgSrc} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600" />
                                <Link to={`/u/${id}`} className={`font-semibold ${TEXT_PRIMARY} flex items-center hover:underline`} title="View profile">{index===0 ? '🏆 ' : ''}{displayName}</Link>
                              </div>
                              <span className={`text-xl font-bold ${ACCENT_SUCCESS}`}>{r.TotalVote} Votes</span>
                            </li>
                          );
                        })}
                      </ul>
                                       </div>
                  )}
                  
                  {results.NomineeListForRank && results.NomineeListForRank.length > 0 && (
                    <div>
                      <div className={`text-sm ${TEXT_SECONDARY} mb-3 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 pb-1`}>Ranked Choice Score (Lower is Better)</div>
                      <ul className="space-y-3">
                        {results.NomineeListForRank?.sort((a,b)=>a.TotalRank-b.TotalRank).map((r, index) => {
                          const id = r.NomineeID;
                          const meta = nomineeLookup[id] || {};
                          const displayName = r.NomineeIDName || meta.displayName || id;
                          const imgSrc = meta.ballotUrl || meta.profileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=AD';
                          return (
                            <li key={id} className={`flex justify-between items-center bg-white dark:bg-gray-800/50 p-3 rounded-lg border-l-4 border-current ${ACCENT_VIOLET}`}>
                              <div className="flex items-center gap-3">
                                <img src={imgSrc} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600" />
                                <Link to={`/u/${id}`} className={`font-semibold ${TEXT_PRIMARY} flex items-center hover:underline`} title="View profile">{index===0 ? '👑 ' : ''}{displayName}</Link>
                              </div>
                              <span className={`text-xl font-bold ${ACCENT_VIOLET}`}>{r.TotalRank} Score</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {(!results.NomineeListForSingleAndMultiVote || results.NomineeListForSingleAndMultiVote.length === 0) &&
                   (!results.NomineeListForRank || results.NomineeListForRank.length === 0) && (
                    <div className={`text-center ${TEXT_SECONDARY} col-span-2 p-4 bg-gray-100 dark:bg-gray-900/70 rounded-lg`}>No results data found for this event.</div>
                  )}
                </div>
              ) : (
                <div className={`text-center ${TEXT_SECONDARY} p-4 bg-gray-100 dark:bg-gray-900/70 rounded-lg`}>Results are not available yet.</div>
              )}
            </div>
          )}

          {/* Voter Registration Card */}
          <div className={`mb-6 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
              <span className={`text-base font-semibold ${TEXT_PRIMARY} mb-2 md:mb-0`}>Voter Registration Status:</span>
              <button 
                  onClick={onRegisterVoter} 
                  disabled={currentStatus !== 'registration' || isVoterRegistered} 
                  className={`min-w-[150px] px-5 py-2 rounded-lg text-sm font-semibold transition duration-200 shadow-md ${
                      currentStatus === 'registration' && !isVoterRegistered 
                      ? `bg-[#1E3A8A] text-white hover:bg-[#3B82F6] shadow-[#1E3A8A]/50` 
                      : isVoterRegistered 
                      ? `bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed border border-gray-300 dark:border-gray-600`
                      : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`
                  }`}
              >
                  {isVoterRegistered ? 'REGISTERED' : 'REGISTER AS VOTER'}
              </button>
          </div>

          {currentStatus === 'registration' && (
            <form onSubmit={(e) => { e.preventDefault(); onNominate(e); }} className={`p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}>
              <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                Nominee Registration ({isNomineeRegistered ? 'SUBMITTED' : 'OPEN'})
              </h4>
              <p className={`${TEXT_SECONDARY} mb-6 text-sm`}>
                {isNomineeRegistered 
                  ? 'Your nomination is submitted and is awaiting admin approval. You will be notified when the status changes.' 
                  : 'Select a ballot image and provide a compelling description to nominate yourself for this event.'}
              </p>
              
              <h5 className={`text-sm font-semibold mb-3 ${TEXT_PRIMARY}`}>Select Ballot Image</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {ballots.map(b => (
                  <label 
                    key={b.publicId} 
                    className={`relative block rounded-lg overflow-hidden transition duration-150 border-2 
                      ${isNomineeRegistered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} 
                      ${selectedBallot?.publicId === b.publicId 
                        ? `ring-4 ring-offset-2 ring-current ${ACCENT_PRIMARY_TEXT} ring-offset-white dark:ring-offset-gray-900 border-current` 
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white/50'}`}
                  >
                    <input 
                      type="radio" 
                      name="ballot" 
                      className="absolute opacity-0" 
                      disabled={isNomineeRegistered} 
                      checked={selectedBallot?.publicId === b.publicId}
                      onChange={(e) => handleBallotSelection(b, e)} 
                    />
                    <img src={b.url} alt="Ballot" className="w-full aspect-[4/3] object-cover" />
                  </label>
                ))}
              </div>

              <h5 className={`text-sm font-semibold mb-2 ${TEXT_PRIMARY}`}>Nominee Description/Slogan</h5>
              <textarea 
                className={`w-full p-4 bg-gray-200 dark:bg-gray-700/50 rounded-lg mb-6 ${TEXT_PRIMARY} placeholder-gray-500 border border-gray-300 dark:border-gray-700 
                  focus:border-current ${ACCENT_PRIMARY_TEXT} focus:ring-1 focus:ring-current transition duration-150`} 
                rows="3"
                placeholder="Enter your nominee description/slogan here..." 
                disabled={isNomineeRegistered} 
                value={desc} 
                onChange={handleDescriptionChange} 
              />
              
              <button 
                type="submit"
                disabled={isNomineeRegistered || !selectedBallot || !desc.trim()} 
                className={`w-full px-6 py-3 rounded-lg font-bold text-base transition duration-200 shadow-md ${
                  isNomineeRegistered || !selectedBallot || !desc.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                  : BTN_PRIMARY
                }`}
              >
                {isNomineeRegistered ? 'NOMINATION SUBMITTED' : 'SUBMIT NOMINEE APPLICATION'}
              </button>
            </form>
          )}

          {currentStatus === 'voting' && (
            <form onSubmit={(e) => { e.preventDefault(); onVote(e); }} className="space-y-6">
              <h4 className={`font-bold text-xl ${ACCENT_VIOLET} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                  CAST YOUR VOTE ({activeEvent.ElectionType.toUpperCase()})
              </h4>
              {nominees.length === 0 && (
                <div className={`p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center ${TEXT_SECONDARY}`}>
                  No approved nominees yet for this event.
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {nominees.map(n => {
                  const id = n.UserID?._id || n.UserID
                  const isRank = activeEvent.ElectionType==='Rank'
                  const checked = isRank ? rankOrder.includes(id) : !!voteSelection[id]
                  const pos = isRank ? rankOrder.indexOf(id) : -1
                  const name = n.UserID?.FullName || id
                  const userName = n.UserID?.UserName || 'N/A'
                  const profileImage = n.SelectedBalot?.url || n.UserID?.ProfileImage || 'https://placehold.co/60x60/f3f4f6/111827?text=AD'

                  return (
                    <label 
                      key={id} 
                      className={`relative p-4 rounded-xl flex items-center gap-4 transition duration-200 border 
                      ${checked ? `bg-blue-100 dark:bg-violet-900/40 ring-2 ring-current ${ACCENT_VIOLET} border-current` : `${BG_CARD} border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                      ${hasVoted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <input
                        type={isRank ? 'checkbox' : (activeEvent.ElectionType==='Single'?'radio':'checkbox')}
                        name={activeEvent.ElectionType==='Single'?'nominee-single':'nominee'}
                        checked={checked}
                        disabled={hasVoted}
                        className={`w-5 h-5 accent-violet-600 dark:accent-violet-400`}
                        onChange={(e) => handleVoteChange(id, activeEvent.ElectionType, e)}
                      />
                      {isRank && pos>=0 && (
                        <span className={`absolute -top-3 -left-3 w-7 h-7 rounded-full bg-violet-600 dark:bg-violet-400 text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md`}>
                          {pos + 1}
                        </span>
                      )}
                      <img 
                        src={profileImage} 
                        alt={name} 
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-400 dark:ring-gray-600" 
                      />
                      <div>
                        <div className={`font-bold text-lg ${TEXT_PRIMARY}`}>{name}</div>
                        <div className={`text-xs ${TEXT_SECONDARY}`}>@{userName}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
              
              {activeEvent?.votingMode === 'online' && (
                <div className="flex items-center gap-3">
                  <input value={voteCode} onChange={e=>setVoteCode(e.target.value)} placeholder="Enter 6-digit code" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700" />
                  <button type="button" disabled={sendingCode} onClick={requestVoteCode} className={`px-3 py-2 rounded text-sm ${sendingCode?'bg-gray-300 text-gray-600':'bg-blue-600 text-white hover:bg-blue-500'}`}>Send Code</button>
                </div>
              )}

              {activeEvent?.votingMode === 'onCampus' && (
                <div className="flex items-center gap-3">
                  <input value={voteCode} onChange={e=>setVoteCode(e.target.value)} placeholder="Enter current on-campus code" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ask admin or supervisor for the current code.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {(!hasVoted && isVoteDisabled) && (
                  <span className={`text-sm ${ACCENT_ERROR} font-mono text-center sm:text-right`}>
                    <span className="mr-1">❌</span>
                    {activeEvent.ElectionType==='Single' ? 'Select ONE nominee.' : activeEvent.ElectionType==='MultiVote' ? 'Select at least ONE nominee.' : 'Select and rank at least ONE nominee.'}
                  </span>
                )}
                {hasVoted ? (
                  <span className={`min-w-[200px] px-6 py-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 ${ACCENT_SUCCESS} border border-current font-bold shadow-lg text-center`}>
                    <span className="mr-2">✅</span>
                    SUBMITTED
                  </span>
                ) : (
                  <button 
                    type="submit"
                    disabled={isVoteDisabled || isSubmittingVote} 
                    className={`min-w-[200px] px-6 py-3 rounded-lg font-bold text-base transition duration-200 shadow-xl ${
                      (isVoteDisabled || isSubmittingVote)
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                      : `bg-violet-600 text-white hover:bg-violet-500 shadow-violet-900/60`
                    }`}
                  >
                    {isSubmittingVote ? 'SUBMITTING...' : (activeEvent.ElectionType==='Rank' ? (rankOrder.length ? 'SUBMIT RANKED VOTE' : 'SELECT NOMINEES') : 'SUBMIT VOTE')}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Campaign Posting Section (FACEBOOK STYLE) - MOVED TO BOTTOM */}
          <div className="mb-10 mt-10">
            <h4 className={`text-xl font-extrabold mb-4 ${ACCENT_PRIMARY_TEXT}`}>Event Discussion & Updates</h4>
            {campaignError && (
              <div className="mb-4 text-xs p-3 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                {campaignError}
              </div>
            )}
            
            {/* Create Post Input */}
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                   <img src={user?.ProfileImage || 'https://placehold.co/40x40'} alt="me" className="w-10 h-10 rounded-full object-cover" />
                   <textarea
                     value={newPostContent}
                     onChange={(e)=>setNewPostContent(e.target.value)}
                     placeholder={`What's on your mind, ${user?.FullName?.split(' ')[0] || 'User'}?`}
                     className="flex-1 bg-gray-100 dark:bg-[#3A3B3C] rounded-2xl px-4 py-2 min-h-[50px] outline-none border-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500"
                     disabled={postingLoading}
                   />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                   <div className="flex gap-2">
                       <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] cursor-pointer transition text-gray-600 dark:text-gray-300 text-sm font-medium">
                          <PhotoIcon className="w-5 h-5 text-green-500" />
                          <span>Photo</span>
                          <input type="file" multiple accept="image/*" onChange={onPicturesChange} className="hidden" />
                       </label>
                       <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] cursor-pointer transition text-gray-600 dark:text-gray-300 text-sm font-medium">
                          <VideoIcon className="w-5 h-5 text-red-500" />
                          <span>Video</span>
                          <input type="file" multiple accept="video/*" onChange={onVideosChange} className="hidden" />
                       </label>
                   </div>
                   <button 
                      onClick={handleCreateCampaignPost}
                      disabled={postingLoading || (!newPostContent && newPostPictures.length===0 && newPostVideos.length===0)}
                      className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                          postingLoading || (!newPostContent && newPostPictures.length===0 && newPostVideos.length===0)
                          ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                   >
                     {postingLoading ? 'Posting...' : 'Post'}
                   </button>
                </div>
                 {/* Preview Selected Files count */}
                 {(newPostPictures.length>0 || newPostVideos.length>0) && (
                    <div className="px-2 pt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Added: {newPostPictures.length} Photos, {newPostVideos.length} Videos
                    </div>
                 )}
            </div>

            {/* Posts Feed */}
            {campaignLoading && (
               <div className="space-y-4">
                 {[1,2].map(i => (
                    <div key={i} className="bg-white dark:bg-[#242526] rounded-xl p-4 shadow-sm h-40 animate-pulse">
                        <div className="flex gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                 ))}
               </div>
            )}
            
            {!campaignLoading && campaignPosts.length===0 && !campaignError && (
               <div className="text-center py-10 bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
                  No updates yet. Be the first to post!
               </div>
            )}

            <div className="space-y-5">
              {campaignPosts.map(p => {
                const userOwn = user?._id === p.ownerDetails?._id
                const isMenuOpen = activeMenuPostId === p._id
                const isCommentsExpanded = expandedComments[p._id]

                return (
                  <div key={(p._id||Math.random())} className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
                    
                    {/* Post Header */}
                    <div className="p-4 flex items-start justify-between relative">
                      <div className="flex items-center gap-3">
                        <img 
                            src={p.ownerDetails?.ProfileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=U'} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700" 
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                              {p.ownerDetails?.FullName || 'Unknown User'}
                          </div>
                          {/* UPDATED: Date with Time Ago */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-1 items-center" title={new Date(p.createdAt).toLocaleString()}>
                              <span>{timeAgo(p.createdAt)}</span>
                              <span>•</span>
                              <span>{new Date(p.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Three Dots Menu */}
                      {userOwn && (
                          <div className="relative">
                            <button 
                                onClick={() => toggleMenu(p._id)} 
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-500 transition"
                            >
                                <ThreeDotsIcon className="w-5 h-5" />
                            </button>
                            
                            {isMenuOpen && (
                                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#242526] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1 animation-fade-in">
                                    <button 
                                        onClick={() => handleEditPost(p._id)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"
                                    >
                                        <EditIcon className="w-4 h-4" /> Edit Post
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePost(p._id)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
                                    >
                                        <TrashIcon className="w-4 h-4" /> Delete Post
                                    </button>
                                </div>
                            )}
                          </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-2">
                       {p.content && <p className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{p.content}</p>}
                    </div>

                    {/* Media Grid */}
                    {(p.picture?.length > 0 || p.video?.length > 0) && (
                        <div className={`mt-2 ${
                            (p.picture?.length + p.video?.length) > 1 ? 'grid grid-cols-2 gap-0.5' : ''
                        }`}>
                            {p.picture?.map((img) => (
                                <img key={img.publicId} src={img.url} className="w-full h-full object-cover max-h-[500px]" alt="Post attachment" />
                            ))}
                            {p.video?.map((v) => (
                                <video key={v.publicId} src={v.url} controls className="w-full h-full object-cover max-h-[500px]" />
                            ))}
                        </div>
                    )}

                    {/* Reaction Counts */}
                    <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mx-4">
                        <div className="flex items-center gap-1">
                            {(p.likes?.length > 0 || p.dislikes?.length > 0) && (
                                <span className="flex -space-x-1">
                                    {p.likes?.length > 0 && <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">👍</span>}
                                    {p.dislikes?.length > 0 && <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">👎</span>}
                                </span>
                            )}
                            <span>{ (p.likes?.length || 0) + (p.dislikes?.length || 0) }</span>
                        </div>
                        <button 
                            onClick={() => toggleComments(p._id)}
                            className="hover:underline"
                        >
                            {p.comments?.length || 0} comments
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-2 py-1 flex justify-between gap-1 mx-2">
                        <button 
                            onClick={()=>handleReact(p._id,'like')} 
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition text-sm font-medium ${
                                p.likes?.includes(user?._id) ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <ThumbUpIcon className="w-5 h-5" fill={p.likes?.includes(user?._id) ? "currentColor" : "none"}/>
                            Like
                        </button>
                         <button 
                            onClick={()=>handleReact(p._id,'dislike')} 
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition text-sm font-medium ${
                                p.dislikes?.includes(user?._id) ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <ThumbDownIcon className="w-5 h-5" fill={p.dislikes?.includes(user?._id) ? "currentColor" : "none"}/>
                            Dislike
                        </button>
                        <button 
                            onClick={() => toggleComments(p._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition text-gray-600 dark:text-gray-300 text-sm font-medium"
                        >
                            <CommentIcon className="w-5 h-5" />
                            Comment
                        </button>
                    </div>

                    {/* Comments Section (Dropdown) */}
                    {isCommentsExpanded && (
                      <div className="animation-fade-in-down">
                        {p.comments?.length > 0 && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1A2129]/30">
                                <div className="space-y-3">
                                    {p.comments.map(c => (
                                        <div key={c._id} className="flex gap-2 group">
                                            <img src={c.ownerProfileImage || 'https://placehold.co/32x32'} className="w-8 h-8 rounded-full object-cover mt-1" alt="commenter" />
                                            <div className="flex-1">
                                                <div className="bg-gray-200 dark:bg-[#3A3B3C] rounded-2xl px-3 py-2 inline-block">
                                                    <div className="font-semibold text-xs text-gray-900 dark:text-gray-200">{c.ownerName}</div>
                                                    <div className="text-sm text-gray-800 dark:text-gray-300 break-words">{c.comment}</div>
                                                </div>
                                                {/* Comment Actions: Like & Reply */}
                                                <div className="flex items-center gap-4 mt-1 ml-2 text-[10px] text-gray-500 font-medium">
                                                    <button 
                                                        onClick={() => handleReactComment(p._id, c._id)}
                                                        className={`hover:underline ${c.likedByMe ? 'text-blue-600 font-bold' : ''}`}
                                                    >
                                                        Like {c.likesCount > 0 && `(${c.likesCount})`}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReplyComment(p._id, c.ownerName)}
                                                        className="hover:underline"
                                                    >
                                                        Reply
                                                    </button>
                                                    {user?._id === c.owner && (
                                                        <button onClick={()=>handleDeleteComment(p._id, c._id)} className="text-red-500 hover:underline">Delete</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Comment Box (Inside Dropdown) */}
                        <div className="px-4 py-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-700">
                            <img src={user?.ProfileImage || 'https://placehold.co/32x32'} className="w-8 h-8 rounded-full object-cover" alt="me" />
                            <div className="flex-1 relative">
                                <input
                                    ref={el => commentInputRefs.current[p._id] = el}
                                    value={commentInputs[p._id]||''}
                                    onChange={(e)=> setCommentInputs(c=> ({ ...c, [p._id]: e.target.value })) }
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(p._id); }}
                                    placeholder="Write a comment..."
                                    className="w-full bg-gray-100 dark:bg-[#3A3B3C] text-gray-900 dark:text-gray-100 rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button 
                                    onClick={()=>handleAddComment(p._id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1 transition"
                                >
                                    <SendIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case NAV_ITEMS.DASHBOARD:
        return renderDashboardView();
      case NAV_ITEMS.UPCOMING:
        return renderEventListView(NAV_ITEMS.UPCOMING);
      case NAV_ITEMS.RUNNING:
        return renderEventListView(NAV_ITEMS.RUNNING);
      case NAV_ITEMS.PREVIOUS:
        return renderEventListView(NAV_ITEMS.PREVIOUS);
      case NAV_ITEMS.PROFILE:
        return renderProfileView();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Edit Post Modal */}
      <EditPostModal 
        post={editingPost}
        isOpen={!!editingPostId}
        onClose={() => {
          setEditingPostId(null)
          setEditingPost(null)
        }}
        onSave={handleSaveEditPost}
        isLoading={editLoading}
      />

      {/* Layout Container */}
      <div className={`flex-1 h-screen overflow-hidden ${BG_BODY} ${TEXT_PRIMARY} font-sans flex flex-col lg:flex-row`}>
        {/* Sidebar */}
        <aside className={`w-full lg:w-72 ${BG_SIDEBAR} shadow-xl lg:shadow-2xl p-6 lg:h-screen lg:overflow-y-auto border-r border-gray-200 dark:border-gray-700/50 flex-shrink-0`}>
          
          <div className="flex items-center mb-10 pb-4 border-b border-gray-200 dark:border-gray-700">
            <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:to-gray-400`}>
              E-VoteHub
            </span>
          </div>

          <nav className="space-y-2">
            <NavItem 
              icon={DashboardIcon} 
              label={NAV_ITEMS.DASHBOARD} 
              isActive={activeView === NAV_ITEMS.DASHBOARD && !activeEvent}
              onClick={(e) => handleNavigation(NAV_ITEMS.DASHBOARD, e)}
            />
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <h4 className={`text-xs ${TEXT_SECONDARY} uppercase font-semibold tracking-wider px-4 mb-2`}>Events</h4>
            <NavItem 
              icon={RunningIcon} 
              label={NAV_ITEMS.RUNNING} 
              isActive={activeView === NAV_ITEMS.RUNNING}
              onClick={(e) => handleNavigation(NAV_ITEMS.RUNNING, e)}
            />
            <NavItem 
              icon={UpcomingIcon} 
              label={NAV_ITEMS.UPCOMING} 
              isActive={activeView === NAV_ITEMS.UPCOMING}
              onClick={(e) => handleNavigation(NAV_ITEMS.UPCOMING, e)}
            />
            <NavItem 
              icon={PreviousIcon} 
              label={NAV_ITEMS.PREVIOUS} 
              isActive={activeView === NAV_ITEMS.PREVIOUS}
              onClick={(e) => handleNavigation(NAV_ITEMS.PREVIOUS, e)}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <NavItem 
              icon={ProfileIcon} 
              label={NAV_ITEMS.PROFILE} 
              isActive={activeView === NAV_ITEMS.PROFILE}
              onClick={(e) => handleNavigation(NAV_ITEMS.PROFILE, e)}
            />
            <button
              onClick={onLogout} 
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 shadow-sm`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 lg:h-screen lg:overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderActiveContent()}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
