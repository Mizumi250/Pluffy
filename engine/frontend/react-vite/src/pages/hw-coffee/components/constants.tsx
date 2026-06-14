// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — hw-coffee [React+Vite]
// Source: @arkzen:components (hw-coffee)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:26:36.277Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, Award, Camera, ChevronDown, Clock, Coffee, ExternalLink, Facebook, Heart, Instagram, Leaf, Mail, MapPin, Menu, Minus, Moon, Music, Phone, Plus, Quote, Star, Sun, Twitter, Utensils, Wifi, X, Youtube, Zap } from 'lucide-react'

// ─── REAL H&W DATA (Gingoog City) ─────────────────────────────────────────────

export const NAV_LINKS = [
  { label: 'Story', href: '#story' },
  { label: 'Menu', href: '#menu' },
  { label: 'Process', href: '#process' },
  { label: 'Visits', href: '#visits' },
  { label: 'Contact', href: '#contact' },
]

export const MENU_ITEMS = [
  {
    category: 'Signature',
    items: [
      {
        name: 'H&W Signature Blend',
        desc: 'Our house espresso — deep chocolate, roasted hazelnut, lingering sweetness. The cup that started it all in Gingoog.',
        price: '₱120',
        badge: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      },
      {
        name: 'Iced Matcha Latte',
        desc: 'Ceremonial-grade matcha, cold oat milk, light sweetness — earthy, smooth, and refreshing.',
        price: '₱130',
        badge: 'Customer Fave',
        img: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=600&q=80',
      },
      {
        name: 'Cold Brew',
        desc: '18-hour steeped Mindanao beans, served over obsidian ice. Clean, bold, unapologetic.',
        price: '₱115',
        badge: null,
        img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
      },
      {
        name: 'Caramel Frappe',
        desc: 'Espresso, caramel syrup, milk, blended ice — sweet, rich, perfectly indulgent.',
        price: '₱135',
        badge: null,
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
      },
    ],
  },
  {
    category: 'Food',
    items: [
      {
        name: 'Chorizo Pasta',
        desc: 'House-made chorizo, al dente pasta, slow-cooked tomato — bold flavors that keep you coming back.',
        price: '₱180',
        badge: 'Must Try',
        img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
      },
      {
        name: 'Chicken Pasta',
        desc: 'Tender chicken, creamy sauce, herbs — comfort food elevated with care.',
        price: '₱165',
        badge: null,
        img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
      },
      {
        name: 'French Toast',
        desc: 'Thick-cut brioche, maple drizzle, powdered sugar — a breakfast staple elevated.',
        price: '₱95',
        badge: 'Morning Pick',
        img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80',
      },
      {
        name: 'Grilled Chicken Sandwich',
        desc: 'Herb-marinated chicken, toasted brioche bun, greens, aioli — simple, honest, great.',
        price: '₱150',
        badge: null,
        img: 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=600&q=80',
      },
    ],
  },
  {
    category: 'Drinks',
    items: [
      {
        name: 'Americano',
        desc: 'Double shot over hot water. Clean, clear, and powerful — the purist\'s choice.',
        price: '₱100',
        badge: null,
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      },
      {
        name: 'Cappuccino',
        desc: 'Equal parts espresso, steamed milk, and microfoam. Balanced and classic.',
        price: '₱115',
        badge: null,
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      },
      {
        name: 'Iced Coffee',
        desc: 'Double espresso over ice, with your choice of milk. Light, fast, essential.',
        price: '₱110',
        badge: null,
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
      },
      {
        name: 'Mango Shake',
        desc: 'Fresh Philippine mangoes blended with milk — a tropical escape in every sip.',
        price: '₱120',
        badge: 'Non-Coffee',
        img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
      },
    ],
  },
]

export const PROCESS_STEPS = [
  {
    num: '01',
    icon: Leaf,
    title: 'Sourced',
    sub: 'Northern Mindanao',
    desc: 'We work with local and regional farms across Mindanao — building relationships that ensure quality, sustainability, and pride at the root.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'Roasted',
    sub: 'Small Batch',
    desc: 'Every batch is roasted to a precise profile — unlocking each bean\'s natural character without masking it behind burnt dark roast.',
  },
  {
    num: '03',
    icon: Heart,
    title: 'Crafted',
    sub: 'With Intention',
    desc: 'Our baristas are trained with obsessive care — dialing in each brew method from espresso to cold brew for every single order.',
  },
  {
    num: '04',
    icon: Award,
    title: 'Served',
    sub: 'To You',
    desc: 'Every cup that leaves our bar is a promise: made with care, from Gingoog\'s best ingredients, straight to your hands.',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Mika R.',
    role: 'Regular, 2+ years',
    text: 'So far, the classiest coffeeshop in Gingoog. The chorizo pasta was exactly how I like it, and the americano was spot-on.',
    stars: 5,
  },
  {
    name: 'Carlo V.',
    role: 'Coffee Enthusiast',
    text: 'Great ambience, great coffee, great food. H&W has set the standard for what a café should feel like in this city.',
    stars: 5,
  },
  {
    name: 'Leah S.',
    role: 'Architect, CDO',
    text: 'They have a new branch in CDO now — bringing Gingoog\'s pride into the metropolis. Absolutely worth the visit.',
    stars: 5,
  },
  {
    name: 'Marco T.',
    role: 'First Time Visitor',
    text: 'Walked in expecting a regular café. Left floored by the atmosphere, the food, and the most reliable iced coffee I\'ve ever had.',
    stars: 5,
  },
  {
    name: 'Ana G.',
    role: 'Remote Worker',
    text: 'Clean, affordable, and the WiFi never drops. H&W is my second office. The french toast keeps me coming back.',
    stars: 5,
  },
  {
    name: 'Renz L.',
    role: 'CDO Branch Regular',
    text: 'The frappes here are something else. And the staff? Genuinely the friendliest service I\'ve encountered in any café.',
    stars: 5,
  },
]

export const MARQUEE_WORDS = [
  'Specialty Coffee', '·', 'Gingoog City', '·',
  'Artisan Brews', '·', 'Northern Mindanao', '·',
  'Chorizo Pasta', '·', 'French Toast', '·',
  'Cold Brew', '·', 'H&W Coffee', '·',
  '#1 in Gingoog', '·', 'Cagayan de Oro', '·',
]

export const FEATURES = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Music, label: 'Ambient Music' },
  { icon: Utensils, label: 'Full Food Menu' },
  { icon: Camera, label: 'Instagrammable' },
]

export const STATS = [
  { num: '4.7★', label: 'Google Rating' },
  { num: '180+', label: 'Reviews' },
  { num: '#1', label: 'Café in Gingoog' },
  { num: '2+', label: 'Branches' },
]

export const LOCATIONS = [
  {
    name: 'H&W — Gingoog Flagship',
    address: 'Gingoog City, Misamis Oriental, Northern Mindanao, Philippines',
    hours: 'Mon–Sun · 8AM–9PM',
    phone: 'Available on Facebook',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    tag: 'Original',
  },
  {
    name: 'H&W — CDO Branch',
    address: 'Cagayan de Oro City, Misamis Oriental, Philippines',
    hours: 'Mon–Sun · 9AM–10PM',
    phone: 'Available on Facebook',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    tag: 'New',
  },
]
