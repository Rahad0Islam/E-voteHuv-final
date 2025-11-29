import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { listEvents, countVote, getPendingNominees, approveNominee, createEvent, api as apiClient, listCampaignPosts, deleteCampaignPost, deleteCampaignComment, rotateOnCampusCode, updateEventTimes, addBallotImages, getNominees, removeVoter, removeNominee, unapproveNominee } from '../lib/api'
import { getVoters } from '../lib/votersApi'
import { io } from 'socket.io-client'
import { Bar, Doughnut } from 'react-chartjs-2' // Keep Bar and Doughnut for now, but Bar will be used for Live Tally
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

// Register all necessary components for both Bar (for tally) and Doughnut (for rank) charts
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title) 

// --- Color Palette Mapping (Copied from UserDashboard for consistency) ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

// Backgrounds
const BG_BODY = 'bg-[#ECEBEB] dark:bg-[#1A2129]' 
const BG_SIDEBAR = 'bg-white dark:bg-[#111827]'
const BG_CARD = 'bg-white dark:bg-[#111827]'
const BG_DARK_CARD = 'bg-gray-100 dark:bg-[#111827]'

// Text colors
const TEXT_PRIMARY = 'text-gray-900 dark:text-white'
const TEXT_SECONDARY = 'text-gray-600 dark:text-slate-400'
const ACCENT_PRIMARY_TEXT = `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`
const ACCENT_SUCCESS = 'text-[#10B981] dark:text-[#10B981]'
const ACCENT_WARNING = 'text-[#F59E0B] dark:text-[#F59E0B]'
const ACCENT_ERROR = 'text-[#DC2626] dark:text-[#DC2626]'
const ACCENT_VIOLET = 'text-violet-600 dark:text-violet-400'

// --- CHART SEGMENT COLORS ---
// Updated per user request: Purple for light, Light Gray for dark
const CHART_LIGHT_PURPLE = '#9333EA'; // Violet-700
const CHART_DARK_GRAY = '#E5E7EB'; // Gray-200

// Button/Interactive elements
const BTN_PRIMARY = `bg-[${ACCENT_PRIMARY_HEX}] text-white hover:bg-[${ACCENT_SECONDARY_HEX}] transition duration-200 shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40`
const INPUT_CLASS = `w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 ${BG_CARD} ${TEXT_PRIMARY} placeholder-gray-500 focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}] outline-none transition duration-150`

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'


// --- Constants for Sidebar Navigation ---
const NAV_ITEMS = {
  DASHBOARD: 'Overview Dashboard',
  CREATE: 'Create New Event',
  RUNNING: 'Voting Live Events',
  UPCOMING: 'Upcoming Events',
  PREVIOUS: 'Finished Events',
}

// --- Icons (Copied from UserDashboard for consistency) ---
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


// --- Helper Components ---

// Sidebar Navigation Item
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

// Helper component for styled metric boxes 
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

// Event List Item for selection
const EventListItem = ({ event, onClick, isActive }) => {
  let statusClass = ACCENT_PRIMARY_TEXT; 
  let statusDetail = 'Registration Open';
  let statusSymbol = '✍️'; 

  // Derive status based on event phase
  if (new Date(event.VoteEndTime).getTime() <= new Date().getTime()) {
    event.status = 'finished';
    statusClass = ACCENT_SUCCESS;
    statusDetail = 'Finished';
    statusSymbol = '🏆';
  } else if (new Date(event.VoteStartTime).getTime() <= new Date().getTime()) {
    event.status = 'voting';
    statusClass = ACCENT_VIOLET;
    statusDetail = 'Voting Live';
    statusSymbol = '🗳️';
  } else if (new Date(event.RegEndTime).getTime() <= new Date().getTime()) {
    event.status = 'waiting';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Waiting to Vote';
    statusSymbol = '⏳';
  } else {
    event.status = 'registration';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Registration Open';
    statusSymbol = '✍️';
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


export default function AdminDashboard(){
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeView, setActiveView] = useState(NAV_ITEMS.DASHBOARD)
  const [counts, setCounts] = useState({ simple: [], rank: [] })
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [voters, setVoters] = useState([])

  // event creation state
  const [newEvent, setNewEvent] = useState({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single', votingMode:'online', codeRotationMinutes:15 })
  const [ballotFiles, setBallotFiles] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(false)

  // campaign posts state
  const [campaignPosts, setCampaignPosts] = useState([])

  // rotation code state
  const [isRotating, setIsRotating] = useState(false)
  const [codeInfo, setCodeInfo] = useState({ code: '', expiresAt: null })
  const [codeRemaining, setCodeRemaining] = useState(null)

  // time editing state
  const [editTimes, setEditTimes] = useState({ RegEndTime:'', VoteStartTime:'', VoteEndTime:'' })
  const [savingTimes, setSavingTimes] = useState(false)

  // current time for countdowns
  const [now, setNow] = useState(()=> new Date())
  useEffect(()=>{ const id = setInterval(()=> setNow(new Date()), 1000); return ()=> clearInterval(id) },[])
  const timeLeft = (iso)=>{ const d=new Date(iso); if(isNaN(d.getTime())) return '00:00:00'; const t=d.getTime()-now.getTime(); if(t<=0) return '00:00:00'; const h=String(Math.floor(t/3600000)).padStart(2,'0'); const m=String(Math.floor((t%3600000)/60000)).padStart(2,'0'); const s=String(Math.floor((t%60000)/1000)).padStart(2,'0'); return `${h}:${m}:${s}` }

  // Initial fetch of all events
  useEffect(()=>{ listEvents().then(setEvents) },[])

  // --- Event Categorization ---
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


  // --- Active Event Live Data/Metrics Fetching ---
  useEffect(()=>{
    if(!activeEvent) return
    setLoadingEvent(true)
    setCounts({ simple: [], rank: [] })
    setPending([])
    setApproved([])
    setVoters([])
    setCampaignPosts([])
    const fetchEventData = async () => {
      try {
        const [c, p, a, v, posts] = await Promise.all([
          countVote(activeEvent._id).catch(()=>({ NomineeListForSingleAndMultiVote:[], NomineeListForRank:[] })),
          getPendingNominees(activeEvent._id).catch(()=>[]),
          getNominees(activeEvent._id).catch(()=>[]),
          getVoters(activeEvent._id).catch(()=>[]),
          listCampaignPosts(activeEvent._id).catch(()=>[])
        ])
        setCounts({ simple: c.NomineeListForSingleAndMultiVote||[], rank: c.NomineeListForRank||[] })
        setPending(p)
        setApproved(a)
        setVoters(v)
        setCampaignPosts(posts)
      } catch(e){ console.error('Fetch event data failed', e) } finally { setLoadingEvent(false) }
    }
    fetchEventData()

    // Setup Socket IO for real-time updates (only if voting is live)
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
            const a = await getNominees(activeEvent._id)
            setApproved(a)
          }catch(err){ console.error("Socket vote update failed:", err) }
        }
      })
    }

    return ()=>{ 
        if(s){ s.emit('leaveEvent', activeEvent._id); s.disconnect() }
    }
  },[activeEvent])

  // --- Code Info Fetching and Timer ---
  const fetchCodeInfo = useCallback(async ()=>{
    if(!activeEvent || activeEvent.votingMode !== 'onCampus' || activeEvent.status !== 'voting') return
    try{
      const res = await apiClient.get('/api/V1/admin/getCurrentVoteCode', { params: { EventID: activeEvent._id } })
      const d = res.data?.data || {}
      setCodeInfo({ code: d.currentVoteCode || '', expiresAt: d.currentCodeExpiresAt || null })
    }catch(e){ /* ignore */ }
  }, [activeEvent])

  // Periodic refresh of code info when an onCampus event is active AND in voting phase
  useEffect(()=>{
    let timer
    fetchCodeInfo()
    if(activeEvent?.votingMode === 'onCampus' && activeEvent?.status === 'voting'){
      timer = setInterval(fetchCodeInfo, 30000) // refresh every 30s during voting
    }
    return ()=>{ if(timer) clearInterval(timer) }
  }, [activeEvent, fetchCodeInfo])

  // 1-second countdown timer and auto-refresh on expiry (only during voting)
  useEffect(()=>{
    if(!activeEvent || activeEvent.votingMode !== 'onCampus' || activeEvent.status !== 'voting' || !codeInfo.expiresAt) { setCodeRemaining(null); return }
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
  }, [activeEvent, codeInfo.expiresAt, fetchCodeInfo])

  const formatRemain = (s)=>{
    if(s==null) return '—'
    const mm = String(Math.floor(s/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${mm}:${ss}`
  }

  const onRotateCode = useCallback(async ()=>{
    if(!activeEvent) return
    try{
      setIsRotating(true)
      await rotateOnCampusCode(activeEvent._id)
      await fetchCodeInfo()
      alert('Code rotated')
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to rotate code')
    }finally{
      setIsRotating(false)
    }
  }, [activeEvent, fetchCodeInfo])


  // --- Handlers ---
  const handleNavigation = useCallback((view) => {
    setActiveView(view)
    setActiveEvent(null) // Deselect event when navigating away from event list
  }, [])

  const handleEventSelection = useCallback((event) => {
    setActiveView(NAV_ITEMS.RUNNING) // Force to one of the list views on selection
    setActiveEvent(event)
  }, [])

  const onApprove = async (uid)=>{
    try{
      await approveNominee({ EventID: activeEvent._id, NomineeID: uid })
      setPending(p => p.filter(x => (x.UserID?._id || x.UserID) !== uid))
      const a = await getNominees(activeEvent._id)
      setApproved(a)
    }catch(err){ alert(err?.response?.data?.message || 'Approval failed') }
  }

  const onCreateEvent = async (e)=>{
    e.preventDefault()
    setIsCreating(true)
    try{
      await createEvent({ ...newEvent, BallotImageFiles: ballotFiles })
      alert('Event created successfully!')
      setNewEvent({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single', votingMode:'online', codeRotationMinutes:15 })
      setBallotFiles([])
      
      const updated = await listEvents()
      setEvents(updated)
      setActiveView(NAV_ITEMS.DASHBOARD) // Navigate back to dashboard after creation
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to create event')
    }finally{
      setIsCreating(false)
    }
  }

  // Load initial times for the active event into the editor state
  useEffect(()=>{
    if(!activeEvent) return
    setEditTimes({
      RegEndTime: activeEvent.RegEndTime ? new Date(activeEvent.RegEndTime).toISOString().slice(0,16) : '',
      VoteStartTime: activeEvent.VoteStartTime ? new Date(activeEvent.VoteStartTime).toISOString().slice(0,16) : '',
      VoteEndTime: activeEvent.VoteEndTime ? new Date(activeEvent.VoteEndTime).toISOString().slice(0,16) : '',
    })
  },[activeEvent])

  const onSaveTimes = async ()=>{
    if(!activeEvent) return
    try{
      setSavingTimes(true)
      await updateEventTimes({ EventID: activeEvent._id, ...editTimes })
      alert('Event times updated')
      const refreshed = await listEvents()
      setEvents(refreshed)
      const updated = refreshed.find(e=>e._id===activeEvent._id)
      if(updated) setActiveEvent(updated)
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to update times')
    }finally{ setSavingTimes(false) }
  }

  const onApplyDeltas = async () => {
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
      alert('Event times updated')
      const refreshed = await listEvents()
      setEvents(refreshed)
      const updated = refreshed.find(e=>e._id===activeEvent._id)
      if(updated) setActiveEvent(updated)
      setEditTimes({ RegEndDelta:'', VoteStartDelta:'', VoteEndDelta:'' })
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to apply changes')
    }finally{ setSavingTimes(false) }
  }

  // Hook to get the current mode for chart text color
  const chartTextColor = useMemo(() => {
    // Check if the HTML element has 'dark' class (Tailwind/DaisyUI) or if system prefers dark mode
    if (document.documentElement.classList.contains('dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'white';
    }
    // Default for light mode - using a slightly off-black for better visibility on white backgrounds
    return '#333'; 
  }, [activeEvent]);


  // --- Chart Data Memoization ---
  // MODIFIED: Configuration for a Bar Chart with requested colors
  const voteTallyData = useMemo(()=>{
    const labels = counts.simple.map(x=>x.NomineeIDName || x.NomineeID)
    
    // Determine the bar color based on the current mode
    // Light Mode: Purple, Dark Mode: Light Gray
    const barColor = chartTextColor === 'white' ? CHART_DARK_GRAY : CHART_LIGHT_PURPLE;

    return {
      labels,
      datasets: [{
        label: 'Total Votes',
        data: counts.simple.map(x=>x.TotalVote),
        // Apply mode-dependent bar color
        backgroundColor: barColor, 
        // Optional: Border color for the bars
        borderColor: barColor,
        borderWidth: 1,
        // Set bar percentage to make bars thinner (optional styling)
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      }]
    }
  },[counts, chartTextColor]) 

  // Doughnut data for Rank (Unchanged)
  const doughnutData = useMemo(()=>{
    const labels = counts.rank.map(x=>x.NomineeIDName || x.NomineeID)
    return {
      labels,
      datasets: [{
        label: 'Total Rank (Lower is Better)',
        data: counts.rank.map(x=>x.TotalRank),
        // Use a set of harmonious colors
        backgroundColor: ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'] // Blue, Green, Yellow, Violet, Red
      }]
    }
  },[counts])

  // Common options for charts
  const commonChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: false, // Title is added externally
            color: chartTextColor // Explicitly set title color
        },
        legend: {
            display: false, // Hide legend for the simple bar/doughnut chart
            // Removed: labels: { color: chartTextColor } - Let Chart.js default the legend text color
        },
        // Removed: Custom Tooltip Colors - Let Chart.js default tooltip appearance
    },
    // Axes configuration specific to Bar Chart - FIX APPLIED HERE for bar texts/grid lines
    scales: {
        x: {
            grid: {
                // Adjust grid line color based on theme. Lighter gray in light mode, dark gray in dark mode.
                color: chartTextColor === 'white' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                borderColor: chartTextColor, // Axis line color set to text color
                drawOnChartArea: true // Ensure grid lines are visible
            },
            ticks: {
                color: chartTextColor // X-axis label color (set to #333 in light mode)
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                // Adjust grid line color based on theme
                color: chartTextColor === 'white' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                borderColor: chartTextColor, // Axis line color set to text color
                drawOnChartArea: true
            },
            ticks: {
                color: chartTextColor // Y-axis label color (set to #333 in light mode)
            }
        }
    }
  }), [chartTextColor]);


  // --- Rendering Functions ---

  const renderDashboardView = () => (
    <>
      <h2 className={`text-5xl font-extrabold ${TEXT_PRIMARY} mb-10 flex items-center`}>
        <span className={`mr-4 text-6xl ${ACCENT_PRIMARY_TEXT}`}>📊</span>
        Admin Control Dashboard
      </h2>
      
      {/* Metric Boxes */}
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
      {/* Event creation form */}
      <form onSubmit={onCreateEvent} className={`p-6 rounded-xl ${BG_CARD} shadow-md border border-gray-200 dark:border-gray-700 space-y-4`}>
        {/* Title */}
        <input className={`${INPUT_CLASS} lg:col-span-2`} placeholder="Event Title (e.g., Annual Board Election)" value={newEvent.Title} onChange={e=>setNewEvent({...newEvent, Title:e.target.value})} required/>
        
        {/* Election Type */}
        <select className={INPUT_CLASS} value={newEvent.ElectionType} onChange={e=>setNewEvent({...newEvent, ElectionType:e.target.value})}>
          <option value="Single">Single Vote (One Winner)</option>
          <option value="MultiVote">MultiVote (Multiple Choices)</option>
          <option value="Rank">Ranked Choice (Lower Score Wins)</option>
        </select>
        
        {/* Description */}
        <textarea className={`${INPUT_CLASS} md:col-span-2 lg:col-span-3`} rows="3" placeholder="Description of the event, rules, and eligibility (optional)" value={newEvent.Description} onChange={e=>setNewEvent({...newEvent, Description:e.target.value})} />
        
        {/* Date/Time Pickers */}
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Registration End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.RegEndTime} onChange={e=>setNewEvent({...newEvent, RegEndTime:e.target.value})} required/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote Start Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteStartTime} onChange={e=>setNewEvent({...newEvent, VoteStartTime:e.target.value})} required/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteEndTime} onChange={e=>setNewEvent({...newEvent, VoteEndTime:e.target.value})} required/>
        </label>

        {/* Ballot Images */}
        <div className="lg:col-span-3">
          <label className={`block text-sm ${TEXT_SECONDARY} font-medium mb-2`}>Ballot Images (For Nominee Selection) - Max 10</label>
          <input type="file" multiple onChange={handleBallotFilesChange} className={`${INPUT_CLASS.replace('p-3','p-2')} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600`} />
          <p className={`text-xs ${TEXT_SECONDARY} mt-1`}>Selected files: {ballotFiles.length}</p>
        </div>

        {/* Voting Mode */}
        <div>
          <label className={`text-sm font-semibold ${TEXT_PRIMARY}`}>Voting Mode</label>
          <select value={newEvent.votingMode} onChange={(e)=>setNewEvent(ne=>({...ne, votingMode:e.target.value}))} className={INPUT_CLASS}>
            <option value="online">Online (email code)</option>
            <option value="onCampus">On-Campus (rotating code)</option>
          </select>
        </div>
        {newEvent.votingMode === 'onCampus' && (
          <div>
            <label className={`text-sm font-semibold ${TEXT_PRIMARY}`}>Code Rotation Minutes</label>
            <input type="number" min={1} value={newEvent.codeRotationMinutes} onChange={(e)=>setNewEvent(ne=>({...ne, codeRotationMinutes: Number(e.target.value)||15}))} className={INPUT_CLASS} />
          </div>
        )}

        {/* Submit Button */}
        <div className="lg:col-span-3 pt-4">
          <button 
            type="submit"
            className={`px-6 py-3 rounded-lg font-bold text-base ${BTN_PRIMARY} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isCreating}
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
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {currentEventsList.length === 0 ? (
                // This section uses BG_DARK_CARD, which is now fixed in the color map
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

  const handleAdminDeletePost = async (postID) => {
    if(!activeEvent) return
    if(!confirm('Delete this post?')) return
    try{
      await deleteCampaignPost({ eventID: activeEvent._id, postID })
      setCampaignPosts(p=> p.filter(x=> x._id!==postID))
    }catch(err){ alert(err?.response?.data?.message || 'Delete failed') }
  }

  const handleAdminDeleteComment = async (postID, commentID) => {
    if(!activeEvent) return
    if(!confirm('Delete this comment?')) return
    try{
      await deleteCampaignComment({ eventID: activeEvent._id, commentID })
      setCampaignPosts(p=> p.map(x=> x._id===postID ? { ...x, comments: (x.comments||[]).filter(c=> c._id!==commentID) } : x ))
    }catch(err){ alert(err?.response?.data?.message || 'Delete failed') }
  }

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

    const eventStatus = activeEvent.status; // status is set in EventListItem
    const isRanked = activeEvent.ElectionType === 'Rank';
    const mainColsClass = `grid lg:grid-cols-${isRanked ? 3 : 2} gap-6`;

    return (
      <div className="space-y-6">
        {/* Event Header */}
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
          <h3 className={`text-3xl font-extrabold ${ACCENT_PRIMARY_TEXT}`}>{activeEvent.Title}</h3>
          <p className={`${TEXT_SECONDARY} text-sm mt-1`}>Type: {activeEvent.ElectionType} | Status: <span className="font-bold">{eventStatus.toUpperCase()}</span></p>
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

        {/* Time Editor */}
        {eventStatus !== 'finished' && renderTimeEditor()}

        {/* On-Campus Code Panel */}
        {renderOnCampusAdminPanel()}

        {/* Nominee Approval / Voters / Live Results - Conditional Layout */}
        <div className={mainColsClass}>

            {/* Column 1 & 2: Nominee Approval / Voters */}
            <div className={`lg:col-span-${isRanked ? 2 : 1} space-y-6`}>
                
                {/* Approved Nominees Panel */}
                <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                  <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                    <span className="mr-2">✅</span> Approved Nominees ({approved.length})
                  </h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {approved.map(n => {
                      const id = n.UserID?._id || n.UserID
                      return (
                        <div key={id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                          <div className="flex items-center gap-3 cursor-pointer" onClick={()=> openProfile(n.UserID, n.Description)}>
                            <img src={n.UserID?.ProfileImage || 'https://placehold.co/40x40/d1d5db/4b5563?text=N'} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="text-sm font-semibold">{n.UserID?.FullName || id}</div>
                              <div className={`text-xs ${TEXT_SECONDARY}`}>@{n.UserID?.UserName}</div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={()=> onUnapprove(id)} className={`px-3 py-1 text-[10px] rounded bg-yellow-500 hover:bg-yellow-600 text-white font-semibold`}>Unapprove</button>
                            <button onClick={()=> onRemoveNominee(id)} className={`px-3 py-1 text-[10px] rounded bg-red-600 hover:bg-red-700 text-white font-semibold`}>Remove</button>
                          </div>
                        </div>
                      )
                    })}
                    {approved.length===0 && <div className={`text-sm ${TEXT_SECONDARY} p-3 text-center`}>No approved nominees yet.</div>}
                  </div>
                </div>

                {/* Pending Nominees (Only relevant during registration/waiting) */}
                {eventStatus !== 'finished' && (
                    <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                        <h4 className={`font-bold text-xl ${ACCENT_WARNING} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                            <span className="mr-2">🚨</span> Pending Nominees ({pending.length})
                        </h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {pending.map(p => {
                                const id = p.UserID?._id || p.UserID
                                return (
                                // This element uses BG_DARK_CARD, which is now fixed
                                <div key={id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={p.UserID?.ProfileImage || 'https://placehold.co/40x40/d1d5db/4b5563?text=U'} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                                        <div>
                                            <div className="text-sm font-semibold">{p.UserID?.FullName || id}</div>
                                            <div className={`text-xs ${TEXT_SECONDARY}`}>@{p.UserID?.UserName}</div>
                                        </div>
                                    </div>
                                    <button onClick={()=>onApprove(id)} className={`px-4 py-2 text-xs font-semibold rounded-lg ${BTN_PRIMARY}`}>
                                        Approve
                                    </button>
                                </div>
                                )
                            })}
                            {pending.length===0 && <div className={`text-sm ${TEXT_SECONDARY} p-3 text-center`}>No pending nominees for this event.</div>}
                        </div>
                    </div>
                )}
                
                {/* Registered Voters (Always visible) */}
                <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                    <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                        <span className="mr-2">👥</span> Registered Voters ({voters.length})
                    </h4>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {voters.map(v => {
                          const uid = v.UserID?._id || v.UserID
                          return (
                            <div key={uid} className={`flex items-center justify-between gap-3 text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                                <div className="flex items-center gap-3 cursor-pointer" onClick={()=>openProfile(v.UserID)}>
                                  <img src={v.UserID?.ProfileImage || 'https://placehold.co/32x32/d1d5db/4b5563?text=V'} className="w-8 h-8 rounded-full object-cover" alt="Voter Profile"/>
                                  <span className="font-medium">{v.UserID?.FullName || uid}</span>
                                </div>
                                <button onClick={()=>handleRemoveVoter(uid)} className="text-[10px] px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">Remove</button>
                            </div>
                          )
                        })}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(eventStatus === 'voting' || eventStatus === 'finished') && (
                // This container spans the remaining column space (1 column for non-Rank, 1 column for Rank)
                <div className={`lg:col-span-${isRanked ? 1 : 1} space-y-6`}> 

                    {/* BAR CHART for Live Tally (Single/MultiVote) */}
                    {activeEvent.ElectionType !== 'Rank' && (
                        <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                            <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                                Live Tally (Votes) 
                            </h4>
                            <div className="h-64 flex justify-center items-center">
                                {/* Using the Bar chart component */}
                                <Bar
                                    data={voteTallyData} 
                                    options={commonChartOptions} 
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Vote Count List for Single/MultiVote */}
                    {activeEvent.ElectionType !== 'Rank' && (
                        <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                            <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                                Vote Counts
                            </h4>
                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {/* Sort by vote count descending */}
                                {counts.simple.sort((a,b)=>b.TotalVote-a.TotalVote).map(v => (
                                    <li key={v.NomineeID} className={`flex justify-between items-center p-2 rounded ${BG_DARK_CARD}`}>
                                        <span className={`text-sm font-medium ${TEXT_PRIMARY}`}>{v.NomineeIDName || v.NomineeID}</span>
                                        <span className={`text-base font-bold ${ACCENT_VIOLET}`}>{v.TotalVote} Votes</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                    {/* Rank Charts and List */}
                    {activeEvent.ElectionType === 'Rank' && (
                        <>
                            <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                                <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                                    Rank Score Distribution
                                </h4>
                                <div className="h-64 flex justify-center items-center">
                                    <Doughnut 
                                        data={doughnutData} 
                                        options={{ ...commonChartOptions, cutout: '70%' }} // Add cutout for Doughnut
                                    />
                                </div>
                            </div>
                            
                            <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                                <h4 className={`text-lg font-bold mb-3`} style={{color: chartTextColor === 'white' ? ACCENT_VIOLET : ACCENT_PRIMARY_HEX}}>
                                    Raw Rank Scores (Lower is Better)
                                </h4>
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {counts.rank.sort((a,b)=>a.TotalRank-b.TotalRank).map(r => (
                                        // This element uses BG_DARK_CARD, which is now fixed
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

            {/* Show message if event is not in voting or finished phase */}
            {(eventStatus !== 'voting' && eventStatus !== 'finished') && (
                <div className={`lg:col-span-${isRanked ? 1 : 1} p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700 text-center`}>
                    <h4 className={`text-lg font-bold mb-3 ${ACCENT_WARNING}`}>Results Unavailable</h4>
                    <p className={`text-sm ${TEXT_SECONDARY}`}>Live results are only displayed during the **{eventStatus.toUpperCase()}** or **VOTING** phase.</p>
                    <p className={`text-sm font-mono mt-2 ${TEXT_SECONDARY}`}>Voting starts: {new Date(activeEvent.VoteStartTime).toLocaleString()}</p>
                </div>
            )}

        </div>

        {/* Campaign Posts Section - Admin Moderation */}
        <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-extrabold mb-4 text-[#1E3A8A] dark:text-[#3B82F6]">Event Posts (Admin Moderation)</h4>
          <div className="space-y-4">
            {campaignPosts.length===0 && (
              <div className="p-4 text-sm text-center rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">No posts for this event.</div>
            )}
            {campaignPosts.map(p => (
              <div key={p._id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img src={p.ownerDetails?.ProfileImage || 'https://placehold.co/40x40'} alt="owner" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-semibold">{p.ownerDetails?.FullName || 'User'}</div>
                      <div className="text-[10px] text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <button onClick={()=>handleAdminDeletePost(p._id)} className="text-[10px] px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">Delete</button>
                </div>
                {p.content && <p className="text-sm mb-3 whitespace-pre-line">{p.content}</p>}
                {(p.picture?.length>0 || p.video?.length>0) && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {p.picture?.map(img => (
                      <img key={img.publicId} src={img.url} className="w-full aspect-video object-cover rounded" />
                    ))}
                    {p.video?.map(v => (
                      <video key={v.publicId} src={v.url} controls className="w-full aspect-video rounded" />
                    ))}
                  </div>
                )}
                <div className="text-[10px] mb-2 flex gap-4">
                  <span>👍 {p.likes?.length||0}</span>
                  <span>👎 {p.dislikes?.length||0}</span>
                  <span>💬 {(p.comments||[]).length}</span>
                </div>
                <div className="space-y-2">
                  {(p.comments||[]).map(c => (
                    <div key={c._id} className="flex items-start gap-2">
                      <img src={c.ownerProfileImage || 'https://placehold.co/24x24'} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-[11px]">
                        <div className="font-semibold inline-block mr-1">{c.ownerName}</div>
                        <span className="break-words">{c.comment}</span>
                      </div>
                      <button onClick={()=>handleAdminDeleteComment(p._id,c._id)} className="text-[10px] px-1 py-0.5 rounded bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Admin code management panel inside active event view
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
          <button onClick={onRotateCode} disabled={isRotating} className={`px-4 py-2 rounded font-bold ${isRotating?'bg-gray-300 text-gray-600':'bg-blue-600 text-white hover:bg-blue-500'}`}>{isRotating?'Rotating...':'Rotate Code'}</button>
        </div>
      </div>
    ) : null
  )

  // --- Main Content Renderer ---
  const renderActiveContent = () => {
    if (activeEvent) {
        // If an event is selected, we render the detail view regardless of the sidebar's current category view.
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
    <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700 space-y-6`}>
      <div>
        <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4`}>Adjust Event Times (Minutes Delta)</h4>
        <p className={`text-xs ${TEXT_SECONDARY} mb-4`}>Enter minutes to extend (+) or shorten (-) each phase relative to current times.</p>
        <div className="grid md:grid-cols-3 gap-4">
          <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Reg End Δ (min)
            <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.RegEndDelta||''} onChange={e=>setEditTimes({...editTimes, RegEndDelta:e.target.value})} placeholder="e.g. 5" />
          </label>
          <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote Start Δ (min)
            <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.VoteStartDelta||''} onChange={e=>setEditTimes({...editTimes, VoteStartDelta:e.target.value})} placeholder="e.g. -3" />
          </label>
          <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote End Δ (min)
            <input type="number" className={`block mt-1 ${INPUT_CLASS}`} value={editTimes.VoteEndDelta||''} onChange={e=>setEditTimes({...editTimes, VoteEndDelta:e.target.value})} placeholder="e.g. 10" />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onApplyDeltas} disabled={savingTimes} className={`px-5 py-2 rounded font-bold ${savingTimes?'bg-gray-300 text-gray-600':'bg-green-600 text-white hover:bg-green-500'}`}>{savingTimes?'Applying...':'Apply Minutes Changes'}</button>
        </div>
      </div>
      {/* Append Ballot Images Section */}
      <div className={`p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden`}> 
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_30%_30%,#3B82F6,transparent_60%)]" />
        <h5 className={`font-bold text-lg mb-2 flex items-center gap-2 ${ACCENT_VIOLET}`}>
          <span>🖼️</span> Append Additional Ballot Images
        </h5>
        <p className={`text-xs ${TEXT_SECONDARY} mb-4 leading-relaxed`}>Upload extra ballot images if you need more options for nominees. Existing ballots remain untouched. Recommended aspect ratio: square.</p>
        <form onSubmit={onAppendBallots} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex-1">
              <div className={`rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center cursor-pointer hover:border-violet-500 dark:hover:border-violet-400 transition-colors`}> 
                <input type="file" multiple accept="image/*" onChange={handleAppendBallotsChange} className="hidden" id="appendBallotsInput" />
                <label htmlFor="appendBallotsInput" className="cursor-pointer block">
                  <div className={`text-sm font-semibold mb-1 ${ACCENT_VIOLET}`}>Select Images</div>
                  <div className={`text-[10px] ${TEXT_SECONDARY}`}>PNG / JPG / JPEG</div>
                  {appendBallotFiles.length>0 && <div className={`mt-2 text-xs font-mono ${TEXT_PRIMARY}`}>{appendBallotFiles.length} selected</div>}
                </label>
              </div>
            </label>
            <div className="flex flex-col justify-end gap-2">
              <button type="submit" disabled={isAppendingBallots || appendBallotFiles.length===0} className={`px-5 py-2 rounded-lg font-semibold text-sm ${BTN_PRIMARY} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}> 
                {isAppendingBallots ? <span className="animate-pulse">Uploading...</span> : <><span>➕</span> Add Ballot Images</>} 
              </button>
              {isAppendingBallots && <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"><div className="h-full bg-violet-600 dark:bg-violet-400 animate-[pulse_1.2s_linear_infinite]" style={{width:'100%'}}/></div>}
            </div>
          </div>
          {appendBallotFiles.length>0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {appendBallotFiles.map((f,i)=>{
                const url = URL.createObjectURL(f)
                return (
                  <div key={i} className="relative group">
                    <img src={url} alt="preview" className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                    <button type="button" onClick={()=> setAppendBallotFiles(arr=> arr.filter((_,idx)=> idx!==i))} className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                )
              })}
            </div>
          )}
        </form>
      </div>
    </div>
  )

  // Define handler for initial ballot file selection
  const [profileModal, setProfileModal] = useState({ open:false, user:null, description:'' })
  const openProfile = (user, description='') => setProfileModal({ open:true, user, description })
  const closeProfile = () => setProfileModal(m => ({ ...m, open:false }))
  const [appendBallotFiles, setAppendBallotFiles] = useState([])
  const [isAppendingBallots, setIsAppendingBallots] = useState(false)
  const handleAppendBallotsChange = (e)=> setAppendBallotFiles(Array.from(e.target.files||[]))
  const onAppendBallots = async (e)=>{
    e.preventDefault()
    if(!activeEvent) return
    if(appendBallotFiles.length===0) return
    try{
      setIsAppendingBallots(true)
      await addBallotImages({ EventID: activeEvent._id, files: appendBallotFiles })
      alert('Ballot images appended')
      setAppendBallotFiles([])
    }catch(err){ alert(err?.response?.data?.message || 'Failed to append ballot images') }finally{ setIsAppendingBallots(false) }
  }

  const onUnapprove = async (uid) => {
    if(!activeEvent) return
    if(!confirm('Remove approval for this nominee?')) return
    try{
      await unapproveNominee({ EventID: activeEvent._id, NomineeID: uid })
      const found = approved.find(x => (x.UserID?._id || x.UserID) === uid)
      setApproved(list => list.filter(x => (x.UserID?._id || x.UserID) !== uid))
      if(found){
        setPending(list => [...list, { UserID: found.UserID, SelectedBalot: found.SelectedBalot, Description: found.Description }])
      }
    }catch(err){ alert(err?.response?.data?.message || 'Failed to unapprove nominee') }
  }

  const onRemoveNominee = async (uid) => {
    if(!activeEvent) return
    if(!confirm('Completely remove this nominee?')) return
    try{
      await removeNominee({ EventID: activeEvent._id, NomineeID: uid })
      setApproved(a=> a.filter(x=> (x.UserID?._id || x.UserID) !== uid))
      setPending(p=> p.filter(x=> (x.UserID?._id || x.UserID) !== uid))
    }catch(err){ alert(err?.response?.data?.message || 'Failed to remove nominee') }
  }

  const handleRemoveVoter = async (uid) => {
    if(!activeEvent) return
    if(!confirm('Remove this voter?')) return
    try{
      await removeVoter({ EventID: activeEvent._id, VoterID: uid })
      setVoters(v => v.filter(x => (x.UserID?._id || x.UserID) !== uid))
    }catch(err){ alert(err?.response?.data?.message || 'Failed to remove voter') }
  }

  // Integrate new sections into existing render logic (example placeholder at bottom of main component render)
  return (
    <div className={`min-h-screen ${BG_BODY} ${TEXT_PRIMARY} font-sans flex flex-col lg:flex-row`}>
      
      {/* 1. Sidebar Navigation (Left Panel) */}
      <aside className={`w-full lg:w-72 ${BG_SIDEBAR} shadow-xl lg:shadow-2xl p-6 lg:min-h-screen border-r border-gray-200 dark:border-gray-700/50`}>
        
        {/* Header/Logo */}
        <div className="flex items-center mb-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <span 
            className={`text-2xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r 
                from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-400`}
          >
            E-Vote Admin
          </span>
        </div>

        {/* Navigation Links */}
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
            isActive={activeView === NAV_ITEMS.CREATE}
            onClick={() => handleNavigation(NAV_ITEMS.CREATE)}
          />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <h4 className={`text-xs ${TEXT_SECONDARY} uppercase font-semibold tracking-wider px-4 mb-2`}>Event Management</h4>
            <NavItem 
                icon={RunningIcon} 
                label={NAV_ITEMS.RUNNING} 
                isActive={activeView === NAV_ITEMS.RUNNING && !activeEvent}
                onClick={() => handleNavigation(NAV_ITEMS.RUNNING)}
            />
            <NavItem 
                icon={UpcomingIcon} 
                label={NAV_ITEMS.UPCOMING} 
                isActive={activeView === NAV_ITEMS.UPCOMING && !activeEvent}
                onClick={() => handleNavigation(NAV_ITEMS.UPCOMING)}
            />
            <NavItem 
                icon={PreviousIcon} 
                label={NAV_ITEMS.PREVIOUS} 
                isActive={activeView === NAV_ITEMS.PREVIOUS}
                onClick={() => handleNavigation(NAV_ITEMS.PREVIOUS)}
            />
        </div>
        
        {/* Logout Placeholder */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
                // You should implement the actual logout logic/navigation here
                onClick={() => alert('Logout functionality goes here.')} 
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[#DC2626] text-white hover:bg-red-500 font-semibold shadow-md shadow-red-900/40`}
            >
                <LogoutIcon className="mr-3"/>
                <span className="text-sm">Logout</span>
            </button>
        </div>
      </aside>

      {/* 2. Main Content Area (Right Panel) */}
      <main className="flex-1 p-6 md:p-10 max-w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {activeEvent && (
                <button 
                    onClick={() => setActiveEvent(null)} 
                    className={`mb-6 text-sm ${ACCENT_PRIMARY_TEXT} hover:underline flex items-center`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                    Back to {activeView} List
                </button>
            )}
            {renderActiveContent()}
        </div>
      </main>

      {/* Profile Modal */}
      {profileModal.open && profileModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={closeProfile}>
          <div className={`w-full max-w-md p-6 rounded-xl ${BG_CARD} border border-gray-200 dark:border-gray-700 shadow-xl relative`} onMouseDown={e=>e.stopPropagation()}>
            <button onClick={closeProfile} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">✕</button>
            <div className="flex items-center gap-4 mb-4">
              <img src={profileModal.user?.ProfileImage || 'https://placehold.co/80'} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <div className={`text-xl font-bold ${ACCENT_PRIMARY_TEXT}`}>{profileModal.user?.FullName}</div>
                <div className={`text-xs ${TEXT_SECONDARY}`}>@{profileModal.user?.UserName}</div>
              </div>
            </div>
            {profileModal.description && <div className="text-sm whitespace-pre-line mb-4">{profileModal.description}</div>}
            <div className="text-[10px] ${TEXT_SECONDARY}">User ID: {profileModal.user?._id}</div>
          </div>
        </div>
      )}
    </div>
  )
}