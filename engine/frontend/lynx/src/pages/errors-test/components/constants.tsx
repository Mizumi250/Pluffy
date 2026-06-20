// ============================================================
// ARKZEN GENERATED LYNX SHARED CONSTANTS — errors-test
// Source: @arkzen:native:components:lynx:* (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.886Z
// ============================================================

import React, { ScrollView, Text, TouchableOpacity, View, useState } from '@lynx-js/react'

export const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

export const LYNX_ERRORS: LynxErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request.',               color: '#a16207', bg: '#fefce8' },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this.',                    color: '#1d4ed8', bg: '#eff6ff' },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource.',         color: '#c2410c', bg: '#fff7ed' },
  { code: 404, title: 'Not Found',           message: 'The resource you are looking for does not exist.',            color: '#404040', bg: '#fafafa' },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource.', color: '#7e22ce', bg: '#faf5ff' },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid.',                          color: '#be185d', bg: '#fdf2f8' },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Wait before trying again.',  color: '#b45309', bg: '#fffbeb' },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end.',                            color: '#b91c1c', bg: '#fef2f2' },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance.',         color: '#334155', bg: '#f8fafc' },
]
