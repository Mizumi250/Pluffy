// ARKZEN GENERATED — portfolio-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.800Z
import { CATEGORIES, PROJECTS, SKILLS } from './components/constants'

/* @arkzen:native:page:layout:guest */

import React from 'react'

const IndexLynxPage = () => {
  const [name,      setName]      = React.useState('')
  const [email,     setEmail]     = React.useState('')
  const [message,   setMessage]   = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)

  const handleSend = () => {
    if (!name || !email || !message) return
    setSubmitted(true)
    setName(''); setEmail(''); setMessage('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2">
          <span className="text-2xl">💻</span>
          <span className="font-semibold text-neutral-900">Portfolio</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-5xl font-semibold text-neutral-900 mb-4">Full-Stack Developer</h1>
          <p className="text-lg text-neutral-600">Crafting digital experiences</p>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-8 flex items-center gap-2">⭐ Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-5xl">{p.image}</div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{p.description}</p>
                  <div className="flex gap-2 mb-4">
                    {p.tags.map((t, i) => (<span key={i} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">{t}</span>))}
                  </div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-neutral-900 font-medium">View ↗</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-12">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {CATEGORIES.map(cat => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-neutral-900 mb-6 uppercase tracking-widest">{cat}</h3>
                <div className="space-y-4">
                  {SKILLS.filter(s => s.category === cat).map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-neutral-700">{s.name}</span>
                        <span className="text-xs text-neutral-500">{s.proficiency}%</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full"><div className="h-full bg-neutral-900 rounded-full" style={{ width: `${s.proficiency}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✉️</span>
            <h2 className="text-2xl font-semibold text-neutral-900">Contact</h2>
          </div>
          {submitted && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm">Thanks! Message sent.</div>}
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="space-y-4">
            <input 
              type="text" 
              placeholder="Name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
            <textarea 
              placeholder="Message" 
              rows={4} 
              required 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:border-neutral-900"
            />
            <button type="submit" className="w-full bg-neutral-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-neutral-800 transition">Send</button>
          </form>
        </section>
      </main>
    </div>
  )
}
