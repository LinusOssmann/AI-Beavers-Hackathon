'use client'

import { sendNotification, subscribeUser, unsubscribeUser } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()

function base64UrlToUint8Array(str: string): Uint8Array {
  const b = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = (4 - (b.length % 4)) % 4
  const bytes = atob(b + '='.repeat(pad))
  return new Uint8Array([...bytes].map((c) => c.charCodeAt(0)))
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function PushNotificationButtons() {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onEnable() {
    setMessage(null)
    setLoading(true)
    try {
      if (!VAPID || !('PushManager' in window)) {
        setMessage('Not supported.')
        return
      }
      if ((await Notification.requestPermission()) !== 'granted') {
        setMessage('Permission denied.')
        return
      }
      // Chrome on macOS: use updateViaCache: 'none' so the active SW is current before subscribing
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      await reg.update()
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(VAPID) as BufferSource,
      })
      const ok = await subscribeUser({
        endpoint: sub.endpoint,
        keys: { p256dh: bufferToBase64Url(sub.getKey('p256dh')!), auth: bufferToBase64Url(sub.getKey('auth')!) },
      })
      setMessage(ok.success ? 'Subscribed.' : 'Failed.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function onDisable() {
    setMessage(null)
    setLoading(true)
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }
      await unsubscribeUser()
      setMessage('Unsubscribed.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function onSendTest() {
    setMessage(null)
    setLoading(true)
    try {
      const ok = await sendNotification('Test from TripMatch')
      setMessage(ok.success ? 'Sent.' : (ok.error ?? 'Failed.'))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (!VAPID) return null

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={onEnable} disabled={loading}>
          Enable
        </Button>
        <Button variant="outline" size="sm" onClick={onDisable} disabled={loading}>
          Disable
        </Button>
        <Button variant="outline" size="sm" onClick={onSendTest} disabled={loading}>
          Send test
        </Button>
      </div>
      {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
      <p className="text-xs text-muted-foreground text-center mt-1">
        Chrome on Mac: allow notifications in System Settings → Notifications if they don’t appear.
      </p>
    </div>
  )
}
