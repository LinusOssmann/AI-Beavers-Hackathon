# PWA Setup Guide

This guide will help you complete the PWA setup for TripMatch.

## 1. Generate VAPID Keys

VAPID keys are required for web push notifications. Generate them using one of these methods:

### Option A: Using npx (recommended)
```bash
npx web-push generate-vapid-keys
```

### Option B: Install globally
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy the generated keys and add them to your `.env` file:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

## 2. Create PWA Icons

You need to create two icon files in the `public/` folder:

- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels

You can use tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

Place the generated icons in the `public/` folder.

## 3. Testing Locally

To test PWA features locally, you need to run Next.js with HTTPS:

```bash
npm run dev -- --experimental-https
```

Or update your `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev --experimental-https"
  }
}
```

## 4. Browser Setup

- **Chrome/Edge**: Enable notifications when prompted
- **Safari**: Requires macOS 13+ or iOS 16.4+ for push notifications
- **Firefox**: Enable notifications when prompted

## 5. Using PWA Components

The PWA components are available in `components/pwa/`:

- `InstallPrompt` - Shows install prompt for iOS/Android using `@khmyznikov/pwa-install`

The `InstallPrompt` component uses the `@khmyznikov/pwa-install` web component which provides:
- Native-looking install dialogs for iOS, Android, and desktop browsers
- Automatic detection of installability
- Support for manual dialog triggering
- Local storage to remember user preferences

You can add the install prompt to any page:

```tsx
import { InstallPrompt } from '@/components/pwa/install-prompt'

export default function Page() {
  return (
    <div>
      <InstallPrompt />
    </div>
  )
}
```

### Advanced Usage

If you need to manually trigger the install dialog, you can access the component's methods via a ref:

```tsx
'use client'

import { useRef } from 'react'
import { InstallPrompt } from '@/components/pwa/install-prompt'

export default function Page() {
  const installRef = useRef<HTMLElementTagNameMap['pwa-install'] | null>(null)

  const handleShowDialog = () => {
    if (installRef.current) {
      installRef.current.showDialog(true)
    }
  }

  return (
    <div>
      <button onClick={handleShowDialog}>Show Install Dialog</button>
      <InstallPrompt />
    </div>
  )
}
```

## 6. Production Considerations

- Ensure your site is served over HTTPS (required for PWAs)
- Store push notification subscriptions in your database for persistence
- Update the service worker URL in `sw.js` if your domain changes
- Test on multiple devices and browsers

## Files Created

- `app/manifest.ts` - Web app manifest
- `public/sw.js` - Service worker
- `app/actions.ts` - Server actions for push notifications
- `components/pwa/install-prompt.tsx` - Install prompt UI using `@khmyznikov/pwa-install`
- `types/pwa-install.d.ts` - TypeScript definitions for pwa-install web component
- `next.config.ts` - Updated with security headers

## Dependencies Installed

- `@khmyznikov/pwa-install` - Web component for PWA install prompts
- `web-push` - For push notification functionality
