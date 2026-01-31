'use client'

import { useEffect, useRef } from 'react'
import '@khmyznikov/pwa-install'

export function InstallPrompt() {
  const pwaInstallRef = useRef<HTMLElementTagNameMap['pwa-install'] | null>(
    null
  )

  useEffect(() => {
    // Ensure the web component is loaded
    if (typeof window !== 'undefined') {
      import('@khmyznikov/pwa-install').catch((error) => {
        console.error('Failed to load pwa-install component:', error)
      })
    }
  }, [])

  return (
    <div className="pwa-install-prompt">
      <pwa-install
        ref={(el) => {
          pwaInstallRef.current = el
        }}
        install-description="Install TripMatch for a better travel planning experience!"
        name="TripMatch"
        description="AI-powered travel app to discover and plan your perfect trip"
        use-local-storage="true"
      ></pwa-install>
    </div>
  )
}
