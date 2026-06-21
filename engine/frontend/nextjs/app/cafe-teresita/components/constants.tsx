// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — cafe-teresita
// Source: @arkzen:components (cafe-teresita)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:49.035Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, CalendarCheck, Clock, Coffee, CupSoda, ExternalLink, Facebook, Instagram, MapPin, Menu as MenuIcon, Soup, Star, X } from 'lucide-react'

export const NAV_LINKS = [
  { label: 'Homepage', href: '#ct-hero' },
  { label: 'Story', href: '#ct-about' },
  { label: 'Menu', href: '#ct-menu' },
  { label: 'Locations', href: '#ct-visit' },
  { label: 'Catering', href: '#ct-catering' },
  { label: 'Contact', href: '#ct-footer' },
]

export const MENU_CATEGORIES = ['Coffee & Drinks', 'Rice Meals', 'Snacks & Pastries']

export const MENU_ITEMS: Record<string, { id: string; name: string; desc: string; price: string; img: string; tag?: string }[]> = {
  'Coffee & Drinks': [
    {
      id: 'teresita-blend',
      name: 'Teresita House Blend',
      desc: 'Our signature drip brew — smooth, full-bodied, roasted locally for a warm Northern Mindanao morning.',
      price: '₱65',
      img: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=900&q=80',
      tag: 'Best Seller',
    },
    {
      id: 'iced-caramel-macchiato',
      name: 'Iced Caramel Macchiato',
      desc: 'Espresso, fresh milk, vanilla and caramel drizzle over ice — a sweet pick-me-up for warm afternoons.',
      price: '₱95',
      img: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?w=900&q=80',
    },
    {
      id: 'spanish-latte',
      name: 'Spanish Latte',
      desc: 'Espresso balanced with condensed milk for a rich, sweet, creamy classic.',
      price: '₱85',
      img: 'https://images.pexels.com/photos/4065980/pexels-photo-4065980.jpeg?w=900&q=80',
    },
    {
      id: 'fresh-buko-juice',
      name: 'Fresh Buko Juice',
      desc: 'Cold coconut water served straight from the shell — the coastal refresher.',
      price: '₱60',
      img: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?w=900&q=80',
    },
  ],
  'Rice Meals': [
    {
      id: 'fried-chicken-rice',
      name: 'Fried Chicken with Rice',
      desc: 'Crispy fried chicken (2 pcs) with steamed rice and house gravy — a Teresita favorite.',
      price: '₱120',
      img: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=900&q=80',
      tag: 'Crowd Favorite',
    },
    {
      id: 'pork-sisig',
      name: 'Sizzling Pork Sisig',
      desc: 'Chopped pork, peppers and onions sizzled on a hot plate with calamansi and rice.',
      price: '₱135',
      img: 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?w=900&q=80',
    },
    {
      id: 'beef-caldereta',
      name: 'Beef Caldereta',
      desc: 'Slow-cooked beef in tomato sauce with potatoes, carrots and bell pepper, served with rice.',
      price: '₱145',
      img: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?w=900&q=80',
    },
    {
      id: 'grilled-fish',
      name: 'Grilled Bangus Belly',
      desc: 'Marinated milkfish belly grilled to order, with rice and dip on the side.',
      price: '₱130',
      img: 'https://images.pexels.com/photos/8969237/pexels-photo-8969237.jpeg?w=900&q=80',
    },
  ],
  'Snacks & Pastries': [
    {
      id: 'banana-cue',
      name: 'Banana-Q',
      desc: 'Caramelized saba banana on a stick — a local merienda staple, sweet and sticky.',
      price: '₱30',
      img: 'https://images.pexels.com/photos/1166648/pexels-photo-1166648.jpeg?w=900&q=80',
    },
    {
      id: 'cheese-bread',
      name: 'Cheese Bread Roll',
      desc: 'Soft, freshly-baked bread roll topped with melted cheese.',
      price: '₱35',
      img: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?w=900&q=80',
    },
    {
      id: 'leche-flan',
      name: 'Leche Flan',
      desc: 'Silky steamed custard with caramel syrup — the classic Filipino dessert.',
      price: '₱45',
      img: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?w=900&q=80',
      tag: 'Sweet Pick',
    },
    {
      id: 'ensaymada',
      name: 'Ensaymada',
      desc: 'Buttery brioche roll topped with sugar and grated cheese.',
      price: '₱40',
      img: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?w=900&q=80',
    },
  ],
}

export const FEATURED_DRINKS = [
  {
    id: 'feat-1',
    name: 'House Blend',
    sub: 'Hot drip coffee',
    img: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=600&q=80',
  },
  {
    id: 'feat-2',
    name: 'Iced Macchiato',
    sub: 'Caramel + espresso',
    img: 'https://images.pexels.com/photos/5305639/pexels-photo-5305639.jpeg?w=600&q=80',
  },
  {
    id: 'feat-3',
    name: 'Buko Juice',
    sub: 'Fresh coconut',
    img: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?w=600&q=80',
  },
]

export const CATERING_PACKAGES = [
  {
    id: 'small-gathering',
    name: 'Small Gathering Package',
    guests: 'Good for 10–20 guests',
    price: 'Starts at ₱2,500',
    includes: ['Choice of 2 rice meal mains', 'Steamed rice', 'Iced tea or buko juice', 'Disposable wares'],
    img: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?w=1200&q=80',
  },
  {
    id: 'birthday-package',
    name: 'Birthday & Family Celebration',
    guests: 'Good for 20–40 guests',
    price: 'Starts at ₱5,000',
    includes: ['Choice of 3 mains', 'Pancit & dessert', 'Steamed rice', 'Drinks station', 'Basic table setup'],
    img: 'https://images.pexels.com/photos/6666644/pexels-photo-6666644.jpeg?w=1200&q=80',
    tag: 'Most Booked',
  },
  {
    id: 'event-package',
    name: 'Community Event Package',
    guests: 'Good for 50+ guests',
    price: 'Custom quote',
    includes: ['Full buffet menu', 'On-site coffee station', 'Staff service', 'Tent & seating add-ons available'],
    img: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?w=1200&q=80',
  },
]

export const VISIT_HOURS = [
  { day: 'Monday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Tuesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Wednesday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Thursday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Friday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Saturday', hours: '10:00 AM – 10:00 PM' },
  { day: 'Sunday', hours: '10:00 AM – 10:00 PM' },
]

export const TESTIMONIALS = [
  {
    quote: 'They got good taste with their menu — they provided the catering for my birthday. Very accessible, right along the national highway.',
    name: 'Local Guest',
    role: 'Google Review · 5★',
  },
  {
    quote: 'By far the only modest cafe in Kinoguitan. The sauces are delicious — hoping they keep improving the lighting for evening visits.',
    name: 'Local Guest',
    role: 'Google Review · 4★',
  },
]
