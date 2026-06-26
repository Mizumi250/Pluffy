// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — errors-test [Expo]
// Source: @arkzen:native:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:08:57.760Z
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

/* @arkzen:resolved:import expo */
export const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

export const NATIVE_ERRORS: NativeErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request.',               color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-100'  },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this.',                    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource.',         color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100'  },
  { code: 404, title: 'Not Found',           message: 'The resource you are looking for does not exist.',            color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-100' },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource.', color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100'  },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid.',                          color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-100'    },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Wait before trying again.',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end.',                            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100'     },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance.',         color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-100'   },
]
