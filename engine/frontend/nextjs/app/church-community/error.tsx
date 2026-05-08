'use client'
// ============================================================
// ARKZEN GENERATED — church-community/error.tsx
// Next.js segment-scoped runtime error boundary.
// Rendered when an unhandled exception is thrown during render under /church-community.
// Must be a Client Component — Next.js requirement.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-08T15:11:44.336Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#0d0d14,#141420)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:80,fontWeight:800,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>500</p>
        <p style={{color:'#9090b0',marginTop:8,fontSize:15}}>Something went wrong</p>
        <button onClick={reset} style={{display:'inline-flex',alignItems:'center',marginTop:20,padding:'11px 28px',borderRadius:50,background:'linear-gradient(135deg,#6c5ce7,#a29bfe)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>Try again</button>
      </div>
    </div>
  )
}

export default function ArkzenError_ChurchCommunity({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage reset={reset} />
}
