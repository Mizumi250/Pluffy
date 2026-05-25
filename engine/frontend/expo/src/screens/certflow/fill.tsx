// ============================================================
// ARKZEN GENERATED SCREEN — certflow/fill [Expo]
// Layout: app | Auth required: false
// DO NOT EDIT — edit tatemono @arkzen:native:page:fill instead
// Generated: 2026-05-25T08:28:09.674Z
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
// No layout wrapper — blank screen

export function FillScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        const FillPage = () => {
  const router = useRouter()
  const [token, setToken]           = useState<string | null>(null)
  const [template, setTemplate]     = useState<Template | null>(null)
  const [fields, setFields]         = useState<FieldDef[]>([])
  const [formData, setFormData]     = useState<Record<string, string>>({})
  const [step, setStep]             = useState<'loading' | 'form' | 'submitting' | 'done' | 'error'>('loading')
  const [result, setResult]         = useState<{ token: string; qr: string; email_sent: boolean } | null>(null)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const heroRef   = useRef<HTMLDivElement>(null)
  const formRef   = useRef<HTMLDivElement>(null)
  const doneRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parts = window.location.pathname.split('/')
    const t = parts[parts.length - 1]
    setToken(t)
    loadForm(t)
  }, [])

  useEffect(() => {
    if (step === 'form' && heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    }
    if (step === 'form' && formRef.current) {
      const items = formRef.current.querySelectorAll('.form-field')
      gsap.fromTo(items, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.2 })
    }
    if (step === 'done' && doneRef.current) {
      gsap.fromTo(doneRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)' })
    }
  }, [step])

  const loadForm = async (t: string) => {
    try {
      const res  = await fetch(`/api/certflow/fill/${t}`)
      if (!res.ok) { setStep('error'); return }
      const data = await res.json()
      setTemplate(data.template)
      const sorted = [...(data.fields ?? [])].sort((a: FieldDef, b: FieldDef) => a.layer_order - b.layer_order)
      setFields(sorted)
      sorted.forEach((f: FieldDef) => { loadGoogleFont(f.font_family); loadGoogleFont(data.template.global_font) })
      setStep('form')
    } catch {
      setStep('error')
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.is_required && !formData[f.label]?.trim()) {
        errs[f.label] = 'This field is required'
      }
      if (f.field_type === 'email' && formData[f.label] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[f.label])) {
        errs[f.label] = 'Please enter a valid email'
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !token) return
    setStep('submitting')
    try {
      const res  = await fetch(`/api/certflow/fill/${token}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(formData),
      })
      if (!res.ok) { setStep('form'); return }
      const data = await res.json()
      setResult({ token: data.submission_token, qr: data.qr_code, email_sent: data.email_sent })
      setStep('done')
    } catch {
      setStep('form')
    }
  }

  const inputStyle = (field: FieldDef, hasErr: boolean): React.CSSProperties => ({
    width: '100%',
    background: '#f8fafc',
    border: hasErr ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: '14px 18px',
    color: '#0f172a',
    fontSize: 15,
    fontFamily: field.font_family,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.2s',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 20px 80px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', top: '-5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '0%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {step === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1' }} />
          </motion.div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Loading certificate form…</div>
        </div>
      )}

      {step === 'error' && (
        <div style={{ textAlign: 'center', color: '#64748b', paddingTop: 100 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Invalid Link</div>
          <div style={{ fontSize: 14 }}>This certificate link is invalid or has expired.</div>
        </div>
      )}

      {(step === 'form' || step === 'submitting') && template && (
        <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 5 }}>
          <div ref={heroRef} style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              <GraduationCap size={28} color="#6366f1" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5, margin: '0 0 8px' }}>{template.name}</h1>
            {template.description && <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{template.description}</p>}
          </div>

          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <img src={template.file_path} alt={template.name} style={{ width: '100%', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>

          <div ref={formRef} style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            padding: '32px',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Fill in your details</h2>

            {fields.map((field) => (
              <div key={field.id} className="form-field" style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}>
                  {field.label}{field.is_required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                <input
                  type={field.field_type === 'date' ? 'date' : field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder ?? `Enter ${field.label}…`}
                  value={formData[field.label] ?? ''}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, [field.label]: e.target.value }))
                    if (errors[field.label]) setErrors((p) => { const n = { ...p }; delete n[field.label]; return n })
                  }}
                  style={inputStyle(field, !!errors[field.label])}
                />
                {errors[field.label] && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>
                    {errors[field.label]}
                  </motion.div>
                )}
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={step === 'submitting'}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '16px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                cursor: step === 'submitting' ? 'not-allowed' : 'pointer',
                opacity: step === 'submitting' ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                transition: 'opacity 0.2s',
                letterSpacing: 0.3,
              }}
            >
              {step === 'submitting' ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Generating your certificate…
                </span>
              ) : 'Submit & Get Certificate →'}
            </motion.button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div ref={doneRef} style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative', zIndex: 5 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: -0.5 }}>Certificate Ready!</h1>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 36 }}>
            {result.email_sent ? 'Your certificate has been sent to your email. 📧' : 'Your certificate has been generated successfully.'}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 16 }}
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.9)',
              padding: '32px',
              marginBottom: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
              Scan to Verify
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'inline-block', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <img src={result.qr} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace', marginBottom: 20, wordBreak: 'break-all' }}>
              {result.token.slice(0, 32)}…
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => copyToClipboard(window.location.origin + '/certflow/verify/' + result.token)}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 24px', color: '#0f172a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              📋 Copy Verify Link
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default FillScreen
