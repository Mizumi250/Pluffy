// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — errors-test
// Source: @arkzen:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:16.532Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/arkzen/core/components/Toast'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import type { ErrorDef } from './types'


export const ERRORS: ErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request. Check the data you sent and try again.',         color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-100', btnColor: 'bg-yellow-700 hover:bg-yellow-800',  action: { label: 'Go back',      href: 'javascript:history.back()' } },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this. Please log in and try again.',                        color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100',   btnColor: 'bg-blue-700 hover:bg-blue-800',      action: { label: 'Sign in',      href: '/auth-test/login' } },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource. Contact an admin if you think this is wrong.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', btnColor: 'bg-orange-700 hover:bg-orange-800', action: { label: 'Go home',      href: '/' } },
  { code: 404, title: 'Not Found',           message: 'The page or resource you are looking for does not exist or has been moved.',                   color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-100', btnColor: 'bg-neutral-900 hover:bg-neutral-700', action: { label: 'Go home',     href: '/' } },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource. Refresh and try again.',           color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100', btnColor: 'bg-purple-700 hover:bg-purple-800',  action: { label: 'Refresh',      href: 'javascript:location.reload()' } },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid. Please check your input and try again.',                    color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-100',   btnColor: 'bg-pink-700 hover:bg-pink-800',      action: { label: 'Go back',      href: 'javascript:history.back()' } },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Please wait a moment before trying again.',                   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100',  btnColor: 'bg-amber-700 hover:bg-amber-800',    action: { label: 'Wait & retry', href: 'javascript:location.reload()' } },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end. We have been notified. Please try again shortly.',            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100',    btnColor: 'bg-red-700 hover:bg-red-800',        action: { label: 'Try again',    href: 'javascript:location.reload()' } },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance. We will be back soon.',                    color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-100',  btnColor: 'bg-slate-700 hover:bg-slate-800',    action: { label: 'Refresh',      href: 'javascript:location.reload()' } },
]
