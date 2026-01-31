import '@khmyznikov/pwa-install'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pwa-install': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'manual-apple'?: string
          'manual-chrome'?: string
          'disable-chrome'?: string
          'disable-close'?: string
          'use-local-storage'?: string
          'install-description'?: string
          'disable-install-description'?: string
          'disable-screenshots'?: string
          'disable-screenshots-apple'?: string
          'disable-screenshots-chrome'?: string
          'disable-android-fallback'?: string
          'manifest-url'?: string
          name?: string
          description?: string
          icon?: string
          styles?: string
          'external-prompt-event'?: any
        },
        HTMLElement
      >
    }
  }

  interface HTMLElementTagNameMap {
    'pwa-install': PWAInstallElement
  }
}

export interface PWAInstallElement extends HTMLElement {
  showDialog: (force?: boolean) => void
  hideDialog: () => void
  install: () => void
  getInstalledRelatedApps: () => Promise<any[]>
  isDialogHidden: boolean
  isInstallAvailable: boolean
  isUnderStandaloneMode: boolean
  isAppleMobilePlatform: boolean
  isAppleDesktopPlatform: boolean
  isApple26Plus: boolean
  isRelatedAppsInstalled: boolean
  userChoiceResult: string
  styles: Record<string, string>
  externalPromptEvent: any
  addEventListener(
    type:
      | 'pwa-install-success-event'
      | 'pwa-install-fail-event'
      | 'pwa-install-available-event'
      | 'pwa-user-choice-result-event'
      | 'pwa-install-how-to-event'
      | 'pwa-install-gallery-event',
    listener: (event: CustomEvent) => void
  ): void
}

export {}
