'use client'
// ============================================================
// ARKZEN GENERATED PAGE — church-community/login
// Layout: guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T15:11:44.349Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { churchCommunityAnimations, pageVariants } from '@/arkzen/generated/church-community.animations'

// Utilities, types, and helper functions from @arkzen:components
import { create } from 'zustand'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Image as ImageIcon, Plus, Trash2, Search, X, Upload,
  Calendar, Users, Loader2, LogIn, UserPlus, Send,
} from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
export { useTheme, LIGHT, DARK } from '@/arkzen/core/layouts/custom/church-community-app'

// ─── Types ────────────────────────────────────────────────────────────────────
export type Role = 'pastor'|'elder'|'deacon'|'leader'|'member'
export interface ChurchEvent { id:number; title:string; description:string|null; event_date:string; cover_photo_url:string|null; is_members_only:boolean; created_at:string }
export interface Photo { id:number; event_id:number; uploader_id:number; url:string; thumbnail_url:string|null; caption:string|null; file_name:string; file_size:number|null; tags:string[]|null; likes_count:number; liked?:boolean; uploader?:{id:number;name:string}; event?:ChurchEvent; created_at:string }
export interface Member { id:number; name:string; role:Role; photo_url:string|null; email:string|null; bio:string|null; joined_at:string|null; is_active:boolean }
export interface Comment { id:number; photo_id:number; user_id:number; body:string; user?:{id:number;name:string}; created_at:string }

// ─── Stores ───────────────────────────────────────────────────────────────────
export const useFeedStore = create<any>((set:any) => ({ events:[], selectedEvent:null, photos:[], loadingEvents:false, loadingPhotos:false, setEvents:(e:any)=>set({events:e}), setSelectedEvent:(e:any)=>set({selectedEvent:e}), setPhotos:(p:any)=>set({photos:p}), setLoadingEvents:(v:any)=>set({loadingEvents:v}), setLoadingPhotos:(v:any)=>set({loadingPhotos:v}) }))
export const useMemberStore = create<any>((set:any) => ({ members:[], loading:false, searchQuery:'', roleFilter:'all', setMembers:(m:any)=>set({members:m}), setLoading:(v:any)=>set({loading:v}), setSearchQuery:(q:any)=>set({searchQuery:q}), setRoleFilter:(r:any)=>set({roleFilter:r}) }))
export const useInventoryStore = create<any>((set:any) => ({ photos:[], totalCount:0, totalSize:0, eventCount:0, allTags:[], activeTag:null, loading:false, setData:(d:any)=>set((s:any)=>({...s,...d})) }))
export const useLightboxStore = create<any>((set:any) => ({ photo:null, open:false, comments:[], loadingComments:false, setPhoto:(p:any)=>set({photo:p}), setOpen:(v:any)=>set({open:v}), setComments:(c:any)=>set({comments:c}), setLoadingComments:(v:any)=>set({loadingComments:v}) }))

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatDate = (d:string) => new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
export const formatRelativeTime = (d:string) => { const m=Math.floor((Date.now()-new Date(d).getTime())/60000); if(m<1)return'just now'; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago` }
export const formatFileSize = (b:number|null) => { if(!b)return'—'; if(b<1048576)return`${(b/1024).toFixed(0)} KB`; return`${(b/1048576).toFixed(1)} MB` }
export const getInitials = (n:string) => n.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()
export const roleBadge: Record<Role,{bg:string;text:string}> = { pastor:{bg:'linear-gradient(135deg,#6c5ce7,#a29bfe)',text:'#fff'}, elder:{bg:'linear-gradient(135deg,#0984e3,#74b9ff)',text:'#fff'}, deacon:{bg:'linear-gradient(135deg,#a29bfe,#fd79a8)',text:'#fff'}, leader:{bg:'linear-gradient(135deg,#00b894,#55efc4)',text:'#fff'}, member:{bg:'rgba(140,150,180,0.2)',text:'#6c7a99'} }
export const roleLabel: Record<Role,string> = { pastor:'Pastor', elder:'Elder', deacon:'Deacon', leader:'Leader', member:'Member' }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skel: React.FC<{w?:string;h?:number;r?:number;T:any}> = ({w='100%',h=80,r=12,T}) => (
  <div style={{width:w,height:h,borderRadius:r,background:`linear-gradient(90deg,${T.skeletonA} 25%,${T.skeletonB} 50%,${T.skeletonA} 75%)`,backgroundSize:'200% 100%',animation:'shimmer 1.8s infinite'}} />
)

// ─── GCard ────────────────────────────────────────────────────────────────────
export const GCard: React.FC<{children:React.ReactNode;style?:React.CSSProperties;T:any;onClick?:()=>void}> = ({children,style={},T,onClick}) => (
  <div onClick={onClick} style={{background:T.surface,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderRadius:20,border:`1px solid ${T.border}`,boxShadow:T.shadow,transition:'background 0.35s,border-color 0.35s',cursor:onClick?'pointer':undefined,...style}}>
    {children}
  </div>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar: React.FC<{name:string;photoUrl?:string|null;size?:number;ring?:boolean;T:any}> = ({name,photoUrl,size=36,ring,T}) => (
  photoUrl
    ? <img src={photoUrl} alt={name} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:ring?`2.5px solid ${T.purple}`:`2px solid ${T.border}`}} />
    : <div style={{width:size,height:size,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:size*0.34,fontWeight:700,flexShrink:0,border:ring?`2.5px solid ${T.purple}`:'2px solid rgba(255,255,255,0.12)'}}>{getInitials(name)}</div>
)

// ─── Story bubble ─────────────────────────────────────────────────────────────
export const StoryBubble: React.FC<{name:string;photoUrl?:string|null;isAdd?:boolean;T:any}> = ({name,photoUrl,isAdd,T}) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',flexShrink:0}}>
    <div style={{padding:2,borderRadius:'50%',background:isAdd?T.inputBg:T.purpleGrad,boxShadow:isAdd?'none':T.shadowPurp}}>
      {isAdd
        ? <div style={{width:52,height:52,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:T.shadowPurp}}><Plus size={22}/></div>
        : <div style={{padding:2,background:T.surfaceSolid,borderRadius:'50%'}}><Avatar name={name} photoUrl={photoUrl} size={52} T={T}/></div>
      }
    </div>
    <span style={{fontSize:10,color:T.textMuted,fontWeight:500,maxWidth:60,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
      {isAdd?'Add new':name.split(' ')[0]}
    </span>
  </div>
)

// ─── PostCard ─────────────────────────────────────────────────────────────────
export const PostCard: React.FC<{photo:Photo;onLike:()=>void;onComment:()=>void;T:any}> = ({photo,onLike,onComment,T}) => {
  const [liked,setLiked]=useState(photo.liked??false)
  const [cnt,setCnt]=useState(photo.likes_count)
  const {showToast}=useToast()

  const handleLike=async()=>{
    const n=!liked; setLiked(n); setCnt(p=>n?p+1:p-1)
    try{ await arkzenFetch(`/api/church-community/photos/${photo.id}/like`,{method:'POST'}); onLike() }
    catch{ setLiked(!n); setCnt(p=>n?p-1:p+1); showToast('Failed to like','error') }
  }

  return (
    <GCard T={T} style={{overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <Avatar name={photo.uploader?.name??'Member'} size={36} T={T}/>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:T.textPrimary,lineHeight:1.2}}>{photo.uploader?.name??'Church Member'}</p>
            <p style={{fontSize:11,color:T.textMuted}}>{formatRelativeTime(photo.created_at)}</p>
          </div>
        </div>
        <button style={{color:T.textMuted,background:'none',border:'none',cursor:'pointer'}}><MoreHorizontal size={17}/></button>
      </div>

      {/* Image */}
      <div onClick={onComment} style={{position:'relative',aspectRatio:'1',background:T.inputBg,cursor:'pointer',overflow:'hidden'}}>
        {photo.url
          ? <img src={photo.url} alt={photo.caption??''} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:T.textFaint}}><ImageIcon size={36}/></div>
        }
      </div>

      {/* Actions */}
      <div style={{padding:'10px 14px 4px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={handleLike} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:liked?T.heartColor:T.textMuted,transition:'transform 0.15s'}}>
            <Heart size={21} fill={liked?T.heartColor:'none'}/>
            {cnt>0&&<span style={{fontSize:12,fontWeight:700}}>{cnt.toLocaleString()}</span>}
          </button>
          <button onClick={onComment} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><MessageCircle size={21}/></button>
          <button style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><Share2 size={21}/></button>
        </div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:T.textMuted}}><Bookmark size={21}/></button>
      </div>

      {/* Caption + tags */}
      <div style={{padding:'4px 14px 14px'}}>
        {photo.caption&&<p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{photo.uploader?.name??'Member'}</span>{photo.caption}</p>}
        {photo.tags&&photo.tags.length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:6}}>
            {photo.tags.map((tag:string)=><span key={tag} style={{fontSize:11,fontWeight:600,padding:'2px 9px',borderRadius:20,background:T.inputBg,color:T.purple}}>#{tag}</span>)}
          </div>
        )}
      </div>
    </GCard>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
export const PhotoLightbox: React.FC<{T:any}> = ({T}) => {
  const {photo,open,comments,loadingComments,setOpen,setComments,setLoadingComments}=useLightboxStore()
  const {showToast}=useToast()
  const [commentText,setCommentText]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const [localLikes,setLocalLikes]=useState(0)
  const [liked,setLiked]=useState(false)

  useEffect(()=>{
    if(!photo||!open)return
    setLocalLikes(photo.likes_count); setLiked(photo.liked??false); setLoadingComments(true)
    arkzenFetch(`/api/church-community/photos/${photo.id}/comments`).then((d:any)=>setComments(d?.comments??[])).catch(()=>{}).finally(()=>setLoadingComments(false))
  },[photo,open])

  const handleLike=async()=>{ if(!photo)return; const n=!liked; setLiked(n); setLocalLikes((p:number)=>n?p+1:p-1); try{await arkzenFetch(`/api/church-community/photos/${photo.id}/like`,{method:'POST'})}catch{setLiked(!n);setLocalLikes((p:number)=>n?p-1:p+1)} }

  const handleComment=async()=>{
    if(!photo||!commentText.trim())return; setSubmitting(true)
    try{ const res=await arkzenFetch(`/api/church-community/photos/${photo.id}/comments`,{method:'POST',body:{body:commentText}}); setComments([...comments,res.comment]); setCommentText('') }
    catch{ showToast('Failed to post comment','error') } finally{ setSubmitting(false) }
  }

  if(!open||!photo)return null

  return (
    <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={(e:any)=>e.stopPropagation()} style={{display:'flex',maxWidth:960,width:'100%',maxHeight:'92vh',borderRadius:24,overflow:'hidden',background:T.surfaceSolid,boxShadow:'0 40px 100px rgba(0,0,0,0.5)'}}>
        {/* Photo panel */}
        <div style={{flex:'0 0 58%',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {photo.url?<img src={photo.url} alt="" style={{maxWidth:'100%',maxHeight:'92vh',objectFit:'contain'}}/>:<div style={{color:'rgba(255,255,255,0.1)'}}><ImageIcon size={48}/></div>}
        </div>
        {/* Info panel */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
          <div style={{padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <Avatar name={photo.uploader?.name??'Member'} size={34} T={T}/>
              <div><p style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{photo.uploader?.name??'Member'}</p><p style={{fontSize:11,color:T.textMuted}}>{formatRelativeTime(photo.created_at)}</p></div>
            </div>
            <button onClick={()=>setOpen(false)} style={{color:T.textMuted,background:'none',border:'none',cursor:'pointer'}}><X size={18}/></button>
          </div>
          {photo.caption&&<div style={{padding:'10px 16px',borderBottom:`1px solid ${T.border}`}}><p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{photo.uploader?.name??'Member'}</span>{photo.caption}</p></div>}
          <div style={{padding:'10px 16px',display:'flex',gap:16,borderBottom:`1px solid ${T.border}`}}>
            <button onClick={handleLike} style={{display:'flex',alignItems:'center',gap:5,color:liked?T.heartColor:T.textMuted,background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:700}}><Heart size={18} fill={liked?T.heartColor:'none'}/>{localLikes}</button>
            <button style={{display:'flex',alignItems:'center',gap:5,color:T.textMuted,background:'none',border:'none',cursor:'pointer',fontSize:13}}><MessageCircle size={18}/>{comments.length}</button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px',display:'flex',flexDirection:'column',gap:12}}>
            {loadingComments?<Skel h={50} T={T}/>:comments.map((c:Comment)=>(
              <div key={c.id}><p style={{fontSize:13,color:T.textSecond,lineHeight:1.5}}><span style={{fontWeight:700,color:T.textPrimary,marginRight:6}}>{c.user?.name??'Member'}</span>{c.body}</p><p style={{fontSize:10,color:T.textMuted,marginTop:2}}>{formatRelativeTime(c.created_at)}</p></div>
            ))}
          </div>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,display:'flex',gap:8,alignItems:'center'}}>
            <input value={commentText} onChange={(e:any)=>setCommentText(e.target.value)} onKeyDown={(e:any)=>e.key==='Enter'&&handleComment()} placeholder="Add a comment…"
              style={{flex:1,padding:'9px 14px',borderRadius:50,fontSize:13,outline:'none',background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary}}/>
            <button onClick={handleComment} disabled={submitting} style={{background:T.purpleGrad,color:'#fff',border:'none',borderRadius:50,padding:'9px 16px',fontSize:13,fontWeight:700,cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.5:1,display:'flex',alignItems:'center',gap:4}}>
              {submitting?<Loader2 size={13} className="animate-spin"/>:<><Send size={13}/> Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page component code (from @arkzen:page:login)
const LoginPage = () => {
  const {login}=useAuthStore()
  const {showToast}=useToast()
  const router=useRouter()
  const [form,setForm]=useState({email:'',password:''})
  const [loading,setLoading]=useState(false)
  const [mode,setMode]=useState<'light'|'dark'>('light')

  useEffect(()=>{ const s=localStorage.getItem('gc-theme') as any; if(s)setMode(s) },[])
  const T=mode==='dark'?DARK:LIGHT

  const handleLogin=async()=>{
    if(!form.email||!form.password){showToast('All fields required','error');return}
    setLoading(true)
    try{await login(form.email,form.password);router.push('/church-community')}
    catch{showToast('Invalid credentials','error')}finally{setLoading(false)}
  }

  const inp:React.CSSProperties={width:'100%',padding:'13px 16px',borderRadius:14,fontSize:14,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,color:T.textPrimary,outline:'none',boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:T.bgGrad,transition:'background 0.35s'}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:T.purpleGrad,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:T.shadowPurp,fontSize:22,color:'#fff'}}>✝</div>
          <h1 style={{fontSize:26,fontWeight:800,color:T.textPrimary,letterSpacing:'-0.04em',fontFamily:'Georgia, serif'}}>Grace<span style={{color:T.purple}}>Community</span></h1>
          <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>Sign in to your account</p>
        </div>
        <div style={{background:T.surface,backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderRadius:24,border:`1px solid ${T.border}`,padding:'28px 24px',boxShadow:T.shadow}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <input type="email" placeholder="Email address" value={form.email} onChange={(e:any)=>setForm((f:any)=>({...f,email:e.target.value}))} style={inp}/>
            <input type="password" placeholder="Password" value={form.password} onChange={(e:any)=>setForm((f:any)=>({...f,password:e.target.value}))} onKeyDown={(e:any)=>e.key==='Enter'&&handleLogin()} style={inp}/>
            <button onClick={handleLogin} disabled={loading} style={{width:'100%',padding:'13px',borderRadius:50,background:T.purpleGrad,color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1,boxShadow:T.shadowPurp,marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading?<><Loader2 size={16} className="animate-spin"/> Signing in…</>:<><LogIn size={16}/> Sign In</>}
            </button>
          </div>
          <p style={{textAlign:'center',fontSize:13,color:T.textMuted,marginTop:18}}>Don't have an account?{' '}<a href="/church-community/register" style={{color:T.purple,fontWeight:700,textDecoration:'none'}}>Register</a></p>
        </div>
      </div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_ChurchCommunity_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = churchCommunityAnimations(pageRef)
    return cleanup
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LoginPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_ChurchCommunity_Login
