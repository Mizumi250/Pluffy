import React from 'react'
import { createArkzenHub } from '../../../../../shared/arkzen/hub/Hub.js'

const Hub = createArkzenHub(React, {
  registryPath: '/arkzen/registry',
  platform: 'React + Inertia',
})

export default Hub
