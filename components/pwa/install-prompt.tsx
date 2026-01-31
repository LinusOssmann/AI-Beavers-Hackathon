'use client'

import { useEffect, useRef, useState } from 'react'
import '@khmyznikov/pwa-install'

export function InstallPrompt() {
  const pwaInstallRef = useRef<HTMLElementTagNameMap['pwa-install'] | null>(
    null
  )
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Ensure the web component is loaded
    if (typeof window !== 'undefined') {
      import('@khmyznikov/pwa-install')
        .then(() => {
          setIsLoaded(true)
          // Small delay to ensure web component is ready
          setTimeout(() => {
            if (pwaInstallRef.current) {
              // Log component state for debugging
              console.log('PWA Install Component State:', {
                isInstallAvailable:
                  pwaInstallRef.current.isInstallAvailable,
                isUnderStandaloneMode:
                  pwaInstallRef.current.isUnderStandaloneMode,
                isDialogHidden: pwaInstallRef.current.isDialogHidden,
              })
            }
          }, 1000)
        })
        .catch((error) => {
          console.error('Failed to load pwa-install component:', error)
        })
    }
  }, [])

  const handleManualShow = () => {
    if (pwaInstallRef.current) {
      pwaInstallRef.current.showDialog(true)
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <div className="pwa-install-prompt" style={{ marginBottom: '20px' }}>
      <pwa-install
        ref={(el) => {
          pwaInstallRef.current = el
        }}
        install-description="Install TripMatch for a better travel planning experience!"
        name="TripMatch"
        description="AI-powered travel app to discover and plan your perfect trip"
        icon="/android/android-launchericon-512-512.png"
        use-local-storage="true"
        manual-chrome="true"
      ></pwa-install>
      <button
        onClick={handleManualShow}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Show Install Dialog
      </button>
    </div>
  )
}
