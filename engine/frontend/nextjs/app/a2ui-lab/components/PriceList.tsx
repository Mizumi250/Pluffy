'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PriceList
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:29.837Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useServices } from './hooks'
import { idr } from './utils'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'
import { StubCard } from './StubCard'

export const PriceList = ({ onShow }: { props: Props; onShow: ShowFn }) => {
  const { services, loading, error, retry } = useServices()
  return (
    <StubCard title="Price list">
      {loading && <p className="muted">Loading prices...</p>}
      {error && (
        <p role="alert" className="err">{error} <button type="button" className="link" onClick={retry}>Try again</button></p>
      )}
      <ul className="rows">
        {services.map(item => (
          <li key={item.id} className="row">
            <div>
              <p className="row-name">{item?.name}</p>
              <p className="muted small">{item?.minutes} min{item?.note ? ', ' + item.note : ''}</p>
            </div>
            <p className="price">{idr(item?.price_idr)}</p>
            <button
              type="button"
              className="ghost"
              aria-label={'Book ' + item?.name}
              onClick={() => onShow({ component: 'booking_form', props: { service: item?.name ?? '' }, say: 'Pick a day for ' + item?.name + '.', suggestions: [] })}
            >
              Book
            </button>
          </li>
        ))}
      </ul>
    </StubCard>
  )
}
