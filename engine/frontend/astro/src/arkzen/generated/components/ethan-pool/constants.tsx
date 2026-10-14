// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — ethan-pool
// Source: @arkzen:components (ethan-pool)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:11.807Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'The Resort', href: '#resort' },
  { label: 'Rooftop Pool', href: '#rooftop' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Offers', href: '#offers' },
]

export const ROOMS = [
  {
    id: 'infinity-suite',
    name: 'Infinity Pool Suite',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=900&auto=format&fit=crop',
    tag: 'offer',
  },
  {
    id: 'morning-cabana',
    name: 'Morning Pool Cabana',
    img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'lagoon-villa',
    name: 'Lagoon Pool Villa',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'pool-view-room',
    name: 'Pool View Room',
    img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'rooftop-penthouse',
    name: 'Rooftop Pool Penthouse',
    img: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'garden-bungalow',
    name: 'Garden Pool Bungalow',
    img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'sunrise-suite',
    name: 'Sunrise Pool Suite',
    img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=900&auto=format&fit=crop',
  },
]

export const AMENITIES = [
  {
    label: 'Rooftop Infinity Pool',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Morning Lap Pool',
    img: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Poolside Spa & Wellness',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
  },
]

export const GALLERY_MEDIA = [
  'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=700&auto=format&fit=crop',
]

export const BLOG_POSTS = [
  {
    tag: 'EXPERIENCES',
    title: 'Morning swims: why sunrise is the best time at the Ethan Pool rooftop',
    img: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=700&auto=format&fit=crop',
    href: '#blog-1',
  },
  {
    tag: 'WELLNESS',
    title: 'A guide to our spa rituals: hydrotherapy, sauna and contrast baths',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=700&auto=format&fit=crop',
    href: '#blog-2',
  },
  {
    tag: 'FOOD & DRINK',
    title: 'Poolside cocktails: the new menu at the Lagoon Bar',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=700&auto=format&fit=crop',
    href: '#blog-3',
  },
  {
    tag: 'GETAWAYS',
    title: 'Family weekends: pool activities for every age',
    img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=700&auto=format&fit=crop',
    href: '#blog-4',
  },
  {
    tag: 'DESIGN',
    title: 'The architecture of water: how our infinity pools were designed',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=700&auto=format&fit=crop',
    href: '#blog-5',
  },
]

export const LOGOS = ['AQUA AWARDS', 'WELLNESS+', 'RESORT GUIDE', 'BLUE STAR', 'TRAVEL CIRCLE', 'SPA SELECT']

// ─── HELPERS ──────────────────────────────────────────────────────────────────
