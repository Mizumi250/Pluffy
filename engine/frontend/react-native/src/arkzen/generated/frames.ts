// ============================================================
// ARKZEN GENERATED — React Native Frame Registry v1.0
// Rebuilt from src/arkzen/generated/frames/ — DO NOT EDIT
// ============================================================

import React from 'react'


interface ArkzenFrameModule {
  screenOptions?: Record<string, unknown> | ((props: any) => Record<string, unknown>)
  Frame?: React.ComponentType<any>
}

const FRAMES: Record<string, ArkzenFrameModule> = {

}

const wrappedScreens = new WeakMap<React.ComponentType<any>, React.ComponentType<any>>()

/** Wraps a screen in its tatemono's Frame; returns the screen untouched when there is none. */
export function applyArkzenFrame(tatemono: string, Screen: React.ComponentType<any>): React.ComponentType<any> {
  const Frame = FRAMES[tatemono]?.Frame
  if (!Frame) return Screen
  let Wrapped = wrappedScreens.get(Screen)
  if (!Wrapped) {
    const Inner = Frame
    Wrapped = (props: any) => React.createElement(Inner, props, React.createElement(Screen, props))
    wrappedScreens.set(Screen, Wrapped)
  }
  return Wrapped
}

/** native-stack options for a tatemono's screens; undefined when it has no frame options. */
export function getArkzenFrameOptions(tatemono: string): ((props: any) => Record<string, unknown>) | undefined {
  const screenOptions = FRAMES[tatemono]?.screenOptions
  if (!screenOptions) return undefined
  return (props: any) => ({
    headerShown: false,
    ...(typeof screenOptions === 'function' ? screenOptions(props) : screenOptions),
  })
}
