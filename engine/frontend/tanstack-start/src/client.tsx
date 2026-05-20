import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { getRouter } from './router'
import './index.css'

const router = getRouter()
hydrateRoot(document, <StartClient router={router} />)