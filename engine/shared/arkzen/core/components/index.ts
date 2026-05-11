'use client'

// ============================================================
// ARKZEN ENGINE — COMPONENTS INDEX
// All built-in engine components exported from one place
// Import in tatemonos: import { Modal, Toast } from '@arkzen/components'
//
// v5.1 — Export motion and AnimatePresence from here to avoid
// duplication. Tatemonos can import from components instead of
// directly from 'framer-motion'.
// ============================================================

export { Modal } from './Modal'
export { Drawer } from './Drawer'
export { Toast, useToast } from './Toast'
export { Dialog } from './Dialog'
export { Tooltip } from './Tooltip'
export { Breadcrumb } from './Breadcrumb'
export { Table } from './Table'
export { Form, Field } from './Form'
export { Pagination } from './Pagination'
export { Loading } from './Loading'
export { PageTransition } from './PageTransition'
export { Badge } from './Badge'
export { Avatar } from './Avatar'
export { EmptyState } from './EmptyState'

// ────────────────────────────────────────────
// MOTION EXPORTS (for tatemono animations)
// ────────────────────────────────────────────
export { motion, AnimatePresence } from 'framer-motion'
