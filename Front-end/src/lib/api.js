import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function login({ UserName, Email, Password }){
  const res = await api.post('/api/v1/users/login', { UserName, Email, Password })
  const { AccessToken, RefreshToken, LogInUser } = res.data?.data || {}
  if (AccessToken) localStorage.setItem('accessToken', AccessToken)
  if (RefreshToken) localStorage.setItem('refreshToken', RefreshToken)
  if (LogInUser?.Role) localStorage.setItem('role', LogInUser.Role)
  if (LogInUser) localStorage.setItem('user', JSON.stringify(LogInUser))
  return res.data
}

export function getUser(){
  try{ return JSON.parse(localStorage.getItem('user') || 'null') }catch{return null}
}

export function setUser(u){
  if(u) localStorage.setItem('user', JSON.stringify(u))
}

export async function logout(){
  try{ await api.post('/api/v1/users/logout') } catch(e) { /* ignore */ }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
}

export async function registerInit(formData){
  const res = await api.post('/api/v1/users/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data?.data // { otpToken }
}

export async function registerVerify({ otpToken, code }){
  const res = await api.post('/api/v1/users/register/verify', { otpToken, code })
  return res.data?.data
}

export async function renew(){
  const rt = localStorage.getItem('refreshToken')
  if (!rt) return null
  const res = await api.post('/api/v1/users/renewaccestoken', { RefreshToken: rt })
  const { AccessToken, RefreshToken } = res.data?.data || {}
  if (AccessToken) localStorage.setItem('accessToken', AccessToken)
  if (RefreshToken) localStorage.setItem('refreshToken', RefreshToken)
  return res.data
}

export async function updateProfileImage(file){
  const fd = new FormData()
  fd.append('ProfileImage', file)
  const res = await api.patch('/api/v1/users/UpdateProfilePicture', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  const user = res.data?.data
  if(user) setUser(user)
  return user
}

export async function updateCoverImage(file){
  const fd = new FormData()
  fd.append('CoverImage', file)
  const res = await api.patch('/api/v1/users/UpdateCoverPicture', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  const user = res.data?.data
  if(user) setUser(user)
  return user
}

export async function listEvents(){
  const res = await api.get('/api/V1/admin/events')
  return res.data?.data || []
}

export async function createEvent(payload){
  const fd = new FormData()
  fd.append('Title', payload.Title)
  if (payload.Description) fd.append('Description', payload.Description)
  fd.append('RegEndTime', payload.RegEndTime)
  fd.append('VoteStartTime', payload.VoteStartTime)
  fd.append('VoteEndTime', payload.VoteEndTime)
  fd.append('ElectionType', payload.ElectionType)
  fd.append('votingMode', payload.votingMode)
  if (payload.votingMode === 'onCampus' && payload.codeRotationMinutes) {
    fd.append('codeRotationMinutes', String(payload.codeRotationMinutes))
  }
  ;(payload.BallotImageFiles || []).forEach(file => fd.append('BallotImage', file))
  const res = await api.post('/api/V1/admin/VoteEvent', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data?.data
}

export async function countVote(eventId){
  const res = await api.get('/api/V1/admin/countvote', { params: { EventID: eventId } })
  return res.data?.data
}

export async function getNominees(eventId){
  const res = await api.get('/api/V1/admin/getApproveNominee', { params: { EventID: eventId } })
  return res.data?.data?.NomineeDetails || []
}

export async function getAvailableBallots(eventId){
  const res = await api.get('/api/V1/admin/getAvailableBallot', { params: { EventID: eventId } })
  return res.data?.data || []
}

export async function getPendingNominees(eventId){
  const res = await api.get('/api/V1/admin/getPendingNominee', { params: { EventID: eventId } })
  return res.data?.data?.NomineeDetails || []
}

export async function approveNominee({ EventID, NomineeID }){
  const res = await api.post('/api/V1/admin/nomineeApproval', { EventID, NomineeID })
  return res.data?.data
}

export async function voterRegister(eventId){
  const res = await api.post('/api/V1/admin/voterReg', { EventID: eventId })
  return res.data?.data
}

export async function nomineeRegister(payload){
  const res = await api.post('/api/V1/admin/nomineReg', payload)
  return res.data?.data
}

export async function sendOnlineVoteCode(eventId){
  const res = await api.post('/api/V1/admin/sendOnlineVoteCode', { EventID: eventId })
  return res.data?.data
}

export async function rotateOnCampusCode(eventId){
  const res = await api.post('/api/V1/admin/rotateOnCampusCode', { EventID: eventId })
  return res.data?.data
}

export async function giveVote(payload){
  // payload may include code
  const res = await api.post('/api/V1/admin/voting', payload)
  return res.data?.data
}

export async function getVoteStatus(eventId){
  const res = await api.get('/api/V1/admin/voteStatus', { params: { EventID: eventId } })
  return !!(res.data?.data?.hasVoted)
}

export async function getVoterRegStatus(eventId){
  const res = await api.get('/api/V1/admin/voterRegStatus', { params: { EventID: eventId } })
  return res.data?.data || { registered:false, hasVoted:false }
}

export async function getNomineeRegStatus(eventId){
  const res = await api.get('/api/V1/admin/nomineeRegStatus', { params: { EventID: eventId } })
  return res.data?.data || { registered:false, approved:false }
}

// Fetch public profile for any user by ID (non-auth sensitive)
export async function getPublicUserProfile(userId){
  if(!userId) return null
  const res = await api.get(`/api/v1/users/profile/${userId}`)
  return res.data?.data || null
}

export async function changePassword({ OldPassword, NewPassword }){
  const res = await api.post('/api/v1/users/changepassword', { OldPassword, NewPassword })
  return res.data?.data
}

export async function getUserVoteHistory(){
  const res = await api.get('/api/V1/admin/myVoteHistory')
  return res.data?.data || []
}

// ===== Campaign (Facebook-style) APIs =====
// Adjusted endpoints to match back-end mounted path /api/v1/post/*
export async function createCampaignPost({ eventID, content, pictures = [], videos = [] }){
  const fd = new FormData()
  fd.append('eventID', eventID)
  if (content) fd.append('content', content)
  pictures.forEach(f => fd.append('picture', f))
  videos.forEach(f => fd.append('video', f))
  const res = await api.post('/api/v1/post/posting', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data?.data
}

export async function listCampaignPosts(eventID){
  const res = await api.get('/api/v1/post/getpostlist', { params: { eventID } })
  return res.data?.data || []
}

export async function reactCampaignPost({ eventID, postID, type }){
  const payload = { eventID, postID, likes: type === 'like', dislikes: type === 'dislike' }
  const res = await api.post('/api/v1/post/likedislike', payload)
  return res.data?.data
}

export async function countCampaignReactions(postID){
  const res = await api.get('/api/v1/post/countReaction', { params: { postID } })
  return res.data?.data || { like:0, dislike:0 }
}

export async function addCampaignComment({ eventID, postID, comment }){
  const res = await api.post('/api/v1/post/comment', { eventID, postID, comment })
  return res.data?.data
}

export async function deleteCampaignPost({ eventID, postID }){
  const res = await api.delete('/api/v1/post/deletePost', { data: { eventID, postID } })
  return res.data?.data
}

export async function deleteCampaignComment({ eventID, commentID }){
  const res = await api.delete('/api/v1/post/deleteComment', { data: { eventID, commentID } })
  return res.data?.data
}

export async function updateEventTimes({ EventID, RegEndTime, VoteStartTime, VoteEndTime }){
  const res = await api.patch('/api/V1/admin/updateEventTimes', { EventID, RegEndTime, VoteStartTime, VoteEndTime })
  return res.data?.data
}

export async function editCampaignPost({ eventID, postID, content, pictures = [], videos = [], removeMediaIds = [] }){
  const fd = new FormData()
  fd.append('eventID', eventID)
  fd.append('postID', postID)
  if (typeof content === 'string') fd.append('content', content)
  removeMediaIds.forEach(id => fd.append('removeMediaIds', id))
  pictures.forEach(f => fd.append('picture', f))
  videos.forEach(f => fd.append('video', f))
  const res = await api.post('/api/v1/post/editPost', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data?.data
}

export async function editCampaignComment({ eventID, commentID, comment }){
  const res = await api.patch('/api/v1/post/editComment', { eventID, commentID, comment })
  return res.data?.data
}

export async function reactComment({ eventID, commentID, like=false, dislike=false }){
  const res = await api.post('/api/v1/post/reactComment', { eventID, commentID, like, dislike })
  return res.data?.data
}

export async function addBallotImages({ EventID, files = [] }){
  const fd = new FormData()
  fd.append('EventID', EventID)
  files.forEach(f => fd.append('BallotImage', f))
  const res = await api.post('/api/V1/admin/addBallotImages', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
  return res.data?.data
}
