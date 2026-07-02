import { Link } from 'react-router-dom'
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Swal from 'sweetalert2'
import { listEvents, countVote, getPendingNominees, approveNominee, createEvent, api as apiClient, listCampaignPosts, deleteCampaignPost, deleteCampaignComment, rotateOnCampusCode, updateEventTimes } from '../lib/api'
import { getVoters } from '../lib/votersApi'
import { io } from 'socket.io-client'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js' 

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title) 

// --- THEME-AWARE COLOR MAPPING FOR FOOTER ---
// Defined color variables for easy adjustment and theme consistency
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

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

// --- Inline SVG Icons ---
const MailIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"></path></svg>);

const BG_BODY = 'bg-[#ECEBEB] dark:bg-[#1A2129]' 
const BG_SIDEBAR = 'bg-white dark:bg-[#111827]'
const BG_CARD = 'bg-white dark:bg-[#111827]'
const BG_DARK_CARD = 'bg-gray-100 dark:bg-[#111827]'

const TEXT_PRIMARY = 'text-gray-900 dark:text-white'
const TEXT_SECONDARY = 'text-gray-600 dark:text-slate-400'
const ACCENT_PRIMARY_TEXT = `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`
const ACCENT_SUCCESS = 'text-[#10B981] dark:text-[#10B981]'
const ACCENT_WARNING = 'text-[#F59E0B] dark:text-[#F59E0B]'
const ACCENT_ERROR = 'text-[#DC2626] dark:text-[#DC2626]'
const ACCENT_VIOLET = 'text-violet-600 dark:text-violet-400'

const CHART_LIGHT_PURPLE = '#9333EA';
const CHART_DARK_GRAY = '#E5E7EB';

const BTN_PRIMARY = `bg-[${ACCENT_PRIMARY_HEX}] text-white hover:bg-[${ACCENT_SECONDARY_HEX}] transition duration-200 shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40`
const INPUT_CLASS = `w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 ${BG_CARD} ${TEXT_PRIMARY} placeholder-gray-500 focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}] outline-none transition duration-150`

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'

const NAV_ITEMS = {
  DASHBOARD: 'Overview Dashboard',
  CREATE: 'Create New Event',
  RUNNING: 'Voting Live Events',
  UPCOMING: 'Upcoming Events',
  PREVIOUS: 'Finished Events',
}

const DashboardIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18.7 8.7L12 15.4 9.3 12.7 6 16"/></svg>);
const CreateIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14"/></svg>);
const RunningIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const UpcomingIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PreviousIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>);
const LogoutIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);

const ThreeDotsIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>);
const ThumbUpIcon = ({ className = '', fill = "none" }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>);
const ThumbDownIcon = ({ className = '', fill = "none" }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>);
const CommentIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>);
const TrashIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const SendIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);

// Footer Component
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

const getNominees = async (eventId) => {
  try {
    const response = await fetch(`/api/nominees?eventId=${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch nominees');
    return await response.json();
  } catch (error) {
    console.error('Error fetching nominees:', error);
    return [];
  }
};

const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClass = isActive 
    ? `bg-[#1E3A8A] text-white dark:bg-[#3B82F6] dark:text-white shadow-xl shadow-[#1E3A8A]/40 dark:shadow-[#3B82F6]/40 font-bold`
    : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`;
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeClass}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${!isActive && ACCENT_PRIMARY_TEXT}`} />
      <span className="text-sm">{label}</span>
    </button>
  );
};

const MetricBox = ({ title, value, accentClass = ACCENT_PRIMARY_TEXT, icon: Icon, iconBgClass }) => (
  <div className={`p-6 rounded-xl ${BG_CARD} shadow-md transition duration-300 border border-gray-200 dark:border-gray-700`}>
    <div className="flex items-center justify-between mb-3">
        <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium`}>{title}</div>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass}`}>
          <Icon className={`w-5 h-5 text-white`} />
        </span>
    </div>
    <div className={`text-4xl font-extrabold ${accentClass}`}>{value}</div>
  </div>
);

const EventListItem = ({ event, onClick, isActive }) => {
  let statusClass = ACCENT_PRIMARY_TEXT; 
  let statusDetail = 'Registration Open';
  let statusSymbol = '';

  if (new Date(event.VoteEndTime).getTime() <= new Date().getTime()) {
    event.status = 'finished';
    statusClass = ACCENT_SUCCESS;
    statusDetail = 'Finished';
    statusSymbol = '';
  } else if (new Date(event.VoteStartTime).getTime() <= new Date().getTime()) {
    event.status = 'voting';
    statusClass = ACCENT_VIOLET;
    statusDetail = 'Voting Live';
    statusSymbol = '';
  } else if (new Date(event.RegEndTime).getTime() <= new Date().getTime()) {
    event.status = 'waiting';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Waiting to Vote';
    statusSymbol = '';
  } else {
    event.status = 'registration';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Registration Open';
    statusSymbol = '';
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition duration-200 shadow-sm border ${isActive ? `border-current ring-2 ring-current ${ACCENT_PRIMARY_TEXT} ${BG_CARD} shadow-lg` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] hover:shadow-md'}`}
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
    </button>
  );
};

const AdminCampaignPost = ({ post, onDeletePost, onDeleteComment, activeMenuPostId, onToggleMenu, expandedComments, onToggleComments }) => {
  const isMenuOpen = activeMenuPostId === post._id;
  const isCommentsExpanded = expandedComments[post._id];

  const handleDeleteClick = useCallback(() => {
    onDeletePost(post._id);
    onToggleMenu(null);
  }, [post._id, onDeletePost, onToggleMenu]);

  const handleMenuToggle = useCallback(() => {
    onToggleMenu(isMenuOpen ? null : post._id);
  }, [post._id, isMenuOpen, onToggleMenu]);

  const handleCommentsToggle = useCallback(() => {
    onToggleComments(post._id);
  }, [post._id, onToggleComments]);

  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
      
      <div className="p-4 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <img 
            src={post.ownerDetails?.ProfileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=U'} 
            alt="avatar" 
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700" 
          />
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
              {post.ownerDetails?.FullName || 'Unknown User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-1 items-center" title={new Date(post.createdAt).toLocaleString()}>
              <span>{timeAgo(post.createdAt)}</span>
              <span>-</span>
              <span>{new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={handleMenuToggle} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-500 transition"
            data-testid={`button-post-menu-${post._id}`}
          >
            <ThreeDotsIcon className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#242526] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
              <button 
                onClick={handleDeleteClick}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
                data-testid={`button-delete-post-${post._id}`}
              >
                <TrashIcon className="w-4 h-4" /> Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        {post.content && <p className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>}
      </div>

      {(post.picture?.length > 0 || post.video?.length > 0) && (
        <div className={`mt-2 ${
          (post.picture?.length + post.video?.length) > 1 ? 'grid grid-cols-2 gap-0.5' : ''
        }`}>
          {post.picture?.map((img) => (
            <img key={img.publicId} src={img.url} className="w-full h-full object-cover max-h-[500px]" alt="Post attachment" />
          ))}
          {post.video?.map((v) => (
            <video key={v.publicId} src={v.url} controls className="w-full h-full object-cover max-h-[500px]" />
          ))}
        </div>
      )}

      <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mx-4">
        <div className="flex items-center gap-1">
          {(post.likes?.length > 0 || post.dislikes?.length > 0) && (
            <span className="flex -space-x-1">
              {post.likes?.length > 0 && <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">+</span>}
              {post.dislikes?.length > 0 && <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">-</span>}
            </span>
          )}
          <span>{ (post.likes?.length || 0) + (post.dislikes?.length || 0) }</span>
        </div>
        <button 
          onClick={handleCommentsToggle}
          className="hover:underline"
          data-testid={`button-toggle-comments-${post._id}`}
        >
          {post.comments?.length || 0} comments
        </button>
      </div>

      <div className="px-2 py-1 flex justify-between gap-1 mx-2">
        <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-300 text-sm font-medium">
          <ThumbUpIcon className="w-5 h-5"/>
          <span>{post.likes?.length || 0} Likes</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-300 text-sm font-medium">
          <ThumbDownIcon className="w-5 h-5"/>
          <span>{post.dislikes?.length || 0} Dislikes</span>
        </div>
        <button 
          onClick={handleCommentsToggle}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition text-gray-600 dark:text-gray-300 text-sm font-medium"
          data-testid={`button-view-comments-${post._id}`}
        >
          <CommentIcon className="w-5 h-5" />
          Comments
        </button>
      </div>

      {isCommentsExpanded && (
        <div>
          {post.comments?.length > 0 && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1A2129]/30">
              <div className="space-y-3">
                {post.comments.map(c => (
                  <div key={c._id} className="flex gap-2 group">
                    <img src={c.ownerProfileImage || 'https://placehold.co/32x32'} className="w-8 h-8 rounded-full object-cover mt-1" alt="commenter" />
                    <div className="flex-1">
                      <div className="bg-gray-200 dark:bg-[#3A3B3C] rounded-2xl px-3 py-2 inline-block">
                        <div className="font-semibold text-xs text-gray-900 dark:text-gray-200">{c.ownerName}</div>
                        <div className="text-sm text-gray-800 dark:text-gray-300 break-words">{c.comment}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-2 text-[10px] text-gray-500 font-medium">
                        <span className="text-gray-400">{timeAgo(c.createdAt)}</span>
                        <button 
                          onClick={() => onDeleteComment(post._id, c._id)} 
                          className="text-red-500 hover:underline"
                          data-testid={`button-delete-comment-${c._id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.comments?.length === 0 && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-500">
              No comments on this post yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default function AdminDashboard(){
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeView, setActiveView] = useState(NAV_ITEMS.DASHBOARD)
  const [counts, setCounts] = useState({ simple: [], rank: [] })
  const [pending, setPending] = useState([])
  const [voters, setVoters] = useState([])

  const [newEvent, setNewEvent] = useState({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single', votingMode:'online', codeRotationMinutes:15 })
  const [ballotFiles, setBallotFiles] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(false)

  const [campaignPosts, setCampaignPosts] = useState([])
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)
  const [expandedComments, setExpandedComments] = useState({})
  const [nominees, setNominees] = useState([])

  const [isRotating, setIsRotating] = useState(false)
  const [codeInfo, setCodeInfo] = useState({ code: '', expiresAt: null })
  const [codeRemaining, setCodeRemaining] = useState(null)

  const [editTimes, setEditTimes] = useState({ RegEndTime:'', VoteStartTime:'', VoteEndTime:'' })
  const [savingTimes, setSavingTimes] = useState(false)

  const [now, setNow] = useState(()=> new Date())
  
  useEffect(()=>{ 
    const id = setInterval(()=> setNow(new Date()), 1000); 
    return ()=> clearInterval(id) 
  },[])
  
  const timeLeft = useCallback((iso)=>{ 
    const d=new Date(iso); 
    if(isNaN(d.getTime())) return '00:00:00'; 
    const t=d.getTime()-now.getTime(); 
    if(t<=0) return '00:00:00'; 
    const h=String(Math.floor(t/3600000)).padStart(2,'0'); 
    const m=String(Math.floor((t%3600000)/60000)).padStart(2,'0'); 
    const s=String(Math.floor((t%60000)/1000)).padStart(2,'0'); 
    return `${h}:${m}:${s}` 
  }, [now])

  useEffect(()=>{ listEvents().then(setEvents) },[])

  const categorizedEvents = useMemo(() => {
    const categories = { upcoming: [], running: [], previous: [] };
    const nowMs = new Date().getTime();

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
  }, [events]);
  
  const currentEventsList = useMemo(() => {
    switch (activeView) {
      case NAV_ITEMS.UPCOMING: return categorizedEvents.upcoming;
      case NAV_ITEMS.RUNNING: return categorizedEvents.running;
      case NAV_ITEMS.PREVIOUS: return categorizedEvents.previous;
      default: return [];
    }
  }, [activeView, categorizedEvents]);

  useEffect(()=>{
    if(!activeEvent) return
    setLoadingEvent(true)
    setCounts({ simple: [], rank: [] })
    setPending([])
    setVoters([])
    setNominees([])
    setCampaignPosts([])
    setActiveMenuPostId(null)
    setExpandedComments({})

    const fetchEventData = async () => {
      try{
        const [c, p, v, n, posts] = await Promise.all([
          countVote(activeEvent._id),
          getPendingNominees(activeEvent._id),
          getVoters(activeEvent._id),
          getNominees(activeEvent._id),
          listCampaignPosts(activeEvent._id)
        ])
        setCounts({ simple: c.NomineeListForSingleAndMultiVote, rank: c.NomineeListForRank })
        setPending(p)
        setVoters(v)
        setNominees(Array.isArray(n) ? n : (n?.nominees || []))
        setCampaignPosts(Array.isArray(posts) ? posts : (posts?.posts || []))
      } catch(err){
        console.error("Failed to fetch event data:", err)
      } finally {
        setLoadingEvent(false)
      }
    }
    
    fetchEventData()

    let s;
    const nowMs = new Date().getTime()
    const voteStartMs = new Date(activeEvent.VoteStartTime).getTime()
    const voteEndMs = new Date(activeEvent.VoteEndTime).getTime()
    
    if (nowMs >= voteStartMs && nowMs < voteEndMs) {
      s = io(API_BASE, { withCredentials: true })
      s.emit('joinEvent', activeEvent._id)
      s.on('voteUpdate', async (payload)=>{
        if(payload.eventId === activeEvent._id){
          try{
            const c = await countVote(activeEvent._id)
            setCounts({ simple: c.NomineeListForSingleAndMultiVote, rank: c.NomineeListForRank })
          }catch(err){
            console.error("Socket vote update failed:", err)
          }
        }
      })
    }

    return ()=>{ 
      if(s){ s.emit('leaveEvent', activeEvent._id); s.disconnect() }
    }
  },[activeEvent?._id])

  const fetchCodeInfo = useCallback(async ()=>{
    if(!activeEvent || activeEvent.votingMode !== 'onCampus' || activeEvent.status !== 'voting') return
    try{
      const res = await apiClient.get('/api/V1/admin/getCurrentVoteCode', { params: { EventID: activeEvent._id } })
      const d = res.data?.data || {}
      setCodeInfo({ code: d.currentVoteCode || '', expiresAt: d.currentCodeExpiresAt || null })
    }catch(e){ /* ignore */ }
  }, [activeEvent?._id, activeEvent?.votingMode, activeEvent?.status])

  useEffect(()=>{
    let timer
    fetchCodeInfo()
    if(activeEvent?.votingMode === 'onCampus' && activeEvent?.status === 'voting'){
      timer = setInterval(fetchCodeInfo, 30000)
    }
    return ()=>{ if(timer) clearInterval(timer) }
  }, [activeEvent?._id, fetchCodeInfo])

  useEffect(()=>{
    if(!activeEvent || activeEvent.votingMode !== 'onCampus' || activeEvent.status !== 'voting' || !codeInfo.expiresAt) { 
      setCodeRemaining(null); 
      return 
    }
    const tick = async ()=>{
      const ms = new Date(codeInfo.expiresAt).getTime() - Date.now()
      const remain = Math.max(0, Math.floor(ms/1000))
      setCodeRemaining(remain)
      if(remain === 0){
        await fetchCodeInfo()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return ()=> clearInterval(id)
  }, [activeEvent?._id, codeInfo.expiresAt, fetchCodeInfo])

  const formatRemain = useCallback((s)=>{
    if(s==null) return '—'
    const mm = String(Math.floor(s/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${mm}:${ss}`
  }, [])

  const onRotateCode = useCallback(async ()=>{
    if(!activeEvent) return
    try{
      setIsRotating(true)
      await rotateOnCampusCode(activeEvent._id)
      await fetchCodeInfo()
      Swal.fire({title: 'Success!', text: 'Verification code rotated successfully', icon: 'success', confirmButtonText: 'OK', background: 'rgb(0, 128, 0)', color: 'rgb(255, 255, 255)'})
    }catch(err){
      Swal.fire({title: 'Rotation Failed', text: err?.response?.data?.message || 'Failed to rotate verification code', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'})
    }finally{
      setIsRotating(false)
    }
  }, [activeEvent?._id, fetchCodeInfo])

  const handleNavigation = useCallback((view) => {
    setActiveView(view)
    setActiveEvent(null)
  }, [])

  const handleEventSelection = useCallback((event) => {
    setActiveEvent(event)
  }, [])

  const onApprove = useCallback(async (uid)=>{
    if(!activeEvent) return
    try{
      await approveNominee({ EventID: activeEvent._id, NomineeID: uid })
      setPending(p => p.filter(x => (x.UserID?._id || x.UserID) !== uid))
    }catch(err){
      Swal.fire({title: 'Approval Failed', text: err?.response?.data?.message || 'Failed to approve nominee', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'})
    }
  }, [activeEvent?._id])

  const onCreateEvent = useCallback(async (e)=>{
    e.preventDefault()
    setIsCreating(true)
    try{
      await createEvent({ ...newEvent, BallotImageFiles: ballotFiles })
      Swal.fire({title: 'Event Created!', text: 'New voting event has been created successfully', icon: 'success', confirmButtonText: 'Great!', background: 'rgb(0, 128, 0)', color: 'rgb(255, 255, 255)'})
      setNewEvent({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single', votingMode:'online', codeRotationMinutes:15 })
      setBallotFiles([])
      
      const updated = await listEvents()
      setEvents(updated)
      setActiveView(NAV_ITEMS.DASHBOARD)
    }catch(err){
      Swal.fire({title: 'Creation Failed', text: err?.response?.data?.message || 'Failed to create event', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'})
    }finally{
      setIsCreating(false)
    }
  }, [newEvent, ballotFiles])

  useEffect(()=>{
    if(!activeEvent) return
    setEditTimes({
      RegEndTime: activeEvent.RegEndTime ? new Date(activeEvent.RegEndTime).toISOString().slice(0,16) : '',
      VoteStartTime: activeEvent.VoteStartTime ? new Date(activeEvent.VoteStartTime).toISOString().slice(0,16) : '',
      VoteEndTime: activeEvent.VoteEndTime ? new Date(activeEvent.VoteEndTime).toISOString().slice(0,16) : '',
    })
  },[activeEvent?._id])

  const onSaveTimes = useCallback(async ()=>{
    if(!activeEvent) return
    try{
      setSavingTimes(true)
      await updateEventTimes({ EventID: activeEvent._id, ...editTimes })
      Swal.fire({title: 'Times Saved!', text: 'Event timing has been updated successfully', icon: 'success', confirmButtonText: 'OK', background: 'rgb(0, 128, 0)', color: 'rgb(255, 255, 255)'})
      const refreshed = await listEvents()
      setEvents(refreshed)
      const updated = refreshed.find(e=>e._id===activeEvent._id)
      if(updated) setActiveEvent(updated)
    }catch(err){
      Swal.fire({title: 'Update Failed', text: err?.response?.data?.message || 'Failed to update event times', icon: 'error', confirmButtonText: 'Try Again', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'})
    }finally{ setSavingTimes(false) }
  }, [activeEvent?._id, editTimes])

  const onApplyDeltas = useCallback(async () => {
    if(!activeEvent) return
    const parseDelta = (v)=>{ const n = parseInt(v,10); return isNaN(n)?0:n }
    const regEnd = new Date(activeEvent.RegEndTime)
    const voteStart = new Date(activeEvent.VoteStartTime)
    const voteEnd = new Date(activeEvent.VoteEndTime)
    regEnd.setMinutes(regEnd.getMinutes() + parseDelta(editTimes.RegEndDelta))
    voteStart.setMinutes(voteStart.getMinutes() + parseDelta(editTimes.VoteStartDelta))
    voteEnd.setMinutes(voteEnd.getMinutes() + parseDelta(editTimes.VoteEndDelta))
    try{
      setSavingTimes(true)
      await updateEventTimes({ EventID: activeEvent._id, RegEndTime: regEnd.toISOString(), VoteStartTime: voteStart.toISOString(), VoteEndTime: voteEnd.toISOString() })
      Swal.fire({title: 'Times Updated!', text: 'Event times have been saved successfully', icon: 'success', confirmButtonText: 'Done', background: 'rgb(0, 128, 0)', color: 'rgb(255, 255, 255)'})
      const refreshed = await listEvents()
      setEvents(refreshed)
      const updated = refreshed.find(e=>e._id===activeEvent._id)
      if(updated) setActiveEvent(updated)
      setEditTimes({ RegEndDelta:'', VoteStartDelta:'', VoteEndDelta:'' })
    }catch(err){
      Swal.fire({title: 'Failed', text: err?.response?.data?.message || 'Failed to apply changes', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'})
    }finally{ setSavingTimes(false) }
  }, [activeEvent, editTimes])

  const toggleMenu = useCallback((postId) => {
    setActiveMenuPostId(prev => prev === postId ? null : postId);
  }, []);

  const toggleComments = useCallback((postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const handleAdminDeletePost = useCallback(async (postID) => {
    const result = await Swal.fire({title: 'Delete Post?', text: 'This post will be permanently deleted. This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel', confirmButtonColor: '#DC2626', cancelButtonColor: '#6B7280', background: 'rgb(255, 255, 0)', color: 'rgb(255, 255, 255)'})
    if (!result.isConfirmed) return
    try{
      await deleteCampaignPost({ eventID: activeEvent._id, postID })
      setCampaignPosts(p=> p.filter(x=> x._id!==postID))
    }catch(err){ 
      Swal.fire({title: 'Delete Failed', text: err?.response?.data?.message || 'Failed to delete post', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'}) 
    }
  }, [activeEvent?._id])

  const handleAdminDeleteComment = useCallback(async (postID, commentID) => {
    const confirmResult = await Swal.fire({title: 'Delete Comment?', text: 'This comment will be permanently removed.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel', confirmButtonColor: '#DC2626', cancelButtonColor: '#6B7280', background: 'rgb(255, 255, 0)', color: 'rgb(255, 255, 255)'})
    if (!confirmResult.isConfirmed) return
    try{
      await deleteCampaignComment({ eventID: activeEvent._id, commentID })
      setCampaignPosts(p=> p.map(x=> x._id===postID ? { ...x, comments: (x.comments||[]).filter(c=> c._id!==commentID) } : x ))
    }catch(err){ 
      Swal.fire({title: 'Delete Failed', text: err?.response?.data?.message || 'Failed to delete comment', icon: 'error', confirmButtonText: 'Retry', background: 'rgb(255, 0, 0)', color: 'rgb(255, 255, 255)'}) 
    }
  }, [activeEvent?._id])

  const chartTextColor = useMemo(() => {
    if (document.documentElement.classList.contains('dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return 'white';
    }
    return '#333'; 
  }, [activeEvent?._id]);

  const voteTallyData = useMemo(()=>{
    const labels = counts.simple.map(x=>x.NomineeIDName || x.NomineeID)
    const barColor = chartTextColor === 'white' ? CHART_DARK_GRAY : CHART_LIGHT_PURPLE;
    return {
      labels,
      datasets: [{
        label: 'Total Votes',
        data: counts.simple.map(x=>x.TotalVote),
        backgroundColor: barColor, 
        borderColor: barColor,
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      }]
    }
  },[counts, chartTextColor]) 

  const doughnutData = useMemo(()=>{
    const labels = counts.rank.map(x=>x.NomineeIDName || x.NomineeID)
    return {
      labels,
      datasets: [{
        label: 'Total Rank (Lower is Better)',
        data: counts.rank.map(x=>x.TotalRank),
        backgroundColor: ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444']
      }]
    }
  },[counts])

  const commonChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false, color: chartTextColor },
      legend: { display: false },
    },
    scales: {
      x: {
        grid: {
          color: chartTextColor === 'white' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          borderColor: chartTextColor,
          drawOnChartArea: true
        },
        ticks: { color: chartTextColor }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: chartTextColor === 'white' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          borderColor: chartTextColor,
          drawOnChartArea: true
        },
        ticks: { color: chartTextColor }
      }
    }
  }), [chartTextColor]);

  const renderDashboardView = () => (
    <>
      <h2 className={`text-5xl font-extrabold ${TEXT_PRIMARY} mb-10 flex items-center`}>
        <span className={`mr-4 text-6xl ${ACCENT_PRIMARY_TEXT}`}></span>
        Admin Control Dashboard
      </h2>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricBox 
          title="Total Events" 
          value={events.length} 
          icon={DashboardIcon} 
          iconBgClass={`bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`}
          accentClass={ACCENT_PRIMARY_TEXT}
        />
        <MetricBox 
          title="Live Voting Events" 
          value={categorizedEvents.running.length} 
          icon={RunningIcon} 
          iconBgClass="bg-violet-600 dark:bg-violet-400"
          accentClass={ACCENT_VIOLET}
        />
        <MetricBox 
          title="Upcoming Events" 
          value={categorizedEvents.upcoming.length} 
          icon={UpcomingIcon} 
          iconBgClass="bg-yellow-600 dark:bg-yellow-400"
          accentClass={ACCENT_WARNING}
        />
        <MetricBox 
          title="Finished Events" 
          value={categorizedEvents.previous.length} 
          icon={PreviousIcon} 
          iconBgClass="bg-green-600 dark:bg-green-400"
          accentClass={ACCENT_SUCCESS}
        />
      </div>

      <h3 className={`text-2xl font-bold ${TEXT_PRIMARY} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
        Quick Actions
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>
            <CreateIcon className="w-6 h-6 mr-2" />
            Launch New Event
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Quickly jump to the form to set up and launch a new election or event.
          </p>
          <button 
            onClick={() => handleNavigation(NAV_ITEMS.CREATE)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
            data-testid="button-create-event"
          >
            Create Event Form
          </button>
        </div>

        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_VIOLET} mb-3`}>
            <RunningIcon className="w-6 h-6 mr-2" />
            Manage Live Events
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Monitor voting, approve nominees, and view live results for active events.
          </p>
          <button 
            onClick={() => handleNavigation(NAV_ITEMS.RUNNING)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY.replace(/shadow-.*$/, 'shadow-violet-900/60')}`}
            data-testid="button-manage-live-events"
          >
            Go to Live Events ({categorizedEvents.running.length})
          </button>
        </div>
      </div>
    </>
  )

  const renderCreateEventView = () => (
    <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
      <h2 className={`text-3xl font-extrabold ${ACCENT_PRIMARY_TEXT} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center`}>
        <CreateIcon className="w-6 h-6 mr-3" />
        {NAV_ITEMS.CREATE}
      </h2>
      <form onSubmit={onCreateEvent} className={`p-6 rounded-xl ${BG_CARD} shadow-md border border-gray-200 dark:border-gray-700 space-y-4`}>
        <input className={`${INPUT_CLASS} lg:col-span-2`} placeholder="Event Title (e.g., Annual Board Election)" value={newEvent.Title} onChange={e=>setNewEvent({...newEvent, Title:e.target.value})} required data-testid="input-event-title"/>
        
        <select className={INPUT_CLASS} value={newEvent.ElectionType} onChange={e=>setNewEvent({...newEvent, ElectionType:e.target.value})} data-testid="select-election-type">
          <option value="Single">Single Vote (One Winner)</option>
          <option value="MultiVote">MultiVote (Multiple Choices)</option>
          <option value="Rank">Ranked Choice (Lower Score Wins)</option>
        </select>
        
        <textarea className={`${INPUT_CLASS} md:col-span-2 lg:col-span-3`} rows="3" placeholder="Description of the event, rules, and eligibility (optional)" value={newEvent.Description} onChange={e=>setNewEvent({...newEvent, Description:e.target.value})} data-testid="textarea-event-description"/>
        
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Registration End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.RegEndTime} onChange={e=>setNewEvent({...newEvent, RegEndTime:e.target.value})} required data-testid="input-reg-end-time"/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote Start Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteStartTime} onChange={e=>setNewEvent({...newEvent, VoteStartTime:e.target.value})} required data-testid="input-vote-start-time"/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteEndTime} onChange={e=>setNewEvent({...newEvent, VoteEndTime:e.target.value})} required data-testid="input-vote-end-time"/>
        </label>

        <div className="lg:col-span-3">
          <label className={`block text-sm ${TEXT_SECONDARY} font-medium mb-2`}>Ballot Images (For Nominee Selection) - Max 10</label>
          <input type="file" multiple onChange={e=>setBallotFiles(Array.from(e.target.files))} className={`${INPUT_CLASS.replace('p-3','p-2')} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600`} data-testid="input-ballot-files"/>
          <p className={`text-xs ${TEXT_SECONDARY} mt-1`}>Selected files: {ballotFiles.length}</p>
        </div>

        <div>
          <label className={`text-sm font-semibold ${TEXT_PRIMARY}`}>Voting Mode</label>
          <select value={newEvent.votingMode} onChange={(e)=>setNewEvent(ne=>({...ne, votingMode:e.target.value}))} className={INPUT_CLASS} data-testid="select-voting-mode">
            <option value="online">Online (email code)</option>
            <option value="onCampus">On-Campus (rotating code)</option>
          </select>
        </div>
        {newEvent.votingMode === 'onCampus' && (
          <div>
            <label className={`text-sm font-semibold ${TEXT_PRIMARY}`}>Code Rotation Minutes</label>
            <input type="number" min={1} value={newEvent.codeRotationMinutes} onChange={(e)=>setNewEvent(ne=>({...ne, codeRotationMinutes: Number(e.target.value)||15}))} className={INPUT_CLASS} data-testid="input-code-rotation"/>
          </div>
        )}

        <div className="lg:col-span-3 pt-4">
          <button 
            type="submit"
            className={`px-6 py-3 rounded-lg font-bold text-base ${BTN_PRIMARY} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isCreating}
            data-testid="button-launch-event"
          >
            {isCreating ? 'CREATING EVENT...' : 'LAUNCH EVENT'}
          </button>
        </div>
      </form>
    </div>
  )

  const renderEventListView = (title) => (
    <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
      <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
        {title} ({currentEventsList.length})
      </h2>
      <div className="space-y-4">
        {currentEventsList.length === 0 ? (
          <div className={`text-center p-8 rounded-xl ${BG_DARK_CARD} ${TEXT_SECONDARY} border border-gray-200 dark:border-gray-700 shadow-inner`}>
            No {title.toLowerCase()} found at this time.
          </div>
        ) : (
          currentEventsList.map(ev => (
            <EventListItem
              key={ev._id}
              event={ev}
              onClick={() => handleEventSelection(ev)} 
              isActive={activeEvent?._id === ev._id}
            />
          ))
        )}
      </div>
    </div>
  )

  const renderActiveEventDetail = () => {
    if (!activeEvent) {
      return (
        <div className={`p-12 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700 text-center ${TEXT_SECONDARY}`}>
          <h3 className={`text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>Select an Event</h3>
          <p>Choose an event from the sidebar list to view live results, monitor voters, and approve nominees.</p>
        </div>
      )
    }

    if (loadingEvent) {
      return (
        <div className={`p-12 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700 text-center ${TEXT_PRIMARY}`}>
          <div className="text-xl font-semibold animate-pulse">Loading Event Data...</div>
        </div>
      )
    }

    const eventStatus = activeEvent.status;
    const isRanked = activeEvent.ElectionType === 'Rank';
    const mainColsClass = `grid lg:grid-cols-${isRanked ? 3 : 2} gap-6`;

    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
          <h3 className={`text-3xl font-extrabold ${ACCENT_PRIMARY_TEXT}`}>{activeEvent.Title}</h3>
          <p className={`${TEXT_SECONDARY} text-sm mt-1`}>Type: {activeEvent.ElectionType} | Status: <span className="font-bold">{eventStatus?.toUpperCase()}</span></p>
          {eventStatus === 'registration' && (
            <div className={`mt-1 text-xs font-mono ${ACCENT_WARNING}`}>Registration ends in: <span className="font-bold">{timeLeft(activeEvent.RegEndTime)}</span></div>
          )}
          {eventStatus === 'waiting' && (
            <div className={`mt-1 text-xs font-mono ${ACCENT_WARNING}`}>Voting starts in: <span className="font-bold">{timeLeft(activeEvent.VoteStartTime)}</span></div>
          )}
          {eventStatus === 'voting' && (
            <div className={`mt-1 text-xs font-mono ${ACCENT_VIOLET}`}>Voting ends in: <span className="font-bold">{timeLeft(activeEvent.VoteEndTime)}</span></div>
          )}
          {eventStatus === 'finished' && (
            <div className={`mt-1 text-xs font-mono ${ACCENT_SUCCESS}`}>Finished: {new Date(activeEvent.VoteEndTime).toLocaleString()}</div>
          )}
        </div>

        {eventStatus !== 'finished' && renderTimeEditor()}

        {renderOnCampusAdminPanel()}

        <div className={mainColsClass}>
          <div className={`lg:col-span-${isRanked ? 2 : 1} space-y-6`}>
            
            {eventStatus !== 'finished' && (
              <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                <h4 className={`font-bold text-xl ${ACCENT_WARNING} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                  Pending Nominees ({pending.length})
                </h4>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {pending.map(p => {
                    const id = p.UserID?._id || p.UserID
                    return (
                      <div key={id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                        <div className="flex items-center gap-3">
                          <img src={p.UserID?.ProfileImage || 'https://placehold.co/40x40/d1d5db/4b5563?text=U'} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                          <div>
                            <div className="text-sm font-semibold">{p.UserID?.FullName || id}</div>
                            <div className={`text-xs ${TEXT_SECONDARY}`}>@{p.UserID?.UserName}</div>
                          </div>
                        </div>
                        <button onClick={()=>onApprove(id)} className={`px-4 py-2 text-xs font-semibold rounded-lg ${BTN_PRIMARY}`} data-testid={`button-approve-${id}`}>
                          Approve
                        </button>
                      </div>
                    )
                  })}
                  {pending.length===0 && <div className={`text-sm ${TEXT_SECONDARY} p-3 text-center`}>No pending nominees for this event.</div>}
                </div>
              </div>
            )}
            
            <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
              <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                Registered Voters ({voters.length})
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {voters.map(v => (
                  <div key={v.UserID?._id || v.UserID} className={`flex items-center gap-3 text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                    <img src={v.UserID?.ProfileImage || 'https://placehold.co/32x32/d1d5db/4b5563?text=V'} className="w-8 h-8 rounded-full object-cover" alt="Voter Profile"/>
                    <span className="font-medium">{v.UserID?.FullName || v.UserID}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
              <h4 className={`font-bold text-xl ${ACCENT_SUCCESS} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                Registered Nominees ({nominees.length})
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {nominees.map(n => (
                  <div key={n.UserID?._id || n.UserID} className={`flex items-center gap-3 text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                    <img src={n.UserID?.ProfileImage || 'https://placehold.co/32x32/d1d5db/4b5563?text=N'} className="w-8 h-8 rounded-full object-cover" alt="Nominee Profile"/>
                    <div className="flex-1">
                      <div className="font-medium">{n.UserID?.FullName || n.UserID}</div>
                      <div className={`text-xs ${TEXT_SECONDARY}`}>{n.Description || 'No description'}</div>
                    </div>
                  </div>
                ))}
                {nominees.length === 0 && <div className={`text-sm ${TEXT_SECONDARY} p-3 text-center`}>No registered nominees for this event.</div>}
              </div>
            </div>
          </div>

          {(eventStatus === 'voting' || eventStatus === 'finished') && (
            <div className={`lg:col-span-${isRanked ? 1 : 1} space-y-6`}> 

              {activeEvent.ElectionType !== 'Rank' && (
                <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                  <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                    Live Tally (Votes) 
                  </h4>
                  <div className="h-64 flex justify-center items-center">
                    <Bar data={voteTallyData} options={commonChartOptions} />
                  </div>
                </div>
              )}
              
              {activeEvent.ElectionType !== 'Rank' && (
                <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                  <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                    Vote Counts
                  </h4>
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {counts.simple.sort((a,b)=>b.TotalVote-a.TotalVote).map(v => (
                      <li key={v.NomineeID} className={`flex justify-between items-center p-2 rounded ${BG_DARK_CARD}`}>
                        <span className={`text-sm font-medium ${TEXT_PRIMARY}`}>{v.NomineeIDName || v.NomineeID}</span>
                        <span className={`text-base font-bold ${ACCENT_VIOLET}`}>{v.TotalVote} Votes</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeEvent.ElectionType === 'Rank' && (
                <>
                  <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                    <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                      Rank Score Distribution
                    </h4>
                    <div className="h-64 flex justify-center items-center">
                      <Doughnut data={doughnutData} options={{ ...commonChartOptions, cutout: '70%' }} />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                    <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                      Raw Rank Scores (Lower is Better)
                    </h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {counts.rank.sort((a,b)=>a.TotalRank-b.TotalRank).map(r => (
                        <li key={r.NomineeID} className={`flex justify-between items-center p-2 rounded ${BG_DARK_CARD}`}>
                          <span className={`text-sm font-medium ${TEXT_PRIMARY}`}>{r.NomineeIDName || r.NomineeID}</span>
                          <span className={`text-base font-bold ${ACCENT_VIOLET}`}>{r.TotalRank}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {(eventStatus !== 'voting' && eventStatus !== 'finished') && (
            <div className={`lg:col-span-${isRanked ? 1 : 1} p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700 text-center`}>
              <h4 className={`text-lg font-bold mb-3 ${ACCENT_WARNING}`}>Results Unavailable</h4>
              <p className={`text-sm ${TEXT_SECONDARY}`}>Live results are only displayed during the VOTING or FINISHED phase.</p>
              <p className={`text-sm font-mono mt-2 ${TEXT_SECONDARY}`}>Voting starts: {new Date(activeEvent.VoteStartTime).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-extrabold mb-4 text-[#1E3A8A] dark:text-[#3B82F6]">Event Posts (Admin Moderation)</h4>
          
          {campaignPosts.length === 0 && (
            <div className="text-center py-10 bg-gray-50 dark:bg-[#1A2129] rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
              No posts for this event yet.
            </div>
          )}

          <div className="space-y-5">
            {campaignPosts.map(p => (
              <AdminCampaignPost 
                key={p._id} 
                post={p} 
                onDeletePost={handleAdminDeletePost} 
                onDeleteComment={handleAdminDeleteComment}
                activeMenuPostId={activeMenuPostId}
                onToggleMenu={toggleMenu}
                expandedComments={expandedComments}
                onToggleComments={toggleComments}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderOnCampusAdminPanel = () => (
    activeEvent?.votingMode === 'onCampus' && activeEvent?.status === 'voting' ? (
      <div className={`p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-6`}>
        <h4 className={`font-bold text-lg ${ACCENT_PRIMARY_TEXT} mb-2`}>On-Campus Voting Code</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className={`text-sm ${TEXT_SECONDARY}`}>Current Code</div>
            <div className={`text-4xl tracking-widest font-extrabold ${ACCENT_VIOLET}`}>
              {codeInfo.code ? `${String(codeInfo.code).slice(0,3)} ${String(codeInfo.code).slice(3,6)}` : '—'}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className={`text-xs ${TEXT_SECONDARY}`}>Expires in:</span>
              <span className={`text-sm font-mono ${ACCENT_PRIMARY_TEXT}`}>{formatRemain(codeRemaining)}</span>
              {codeRemaining!=null && (
                <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-400 transition-all"
                                       style={{ width: codeInfo.expiresAt ? `${Math.max(0, Math.min(100, ((new Date(codeInfo.expiresAt).getTime() - Date.now()) / ((activeEvent.codeRotationMinutes||2)*60000)) * 100))}%` : '0%' }}
                  />
                </div>
              )}
            </div>
          </div>
          <button onClick={onRotateCode} disabled={isRotating} className={`px-4 py-2 rounded font-bold ${isRotating?'bg-gray-300 text-gray-600':'bg-blue-600 text-white hover:bg-blue-500'}`} data-testid="button-rotate-code">
            {isRotating?'Rotating...':'Rotate Code'}
          </button>
        </div>
      </div>
    ) : null
  )

  const renderActiveContent = () => {
    if (activeEvent) {
      return renderActiveEventDetail();
    }

    switch (activeView) {
      case NAV_ITEMS.CREATE:
        return renderCreateEventView();
      case NAV_ITEMS.RUNNING:
        return renderEventListView(NAV_ITEMS.RUNNING);
      case NAV_ITEMS.UPCOMING:
        return renderEventListView(NAV_ITEMS.UPCOMING);
      case NAV_ITEMS.PREVIOUS:
        return renderEventListView(NAV_ITEMS.PREVIOUS);
      case NAV_ITEMS.DASHBOARD:
      default:
        return renderDashboardView();
    }
  };

  const renderTimeEditor = () => (
    <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
      <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4`}>Adjust Event Times (Minutes Delta)</h4>
      <p className={`text-xs ${TEXT_SECONDARY} mb-4`}>Enter minutes to extend (+) or shorten (-) each phase relative to current times.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Reg End Delta (min)
          <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.RegEndDelta||''} onChange={e=>setEditTimes({...editTimes, RegEndDelta:e.target.value})} placeholder="e.g. 5" data-testid="input-reg-end-delta"/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote Start Delta (min)
          <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.VoteStartDelta||''} onChange={e=>setEditTimes({...editTimes, VoteStartDelta:e.target.value})} placeholder="e.g. -3" data-testid="input-vote-start-delta"/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote End Delta (min)
          <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.VoteEndDelta||''} onChange={e=>setEditTimes({...editTimes, VoteEndDelta:e.target.value})} placeholder="e.g. 10" data-testid="input-vote-end-delta"/>
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={onApplyDeltas} disabled={savingTimes} className={`px-5 py-2 rounded font-bold ${savingTimes?'bg-gray-300 text-gray-600':'bg-green-600 text-white hover:bg-green-500'}`} data-testid="button-apply-deltas">
          {savingTimes?'Applying...':'Apply Minutes Changes'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 h-screen overflow-hidden ${BG_BODY} ${TEXT_PRIMARY} font-sans flex flex-col lg:flex-row`}>
      
      <aside className={`w-full lg:w-72 ${BG_SIDEBAR} shadow-xl lg:shadow-2xl p-6 lg:h-screen lg:overflow-y-auto border-r border-gray-200 dark:border-gray-700/50 flex-shrink-0`}>
        
        <div className="flex items-center mb-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <span 
            className={`text-2xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r 
                from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-400`}
          >
            E-VoteHub Admin
          </span>
        </div>

        <nav className="space-y-2">
          <NavItem 
            icon={DashboardIcon} 
            label={NAV_ITEMS.DASHBOARD} 
            isActive={activeView === NAV_ITEMS.DASHBOARD && !activeEvent}
            onClick={() => handleNavigation(NAV_ITEMS.DASHBOARD)}
          />
          <NavItem 
            icon={CreateIcon} 
            label={NAV_ITEMS.CREATE} 
            isActive={activeView === NAV_ITEMS.CREATE && !activeEvent}
            onClick={() => handleNavigation(NAV_ITEMS.CREATE)}
          />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <h4 className={`text-xs ${TEXT_SECONDARY} uppercase font-semibold tracking-wider px-4 mb-2`}>Event Management</h4>
          <NavItem 
            icon={RunningIcon} 
            label={NAV_ITEMS.RUNNING} 
            isActive={activeView === NAV_ITEMS.RUNNING}
            onClick={() => handleNavigation(NAV_ITEMS.RUNNING)}
          />
          <NavItem 
            icon={UpcomingIcon} 
            label={NAV_ITEMS.UPCOMING} 
            isActive={activeView === NAV_ITEMS.UPCOMING}
            onClick={() => handleNavigation(NAV_ITEMS.UPCOMING)}
          />
          <NavItem 
            icon={PreviousIcon} 
            label={NAV_ITEMS.PREVIOUS} 
            isActive={activeView === NAV_ITEMS.PREVIOUS}
            onClick={() => handleNavigation(NAV_ITEMS.PREVIOUS)}
          />
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => Swal.fire({title: 'Logout', text: 'Please use the main logout button in the top navigation', icon: 'info', confirmButtonText: 'OK', background: 'rgb(225, 247, 56)', color: 'rgb(255, 255, 255)'})} 
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[#DC2626] text-white hover:bg-red-500 font-semibold shadow-md shadow-red-900/40`}
            data-testid="button-logout"
          >
            <LogoutIcon className="mr-3"/>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:h-screen lg:overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeEvent && (
            <button 
              onClick={() => setActiveEvent(null)} 
              className={`mb-6 text-sm ${ACCENT_PRIMARY_TEXT} hover:underline flex items-center`}
              data-testid="button-back-to-list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
              Back to {activeView} List
            </button>
          )}
          {renderActiveContent()}
        </div>
      </main>
      </div>
      <Footer />
    </div>
  )
}