/* @arkzen:meta
name: barbershop-booking
version: 1.0.0
label: Barbershop Booking
auth: false
*/

/* @arkzen:database
name: barbershop
tables:
  - name: barbers
    columns:
      - { name: name, type: string }
      - { name: specialty, type: string }
      - { name: rating, type: decimal, precision: 3, scale: 1 }
      - { name: reviews, type: integer, default: 0 }
      - { name: avatar_initials, type: string }
      - { name: available, type: boolean, default: true }
      - { name: photo, type: string, length: 500, nullable: true }
    seeds:
      - { name: "Marcus Lee", specialty: "Fade & Taper", rating: 4.9, reviews: 214, avatar_initials: "ML", available: true, photo: "https://i.pravatar.cc/150?img=11" }
      - { name: "James Rivera", specialty: "Classic Cut", rating: 4.7, reviews: 189, avatar_initials: "JR", available: true, photo: "https://i.pravatar.cc/150?img=15" }
      - { name: "Carlo Santos", specialty: "Skin Fade", rating: 4.8, reviews: 156, avatar_initials: "CS", available: true, photo: "https://i.pravatar.cc/150?img=33" }
      - { name: "Nico Reyes", specialty: "Beard Trim", rating: 4.6, reviews: 98, avatar_initials: "NR", available: false, photo: "https://i.pravatar.cc/150?img=52" }

  - name: services
    columns:
      - { name: name, type: string }
      - { name: duration, type: integer }
      - { name: price, type: decimal, precision: 8, scale: 2 }
      - { name: description, type: string }
    seeds:
      - { name: "Classic Cut", duration: 30, price: 150.00, description: "Clean scissor cut with styling" }
      - { name: "Skin Fade", duration: 45, price: 200.00, description: "Zero to skin fade, perfectly blended" }
      - { name: "Beard Trim", duration: 20, price: 100.00, description: "Shape and define your beard" }
      - { name: "Cut + Beard", duration: 60, price: 280.00, description: "Full grooming session" }
      - { name: "Hot Towel Shave", duration: 35, price: 180.00, description: "Traditional straight razor shave" }

  - name: bookings
    columns:
      - { name: barber_id, type: foreignId, references: barbers }
      - { name: service_id, type: foreignId, references: services }
      - { name: booking_date, type: date }
      - { name: booking_time, type: string }
      - { name: client_name, type: string }
      - { name: client_phone, type: string, nullable: true }
      - { name: status, type: enum, values: [pending, confirmed, done, cancelled], default: pending }
      - { name: notes, type: text, nullable: true }
*/

/* @arkzen:api:barbers
resource: barbers
routes:
  - { method: GET, path: /barbers, action: index }
  - { method: GET, path: "/barbers/{id}", action: show }
*/

/* @arkzen:api:services
resource: services
routes:
  - { method: GET, path: /services, action: index }
*/

/* @arkzen:api:bookings
resource: bookings
routes:
  - { method: POST, path: /bookings, action: store }
  - { method: GET, path: /bookings/slots, action: slots }
*/

/* @arkzen:endpoint
*/
method: GET
path: /bookings/slots
description: Returns available time slots for a barber on a given date
*/
$barberId = $request->query('barber_id');
$date     = $request->query('date', now()->toDateString());

$allSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM',
  '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];

$booked = \App\Models\Arkzen\BarbershopBooking\Booking::where('barber_id', $barberId)
  ->where('booking_date', $date)
  ->whereNotIn('status', ['cancelled'])
  ->pluck('booking_time')
  ->toArray();

$available = array_values(array_filter($allSlots, fn($s) => !in_array($s, $booked)));

return response()->json(['slots' => $available, 'booked' => $booked]);
/* @arkzen:endpoint:end */

/* @arkzen:components:shared */
'use client'

import React, { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { gsap } from 'gsap'

export interface Barber {
  id: number
  name: string
  specialty: string
  rating: number
  reviews: number
  avatar_initials: string
  available: boolean
  photo: string | null
}

export interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

export interface BookingState {
  barbers: Barber[]
  services: Service[]
  selectedBarber: Barber | null
  selectedService: Service | null
  selectedDate: string
  selectedTime: string | null
  availableSlots: string[]
  panelOpen: boolean
  panelStep: 'service' | 'time' | 'confirm' | 'success'
  clientName: string
  clientPhone: string
  isLoading: boolean
  isBooking: boolean
  setBarbers: (b: Barber[]) => void
  setServices: (s: Service[]) => void
  setSelectedBarber: (b: Barber | null) => void
  setSelectedService: (s: Service | null) => void
  setSelectedDate: (d: string) => void
  setSelectedTime: (t: string | null) => void
  setSlots: (available: string[]) => void
  setPanelOpen: (o: boolean) => void
  setPanelStep: (s: 'service' | 'time' | 'confirm' | 'success') => void
  setClientName: (n: string) => void
  setClientPhone: (p: string) => void
  setLoading: (l: boolean) => void
  setBooking: (b: boolean) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  barbers: [],
  services: [],
  selectedBarber: null,
  selectedService: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedTime: null,
  availableSlots: [],
  panelOpen: false,
  panelStep: 'service',
  clientName: '',
  clientPhone: '',
  isLoading: false,
  isBooking: false,
  setBarbers: (barbers) => set({ barbers }),
  setServices: (services) => set({ services }),
  setSelectedBarber: (selectedBarber) => set({ selectedBarber }),
  setSelectedService: (selectedService) => set({ selectedService }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setSlots: (availableSlots) => set({ availableSlots }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setPanelStep: (panelStep) => set({ panelStep }),
  setClientName: (clientName) => set({ clientName }),
  setClientPhone: (clientPhone) => set({ clientPhone }),
  setLoading: (isLoading) => set({ isLoading }),
  setBooking: (isBooking) => set({ isBooking }),
  resetBooking: () => set({
    selectedService: null,
    selectedTime: null,
    panelOpen: false,
    panelStep: 'service',
    clientName: '',
    clientPhone: '',
    selectedBarber: null,
  }),
}))

// ── Date Strip (Image 1 style: horizontal scroll, today pill black) ──
export function DateStrip() {
  const { selectedDate, setSelectedDate } = useBookingStore()
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const selectedD = new Date(selectedDate + 'T00:00:00')

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Month header — Image 1 style: large month, faded adjacent months */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', paddingLeft: '24px' }}>
        {[-1, 0, 1].map(offset => {
          const m = new Date(selectedD)
          m.setMonth(m.getMonth() + offset)
          const isCurrent = offset === 0
          return (
            <span key={offset} style={{
              fontSize: isCurrent ? '26px' : '18px',
              fontWeight: isCurrent ? '800' : '400',
              color: isCurrent ? '#0a0a0a' : '#ccc',
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.5px',
              transition: 'all 0.3s ease',
            }}>
              {months[m.getMonth()]}
            </span>
          )
        })}
      </div>

      {/* Day columns — Image 1 style: day letter + date number, selected = black pill */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {dates.map((d, i) => {
          const iso = d.toISOString().split('T')[0]
          const isSelected = iso === selectedDate
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              style={{
                minWidth: '44px',
                height: '68px',
                borderRadius: '22px',
                border: 'none',
                background: isSelected ? '#0a0a0a' : 'transparent',
                color: isSelected ? '#fff' : '#aaa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', color: isSelected ? '#fff' : '#bbb' }}>
                {days[d.getDay()][0]}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: isSelected ? '#fff' : '#0a0a0a' }}>
                {d.getDate()}
              </span>
              {i === 0 && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? '#fff' : '#0a0a0a' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Barber Row (Image 2 style: circular photo, name bold, specialty small, rating right) ──
export function BarberRow({ barber, onSelect }: { barber: Barber; onSelect: () => void }) {
  const { selectedBarber } = useBookingStore()
  const isSelected = selectedBarber?.id === barber.id

  return (
    <div
      onClick={barber.available ? onSelect : undefined}
      className="bs-barber-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 20px',
        background: isSelected ? '#0a0a0a' : '#fff',
        borderRadius: '20px',
        cursor: barber.available ? 'pointer' : 'default',
        opacity: barber.available ? 1 : 0.4,
        transition: 'all 0.22s ease',
        boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.18)' : '0 1px 8px rgba(0,0,0,0.06)',
        marginBottom: '10px',
      }}
    >
      {/* Circular photo — Image 2 style */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {barber.photo ? (
          <img src={barber.photo} alt={barber.name} style={{
            width: '52px', height: '52px', borderRadius: '50%',
            objectFit: 'cover', display: 'block',
            border: isSelected ? '2px solid #fff' : '2px solid #f0f0f0',
          }} />
        ) : (
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: isSelected ? '#333' : '#f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '700',
            color: isSelected ? '#fff' : '#999',
            fontFamily: "'Syne', sans-serif",
          }}>{barber.avatar_initials}</div>
        )}
        {barber.available && (
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#22c55e',
            border: `2px solid ${isSelected ? '#0a0a0a' : '#fff'}`,
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: isSelected ? '#fff' : '#0a0a0a', letterSpacing: '-0.3px', marginBottom: '2px' }}>
          {barber.name}
        </div>
        <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: isSelected ? '#aaa' : '#999', letterSpacing: '0.04em' }}>
          {barber.specialty}
        </div>
      </div>

      {/* Rating — Image 2 style: black pill */}
      <div style={{
        background: isSelected ? '#fff' : '#0a0a0a',
        borderRadius: '99px',
        padding: '5px 12px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <span style={{ fontSize: '11px', color: isSelected ? '#0a0a0a' : '#fff', fontFamily: "'DM Mono', monospace" }}>★</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#0a0a0a' : '#fff', fontFamily: "'Syne', sans-serif" }}>{barber.rating}</span>
      </div>

      {/* Arrow */}
      {!isSelected && barber.available && (
        <div style={{ color: '#ccc', fontSize: '16px', flexShrink: 0 }}>›</div>
      )}
      {isSelected && (
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Bottom Sheet ──
export function BottomSheet() {
  const {
    panelOpen, panelStep, selectedBarber, selectedService, selectedTime,
    selectedDate, availableSlots, services, clientName, clientPhone, isBooking,
    setPanelOpen, setPanelStep, setSelectedService, setSelectedTime,
    setClientName, setClientPhone, setBooking, setSlots, resetBooking,
  } = useBookingStore()

  const sheetRef   = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sheetRef.current || !overlayRef.current) return
    if (panelOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.38, ease: 'power3.out' })
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 })
      gsap.to(sheetRef.current, { y: '100%', duration: 0.28, ease: 'power3.in' })
    }
  }, [panelOpen])

  useEffect(() => {
    if (!selectedBarber || !selectedDate || !panelOpen || panelStep !== 'time') return
    fetch(`/api/barbershop-booking/bookings/slots?barber_id=${selectedBarber.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots || []))
      .catch(() => setSlots([]))
  }, [selectedBarber, selectedDate, panelStep, panelOpen])

  const handleBook = async () => {
    if (!selectedBarber || !selectedService || !selectedTime || !clientName) return
    setBooking(true)
    try {
      await fetch('/api/barbershop-booking/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: selectedBarber.id,
          service_id: selectedService.id,
          booking_date: selectedDate,
          booking_time: selectedTime,
          client_name: clientName,
          client_phone: clientPhone,
          status: 'confirmed',
        }),
      })
      setPanelStep('success')
    } catch {}
    setBooking(false)
  }

  const ALL_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']

  const stepTitle: Record<string, string> = {
    service: 'Choose Service',
    time: 'Pick a Time',
    confirm: 'Confirm',
    success: "You're Booked!",
  }

  return (
    <>
      <div ref={overlayRef} onClick={() => panelStep !== 'success' && setPanelOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)', zIndex: 40, opacity: 0,
        pointerEvents: panelOpen ? 'auto' : 'none',
      }} />

      <div ref={sheetRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '28px 28px 0 0',
        boxShadow: '0 -12px 60px rgba(0,0,0,0.15)',
        zIndex: 50, transform: 'translateY(100%)',
        maxHeight: '88vh', overflowY: 'auto', padding: '0 0 48px',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '14px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#e8e8e8' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            {selectedBarber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                {selectedBarber.photo ? (
                  <img src={selectedBarber.photo} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : null}
                <span style={{ fontSize: '11px', color: '#aaa', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>
                  {selectedBarber.name.toUpperCase()}
                </span>
              </div>
            )}
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', letterSpacing: '-0.5px' }}>
              {stepTitle[panelStep]}
            </div>
          </div>
          {panelStep !== 'success' && (
            <button onClick={() => setPanelOpen(false)} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#f5f5f5', border: 'none', cursor: 'pointer',
              fontSize: '18px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          )}
        </div>

        <div style={{ padding: '0 24px' }}>

          {/* SERVICE */}
          {panelStep === 'service' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map(s => {
                const isSel = selectedService?.id === s.id
                return (
                  <div key={s.id} onClick={() => setSelectedService(s)} style={{
                    background: isSel ? '#0a0a0a' : '#f8f8f6',
                    borderRadius: '18px', padding: '16px 18px',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isSel ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: isSel ? '#fff' : '#0a0a0a', fontFamily: "'Syne', sans-serif", marginBottom: '3px' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '11px', color: isSel ? '#888' : '#aaa', fontFamily: "'DM Mono', monospace" }}>
                        {s.duration} min · {s.description}
                      </div>
                    </div>
                    <div style={{
                      background: isSel ? '#fff' : '#0a0a0a',
                      borderRadius: '99px', padding: '6px 14px',
                      fontSize: '14px', fontWeight: '700',
                      color: isSel ? '#0a0a0a' : '#fff',
                      fontFamily: "'Syne', sans-serif",
                    }}>₱{Number(s.price).toFixed(0)}</div>
                  </div>
                )
              })}
              <button onClick={() => selectedService && setPanelStep('time')} style={{
                marginTop: '8px', width: '100%', padding: '18px',
                background: selectedService ? '#0a0a0a' : '#f0f0f0',
                color: selectedService ? '#fff' : '#ccc',
                border: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: '700',
                fontFamily: "'Syne', sans-serif", cursor: selectedService ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}>Continue →</button>
            </div>
          )}

          {/* TIME */}
          {panelStep === 'time' && (
            <div>
              <div style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace", marginBottom: '16px', letterSpacing: '0.08em' }}>
                {availableSlots.length} SLOTS AVAILABLE · {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {ALL_SLOTS.map(slot => {
                  const isAvail = availableSlots.includes(slot)
                  const isSel = selectedTime === slot
                  return (
                    <button key={slot} onClick={() => isAvail && setSelectedTime(slot)} style={{
                      padding: '13px 6px', borderRadius: '14px',
                      border: `2px solid ${isSel ? '#0a0a0a' : isAvail ? '#eee' : '#f5f5f5'}`,
                      background: isSel ? '#0a0a0a' : isAvail ? '#fff' : '#fafafa',
                      color: isSel ? '#fff' : isAvail ? '#0a0a0a' : '#ddd',
                      fontSize: '12px', fontFamily: "'DM Mono', monospace",
                      cursor: isAvail ? 'pointer' : 'default',
                      textDecoration: !isAvail ? 'line-through' : 'none',
                      transition: 'all 0.15s',
                    }}>{slot}</button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setPanelStep('service')} style={{
                  flex: 1, padding: '16px', background: '#f5f5f5', border: 'none',
                  borderRadius: '16px', color: '#888', fontFamily: "'Syne', sans-serif",
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                }}>← Back</button>
                <button onClick={() => selectedTime && setPanelStep('confirm')} style={{
                  flex: 2, padding: '16px',
                  background: selectedTime ? '#0a0a0a' : '#f0f0f0',
                  color: selectedTime ? '#fff' : '#ccc',
                  border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700',
                  fontFamily: "'Syne', sans-serif", cursor: selectedTime ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}>Continue →</button>
              </div>
            </div>
          )}

          {/* CONFIRM — Image 1 dark card style */}
          {panelStep === 'confirm' && (
            <div>
              <div style={{ background: '#0a0a0a', borderRadius: '22px', padding: '22px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #222' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#555', fontFamily: "'DM Mono', monospace", marginBottom: '5px', letterSpacing: '0.1em' }}>BARBER</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedBarber?.photo && <img src={selectedBarber.photo} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />}
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: "'Syne', sans-serif" }}>{selectedBarber?.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#555', fontFamily: "'DM Mono', monospace", marginBottom: '5px', letterSpacing: '0.1em' }}>SERVICE</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: "'Syne', sans-serif" }}>{selectedService?.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#555', fontFamily: "'DM Mono', monospace", marginBottom: '5px', letterSpacing: '0.1em' }}>DATE & TIME</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', fontFamily: "'DM Mono', monospace" }}>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: "'Syne', sans-serif' " }}>{selectedTime}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#555', fontFamily: "'DM Mono', monospace", marginBottom: '5px', letterSpacing: '0.1em' }}>TOTAL</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', fontFamily: "'Syne', sans-serif", letterSpacing: '-1px' }}>
                      ₱{Number(selectedService?.price || 0).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <input type="text" placeholder="Your name *" value={clientName} onChange={e => setClientName(e.target.value)} style={{
                  background: '#f8f8f6', border: '2px solid transparent', borderRadius: '14px',
                  padding: '16px 18px', color: '#0a0a0a', fontSize: '15px',
                  fontFamily: "'Syne', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box',
                }} />
                <input type="tel" placeholder="Phone (optional)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} style={{
                  background: '#f8f8f6', border: '2px solid transparent', borderRadius: '14px',
                  padding: '16px 18px', color: '#0a0a0a', fontSize: '15px',
                  fontFamily: "'Syne', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box',
                }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setPanelStep('time')} style={{
                  flex: 1, padding: '16px', background: '#f5f5f5', border: 'none',
                  borderRadius: '16px', color: '#888', fontFamily: "'Syne', sans-serif",
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                }}>← Back</button>
                <button onClick={handleBook} disabled={!clientName || isBooking} style={{
                  flex: 2, padding: '16px',
                  background: clientName && !isBooking ? '#0a0a0a' : '#f0f0f0',
                  color: clientName && !isBooking ? '#fff' : '#ccc',
                  border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '700',
                  fontFamily: "'Syne', sans-serif",
                  cursor: clientName && !isBooking ? 'pointer' : 'default', transition: 'all 0.2s',
                }}>{isBooking ? 'Booking...' : 'Confirm Booking'}</button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {panelStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '10px 0 10px' }}>
              <div style={{
                width: '80px', height: '80px', background: '#0a0a0a', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '32px',
              }}>✓</div>
              <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', marginBottom: '10px', letterSpacing: '-0.5px' }}>
                Booking Confirmed!
              </div>
              <div style={{ fontSize: '13px', color: '#aaa', fontFamily: "'DM Mono', monospace", lineHeight: '1.7', marginBottom: '32px' }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}<br/>
                {selectedTime} · {selectedBarber?.name}
              </div>
              <button onClick={resetBooking} style={{
                width: '100%', padding: '18px', background: '#0a0a0a', color: '#fff',
                border: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: '700',
                fontFamily: "'Syne', sans-serif", cursor: 'pointer',
              }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
/* @arkzen:components:shared:end */

/* @arkzen:animation */
import { gsap } from 'gsap'
import React from 'react'

const barbershopBookingAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.bs-greeting', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 })
    gsap.fromTo('.bs-date-strip', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 })
    gsap.fromTo('.bs-barber-row', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out', delay: 0.25 })
    gsap.fromTo('.bs-step', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.5 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
/* @arkzen:animation:end */

/* @arkzen:page:index */

const IndexPage = () => {
  const { barbers, services, setBarbers, setServices, setSelectedBarber, setPanelOpen, setPanelStep, resetBooking, isLoading, setLoading } = useBookingStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [bRes, sRes] = await Promise.all([
          fetch('/api/barbershop-booking/barbers'),
          fetch('/api/barbershop-booking/services'),
        ])
        const [b, s] = await Promise.all([bRes.json(), sRes.json()])
        setBarbers(b)
        setServices(s)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleSelectBarber = (barber: Barber) => {
    if (!barber.available) return
    resetBooking()
    setSelectedBarber(barber)
    setPanelStep('service')
    setPanelOpen(true)
  }

  const today = new Date()
  const greetingHour = today.getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        body { background: #f2f2ef; margin: 0; }
        ::-webkit-scrollbar { display: none; }
        input::placeholder { color: #bbb; }
        input:focus { border-color: #0a0a0a !important; outline: none; }
        @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        .skeleton { background: linear-gradient(90deg,#e8e8e3 25%,#f0f0eb 50%,#e8e8e3 75%); background-size:200% 100%; animation:shimmer 1.4s ease-in-out infinite; border-radius:20px; }
      `}</style>

      <div ref={pageRef} style={{ maxWidth: '480px', margin: '0 auto', background: '#f2f2ef', minHeight: '100vh', paddingBottom: '60px' }}>

        {/* Header — Image 2 style: Hello + Name bold, notification + avatar top right */}
        <div className="bs-greeting" style={{ padding: '56px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#aaa', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', marginBottom: '4px' }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', letterSpacing: '-1px', lineHeight: '1.05' }}>
              The Blade<br/>&amp; Co.
            </div>
          </div>
          {/* Notification + avatar — Image 2 style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
            <div style={{
              width: '40px', height: '40px', background: '#0a0a0a', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>✂</div>
          </div>
        </div>

        {/* Date Strip — Image 1 style */}
        <div className="bs-date-strip">
          <DateStrip />
        </div>

        {/* Barbers — Image 2 style: list with circular photos */}
        <div style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', letterSpacing: '-0.3px' }}>
              Our Barbers
            </span>
            <span style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
              {barbers.filter(b => b.available).length} AVAILABLE
            </span>
          </div>

          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '10px' }} />)
          ) : (
            barbers.map(barber => (
              <BarberRow key={barber.id} barber={barber} onSelect={() => handleSelectBarber(barber)} />
            ))
          )}
        </div>

        {/* How it works — Image 1 style: numbered list items */}
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', letterSpacing: '-0.3px', marginBottom: '16px' }}>
            How it works
          </div>
          {[
            { n: '01', t: 'Pick a date', d: 'Choose from the calendar above' },
            { n: '02', t: 'Select a barber', d: 'Tap any available barber' },
            { n: '03', t: 'Choose service & time', d: 'Pick what you need and when' },
            { n: '04', t: 'Confirm', d: 'Enter your name and done' },
          ].map(step => (
            <div key={step.n} className="bs-step" style={{
              background: '#fff', borderRadius: '16px', padding: '16px 18px',
              display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: '#ddd', minWidth: '24px' }}>{step.n}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#0a0a0a', marginBottom: '2px' }}>{step.t}</div>
                <div style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace" }}>{step.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomSheet />
    </>
  )
}
/* @arkzen:page:index:end */