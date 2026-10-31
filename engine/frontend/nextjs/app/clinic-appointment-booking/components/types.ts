// ============================================================
// ARKZEN GENERATED TYPES — clinic-appointment-booking
// Source: @arkzen:components (clinic-appointment-booking)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:20:44.782Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { CalendarClock, XCircle } from 'lucide-react'

export interface Patient {
  id:          number
  first_name:  string
  last_name:   string
  email:       string
  phone_number:string | null
}

export interface Appointment {
  id:             number
  patient_id:     number
  doctor_name:    string
  date_time:      string
  status:         string | null
  created_at:     string
  updated_at:     string
}

export type FormState = 'idle' | 'saving' | 'saved' | 'error'
