// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — hw-coffee [React+Vite]
// Source: @arkzen:components (hw-coffee)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T06:15:37.871Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, Award, ChevronDown, Clock, Coffee, Facebook, Heart, Instagram, Leaf, Mail, MapPin, Menu, Minus, Moon, Phone, Plus, Star, Sun, Twitter, X, Zap } from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

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
        desc: 'Our house espresso — dark chocolate, toasted hazelnut, lingering sweetness.',
        price: '₱120',
        badge: 'Bestseller',
        img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      },
      {
        name: 'White Velvet Latte',
        desc: 'Triple-shot espresso, steamed oat milk, vanilla bean — silky and bold.',
        price: '₱145',
        badge: 'New',
        img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
      },
      {
        name: 'Cold Brew Cascade',
        desc: '18-hour steeped single origin, served over obsidian ice.',
        price: '₱135',
        badge: null,
        img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
      },
    ],
  },
  {
    category: 'Pour-Over',
    items: [
      {
        name: 'Ethiopian Yirgacheffe',
        desc: 'Bright citrus, floral jasmine, with a tea-like clarity.',
        price: '₱160',
        badge: 'Single Origin',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      },
      {
        name: 'Colombian Huila',
        desc: 'Red apple, caramel, milk chocolate — perfectly balanced.',
        price: '₱155',
        badge: null,
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
      },
    ],
  },
  {
    category: 'Food',
    items: [
      {
        name: 'Butter Croissant',
        desc: 'Laminated 72-hour dough, baked golden every morning.',
        price: '₱85',
        badge: 'Fresh Daily',
        img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
      },
      {
        name: 'Ricotta Toast',
        desc: 'Sourdough, whipped ricotta, honey drizzle, microgreens.',
        price: '₱110',
        badge: null,
        img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80',
      },
    ],
  },
]

export const PROCESS_STEPS = [
  {
    num: '01',
    icon: Leaf,
    title: 'Sourced',
    sub: 'Direct Trade',
    desc: 'We work directly with farmers across Ethiopia, Colombia, and the Philippines — building relationships that ensure quality at the root.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'Roasted',
    sub: 'Small Batch',
    desc: 'Every batch is roasted in-house to a precise profile — unlocking each bean\'s natural character without masking it.',
  },
  {
    num: '03',
    icon: Heart,
    title: 'Brewed',
    sub: 'With Intention',
    desc: 'Our baristas are trained to dial in each brew method — pour-over, espresso, cold brew — with obsessive attention to detail.',
  },
  {
    num: '04',
    icon: Award,
    title: 'Served',
    sub: 'To You',
    desc: 'Every cup that leaves our bar is a promise — that what\'s in it was made with care, from source to your hands.',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Mika Reyes',
    role: 'Regular, 2 years',
    text: 'The White Velvet Latte is the reason I wake up. H&W feels like home — the kind you never want to leave.',
    stars: 5,
  },
  {
    name: 'Carlo Santos',
    role: 'Coffee Enthusiast',
    text: 'Serious specialty coffee without the pretension. The Ethiopian pour-over hits differently every morning.',
    stars: 5,
  },
  {
    name: 'Leah Tan',
    role: 'Remote Worker',
    text: 'I\'ve tried every café in the city. None of them have the atmosphere, the quality, or the care that H&W does.',
    stars: 5,
  },
  {
    name: 'Marco Villanueva',
    role: 'First Visit',
    text: 'Walked in on a whim. Left with a new ritual. The Cold Brew Cascade is something else entirely.',
    stars: 5,
  },
]

export const MARQUEE_WORDS = [
  'Specialty Coffee', '·', 'Small Batch Roasting', '·',
  'Direct Trade', '·', 'Pour-Over', '·', 'Cold Brew', '·',
  'Single Origin', '·', 'Artisan Brews', '·', 'H&W Coffee', '·',
]

export const LOCATIONS = [
  {
    name: 'H&W — Flagship',
    address: '12 Dela Rosa St., Makati City',
    hours: 'Mon–Fri 7AM–9PM · Sat–Sun 8AM–10PM',
    phone: '+63 2 8123 4567',
    img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    name: 'H&W — BGC Branch',
    address: '5th Ave corner 26th St., BGC, Taguig',
    hours: 'Mon–Sun 7AM–10PM',
    phone: '+63 2 8765 4321',
    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  },
]

export const STATS = [
  { num: '2016', label: 'Est.' },
  { num: '8+', label: 'Origins' },
  { num: '150+', label: 'Farmers' },
  { num: '4.9★', label: 'Avg Rating' },
]
