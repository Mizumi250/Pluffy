/* @arkzen:meta
name: barbershop-booking
version: 1.0.0
label: Barbershop Booking
auth: false
*/

/* @arkzen:config
theme: dark
mobile: true
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
      - { name: avatar_color, type: string }
      - { name: available, type: boolean, default: true }
      - { name: photo, type: string, length: 500, nullable: true }
    seeds:
      - { name: "Marcus Lee", specialty: "Fade & Taper", rating: 4.9, reviews: 214, avatar_initials: "ML", avatar_color: "#1a1a1a", available: true, photo: "https://i.pravatar.cc/150?img=11" }
      - { name: "James Rivera", specialty: "Classic Cut", rating: 4.7, reviews: 189, avatar_initials: "JR", avatar_color: "#2d2d2d", available: true, photo: "https://i.pravatar.cc/150?img=15" }
      - { name: "Carlo Santos", specialty: "Skin Fade", rating: 4.8, reviews: 156, avatar_initials: "CS", avatar_color: "#1a1a1a", available: true, photo: "https://i.pravatar.cc/150?img=33" }
      - { name: "Nico Reyes", specialty: "Beard Trim", rating: 4.6, reviews: 98, avatar_initials: "NR", avatar_color: "#2d2d2d", available: false, photo: "https://i.pravatar.cc/150?img=52" }

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

import React, { useState, useEffect, useRef } from 'react'
import { create } from 'zustand'
import { gsap } from 'gsap'

// ─── Types ───────────────────────────────────────────────
export interface Barber {
  id: number
  name: string
  specialty: string
  rating: number
  reviews: number
  avatar_initials: string
  avatar_color: string
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
  bookedSlots: string[]
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
  setSlots: (available: string[], booked: string[]) => void
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
  bookedSlots: [],
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
  setSlots: (availableSlots, bookedSlots) => set({ availableSlots, bookedSlots }),
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
  }),
}))

// ─── Date Carousel ───────────────────────────────────────
export function DateCarousel() {
  const { selectedDate, setSelectedDate } = useBookingStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif", color: '#0a0a0a' }}>
          {monthNames[new Date(selectedDate).getMonth()]} {new Date(selectedDate).getFullYear()}
        </span>
        <span style={{ fontSize: '12px', color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
          {dates.length} days ahead
        </span>
      </div>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {dates.map((d, i) => {
          const iso = formatDate(d)
          const isSelected = iso === selectedDate
          const isToday = i === 0
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              style={{
                minWidth: '52px',
                height: '72px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #0a0a0a' : '2px solid #e0e0db',
                background: isSelected ? '#0a0a0a' : '#fff',
                color: isSelected ? '#fff' : '#999',
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
              <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
                {isToday ? 'TODAY' : dayNames[d.getDay()]}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Syne', sans-serif" }}>
                {d.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Barber Card ─────────────────────────────────────────
export function BarberCard({ barber, onSelect }: { barber: Barber; onSelect: () => void }) {
  const { selectedBarber } = useBookingStore()
  const isSelected = selectedBarber?.id === barber.id
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onClick={barber.available ? onSelect : undefined}
      style={{
        background: isSelected ? '#0a0a0a' : '#fff',
        border: isSelected ? '2px solid #0a0a0a' : '2px solid #e8e8e3',
        borderRadius: '20px',
        padding: '18px',
        cursor: barber.available ? 'pointer' : 'not-allowed',
        opacity: barber.available ? 1 : 0.35,
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minWidth: '160px',
        flexShrink: 0,
        boxShadow: isSelected ? '0 8px 32px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {barber.photo ? (
          <img
            src={barber.photo}
            alt={barber.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: isSelected ? '#fff' : '#f0f0eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700',
            color: isSelected ? '#0a0a0a' : '#999',
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '0.05em',
          }}>
            {barber.avatar_initials}
          </div>
        )}
        {!barber.available && (
          <span style={{
            fontSize: '9px',
            background: '#f0f0eb',
            color: '#bbb',
            padding: '3px 8px',
            borderRadius: '99px',
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.08em',
          }}>BUSY</span>
        )}
        {isSelected && barber.available && (
          <div style={{
            width: '20px', height: '20px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div style={{
          fontSize: '15px',
          fontWeight: '700',
          fontFamily: "'Syne', sans-serif",
          color: isSelected ? '#fff' : '#0a0a0a',
          marginBottom: '3px',
          letterSpacing: '-0.3px',
        }}>{barber.name}</div>
        <div style={{
          fontSize: '11px',
          color: isSelected ? '#aaa' : '#999',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.05em',
        }}>{barber.specialty}</div>
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#000' : '#fff', fontFamily: "'Syne', sans-serif" }}>
          ★ {barber.rating}
        </span>
        <span style={{ fontSize: '10px', color: isSelected ? '#666' : '#444', fontFamily: "'DM Mono', monospace" }}>
          ({barber.reviews})
        </span>
      </div>
    </div>
  )
}

// ─── Bottom Sheet ─────────────────────────────────────────
export function BottomSheet() {
  const {
    panelOpen, panelStep, selectedBarber, selectedService, selectedTime,
    selectedDate, availableSlots, bookedSlots, services, clientName, clientPhone,
    isBooking,
    setPanelOpen, setPanelStep, setSelectedService, setSelectedTime,
    setClientName, setClientPhone, setBooking, setSlots,
    resetBooking,
  } = useBookingStore()

  const sheetRef  = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sheetRef.current || !overlayRef.current) return
    if (panelOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      gsap.fromTo(sheetRef.current,
        { y: '100%' },
        { y: '0%', duration: 0.4, ease: 'power3.out' }
      )
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 })
      gsap.to(sheetRef.current, { y: '100%', duration: 0.3, ease: 'power3.in' })
    }
  }, [panelOpen])

  // Load slots when barber or date changes
  useEffect(() => {
    if (!selectedBarber || !selectedDate || !panelOpen) return
    if (panelStep === 'time') {
      fetch(`/api/barbershop-booking/bookings/slots?barber_id=${selectedBarber.id}&date=${selectedDate}`)
        .then(r => r.json())
        .then(d => setSlots(d.slots || [], d.booked || []))
        .catch(() => setSlots([], []))
    }
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

  const stepTitle = {
    service: 'Choose a Service',
    time: 'Pick a Time',
    confirm: 'Confirm Booking',
    success: 'You\'re All Set!',
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={() => { if (panelStep !== 'success') setPanelOpen(false) }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          opacity: 0,
          pointerEvents: panelOpen ? 'auto' : 'none',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: '#fff',
          borderTop: '1px solid #eee',
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          zIndex: 50,
          transform: 'translateY(100%)',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '0 0 40px',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '4px' }}>
              {selectedBarber?.name?.toUpperCase()}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}>
              {stepTitle[panelStep]}
            </div>
          </div>
          {panelStep !== 'success' && (
            <button
              onClick={() => setPanelOpen(false)}
              style={{ background: '#f5f5f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#999', cursor: 'pointer', fontSize: '16px' }}
            >×</button>
          )}
        </div>

        <div style={{ padding: '24px' }}>

          {/* STEP: SERVICE */}
          {panelStep === 'service' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map(s => {
                const isSelected = selectedService?.id === s.id
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    style={{
                      background: isSelected ? '#0a0a0a' : '#f8f8f4',
                      border: `2px solid ${isSelected ? '#0a0a0a' : '#eee'}`,
                      borderRadius: '16px',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: isSelected ? '#000' : '#fff', fontFamily: "'Syne', sans-serif", marginBottom: '3px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: isSelected ? '#555' : '#444', fontFamily: "'DM Mono', monospace" }}>{s.duration} min · {s.description}</div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: isSelected ? '#000' : '#fff', fontFamily: "'Syne', sans-serif" }}>
                      ₱{Number(s.price).toFixed(0)}
                    </div>
                  </div>
                )
              })}

              <button
                onClick={() => { if (selectedService) setPanelStep('time') }}
                disabled={!selectedService}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '18px',
                  background: selectedService ? '#0a0a0a' : '#f0f0eb',
                  color: selectedService ? '#fff' : '#ccc',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: "'Syne', sans-serif",
                  cursor: selectedService ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  letterSpacing: '-0.3px',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP: TIME */}
          {panelStep === 'time' && (
            <div>
              <div style={{ fontSize: '12px', color: '#555', fontFamily: "'DM Mono', monospace", marginBottom: '16px', letterSpacing: '0.08em' }}>
                {availableSlots.length} SLOTS AVAILABLE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'].map(slot => {
                  const isAvail = availableSlots.includes(slot)
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvail && setSelectedTime(slot)}
                      disabled={!isAvail}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#0a0a0a' : isAvail ? '#e8e8e3' : '#f0f0eb'}`,
                        background: isSelected ? '#0a0a0a' : isAvail ? '#fff' : '#f8f8f4',
                        color: isSelected ? '#fff' : isAvail ? '#0a0a0a' : '#ccc',
                        fontSize: '12px',
                        fontFamily: "'DM Mono', monospace",
                        cursor: isAvail ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        textDecoration: !isAvail ? 'line-through' : 'none',
                      }}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setPanelStep('service')}
                  style={{ flex: 1, padding: '16px', background: '#f5f5f0', border: '2px solid #eee', borderRadius: '14px', color: '#999', fontFamily: "'Syne', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >← Back</button>
                <button
                  onClick={() => { if (selectedTime) setPanelStep('confirm') }}
                  disabled={!selectedTime}
                  style={{
                    flex: 2, padding: '16px',
                    background: selectedTime ? '#0a0a0a' : '#f0f0eb',
                    color: selectedTime ? '#fff' : '#ccc',
                    border: 'none', borderRadius: '14px',
                    fontSize: '15px', fontWeight: '700',
                    fontFamily: "'Syne', sans-serif",
                    cursor: selectedTime ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: CONFIRM */}
          {panelStep === 'confirm' && (
            <div>
              {/* Summary card */}
              <div style={{ background: '#111', border: '2px solid #1e1e1e', borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1e1e1e' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#aaa', fontFamily: "'DM Mono', monospace", marginBottom: '4px' }}>BARBER</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#0a0a0a' }}>{selectedBarber?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', fontFamily: "'DM Mono', monospace", marginBottom: '4px' }}>SERVICE</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#0a0a0a' }}>{selectedService?.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#aaa', fontFamily: "'DM Mono', monospace", marginBottom: '4px' }}>DATE & TIME</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: "'DM Mono', monospace', color: '#ccc" }}>
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {selectedTime}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', fontFamily: "'DM Mono', monospace", marginBottom: '4px' }}>TOTAL</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Syne', sans-serif" }}>₱{Number(selectedService?.price || 0).toFixed(0)}</div>
                  </div>
                </div>
              </div>

              {/* Client info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Your name *"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  style={{
                    background: '#f8f8f4', border: '2px solid #eee', borderRadius: '14px',
                    padding: '16px 18px', color: '#0a0a0a', fontSize: '15px',
                    fontFamily: "'Syne', sans-serif", outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  style={{
                    background: '#f8f8f4', border: '2px solid #eee', borderRadius: '14px',
                    padding: '16px 18px', color: '#0a0a0a', fontSize: '15px',
                    fontFamily: "'Syne', sans-serif", outline: 'none',
                    width: '100%', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setPanelStep('time')}
                  style={{ flex: 1, padding: '16px', background: '#f5f5f0', border: '2px solid #eee', borderRadius: '14px', color: '#999', fontFamily: "'Syne', sans-serif", fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >← Back</button>
                <button
                  onClick={handleBook}
                  disabled={!clientName || isBooking}
                  style={{
                    flex: 2, padding: '16px',
                    background: clientName && !isBooking ? '#0a0a0a' : '#f0f0eb',
                    color: clientName && !isBooking ? '#fff' : '#ccc',
                    border: 'none', borderRadius: '14px',
                    fontSize: '15px', fontWeight: '700',
                    fontFamily: "'Syne', sans-serif",
                    cursor: clientName && !isBooking ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {panelStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
              <div style={{
                width: '72px', height: '72px',
                background: '#0a0a0a',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
              }}>✓</div>
              <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: "'Syne', sans-serif", marginBottom: '8px', letterSpacing: '-0.5px' }}>
                Booking Confirmed!
              </div>
              <div style={{ fontSize: '13px', color: '#555', fontFamily: "'DM Mono', monospace", lineHeight: '1.6', marginBottom: '32px' }}>
                See you on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}<br/>
                at {selectedTime} with {selectedBarber?.name}
              </div>
              <button
                onClick={resetBooking}
                style={{
                  width: '100%', padding: '18px',
                  background: '#0a0a0a', color: '#fff',
                  border: 'none', borderRadius: '16px',
                  fontSize: '15px', fontWeight: '700',
                  fontFamily: "'Syne', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
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
    gsap.fromTo('.bs-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 })
    gsap.fromTo('.bs-icon', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.25 })
    gsap.fromTo('.bs-barber-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.3 })
    gsap.fromTo('.bs-step', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.5 })
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

/* @arkzen:animation:end */

/* @arkzen:page:index */


const IndexPage = () => {
  const {
    barbers, services, selectedBarber,
    setBarbers, setServices, setSelectedBarber,
    setPanelOpen, setPanelStep, resetBooking,
    isLoading, setLoading,
  } = useBookingStore()

  const titleRef   = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 }
    )
    gsap.fromTo(subtitleRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.25 }
    )
  }, [])

  useEffect(() => {
    if (!cardsRef.current || barbers.length === 0) return
    const cards = cardsRef.current.querySelectorAll('.barber-card-wrap')
    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
    )
  }, [barbers])

  const handleSelectBarber = (barber: Barber) => {
    if (!barber.available) return
    setSelectedBarber(barber)
    resetBooking()
    setSelectedBarber(barber)
    setPanelStep('service')
    setPanelOpen(true)
  }

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
  .barbershop-root { background: #f5f5f0; min-height: 100vh; color: #0a0a0a; overflow-x: hidden; }
  ::-webkit-scrollbar { display: none; }
  input::placeholder { color: #aaa; }
  input:focus { border-color: #0a0a0a !important; outline: none; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .skeleton { background: linear-gradient(90deg, #e8e8e3 25%, #f0f0eb 50%, #e8e8e3 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
`}</style>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 0 100px',
        minHeight: '100vh',
        background: '#f5f5f0',
      }}>

        {/* Top bar */}
        <div style={{
          padding: '56px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '36px',
        }}>
          <div ref={titleRef} className="bs-header" style={{ opacity: 0 }}>
            <div style={{
              fontSize: '11px',
              color: '#bbb',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.18em',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}>Book an Appointment</div>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-1.5px',
              lineHeight: '1.05',
              color: '#0a0a0a',
            }}>The Blade<br/><span style={{ color: '#0a0a0a' }}>&amp; Co.</span></div>
          </div>
          <div ref={subtitleRef} className="bs-icon" style={{ opacity: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{
              width: '44px', height: '44px',
              background: '#0a0a0a',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>✂</div>
            <div style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
              Est. 2020
            </div>
          </div>
        </div>

        {/* Date Carousel */}
        <div style={{ padding: '0 24px' }}>
          <DateCarousel />
        </div>

        {/* Barbers section */}
        <div style={{ padding: '0 24px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px', color: '#0a0a0a' }}>
              Our Barbers
            </span>
            <span style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
              {barbers.filter(b => b.available).length} AVAILABLE
            </span>
          </div>
        </div>

        {/* Barber cards horizontal scroll */}
        <div
          ref={cardsRef}
          style={{
            display: 'flex',
            gap: '12px',
            padding: '0 24px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            marginBottom: '32px',
          }}
        >
          {isLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="skeleton" style={{
                minWidth: '160px', height: '160px',
                borderRadius: '20px',
                border: 'none',
              }} />
            ))
          ) : (
            barbers.map(barber => (
              <div key={barber.id} className="barber-card-wrap bs-barber-card" style={{ opacity: 0 }}>
                <BarberCard barber={barber} onSelect={() => handleSelectBarber(barber)} />
              </div>
            ))
          )}
        </div>

        {/* How it works */}
        <div style={{ padding: '0 24px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: "'Syne', sans-serif", marginBottom: '16px', letterSpacing: '-0.3px', color: '#0a0a0a' }}>
            How it works
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '01', t: 'Pick a date', d: 'Choose your preferred day above' },
              { n: '02', t: 'Select a barber', d: 'Tap any available barber card' },
              { n: '03', t: 'Choose service & time', d: 'Pick what you need and when' },
              { n: '04', t: 'Confirm', d: 'Enter your name and you\'re done' },
            ].map(step => (
              <div key={step.n} style={{
                background: '#fff',
                border: '2px solid #eee',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontFamily: "'DM Mono', monospace",
                  color: '#ccc',
                  minWidth: '24px',
                  letterSpacing: '0.05em',
                }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: "'Syne', sans-serif", marginBottom: '2px', color: '#0a0a0a' }}>{step.t}</div>
                  <div style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace" }}>{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomSheet />
    </>
  )
}

/* @arkzen:page:index:end */