/**
 * Push notification subscribe/unsubscribe buttons.
 * Uses the service worker and VAPID key to subscribe and calls server actions to store or clear the subscription.
 */
'use client'

import { sendNotification, subscribeUser, unsubscribeUser } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

/** Returns the current push subscription from the service worker, or null if not supported or not subscribed. */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  // This waits for the service worker to be ready.
  const reg = await navigator.serviceWorker.ready;
  return await reg.pushManager.getSubscription();
}


export function PushNotificationButtons() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false)

  async function onEnable() {
    setLoading(true)

    try {
      if (!VAPID || !('PushManager' in window)) {
        toast.error('Push notifications are not supported in this browser.')
        return
      }

      if ((await Notification.requestPermission()) !== 'granted') {
        toast.error('Permission denied.')
        return
      }

      // Chrome on macOS: use updateViaCache: 'none' so the active SW is current before subscribing
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      await reg.update()
      await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(VAPID) as BufferSource,
      })

      const ok = await subscribeUser({
        endpoint: subscription.endpoint,
        keys: { p256dh: bufferToBase64Url(subscription.getKey('p256dh')!), auth: bufferToBase64Url(subscription.getKey('auth')!) },
      })

      if (!ok.success) throw new Error('There was an error subscribing to push notifications.');

      setSubscription(subscription)
      await sendNotification("You're now getting notifications!");
      toast.success("You're now getting notifications!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function onDisable() {
    setLoading(true)

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) await sub.unsubscribe()
      }

      await unsubscribeUser()
      setSubscription(null)
      toast.success('Notifications disabled.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!VAPID) return null

  useEffect(() => {
    getCurrentPushSubscription().then((subscription) => {
      setSubscription(subscription);
    });
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 justify-center">
        {!subscription ? (
          <Button variant="outline" className="w-full" onClick={onEnable} disabled={loading}>
            <Bell className="mr-2 size-4 shrink-0" strokeWidth={2.5} />
            Get Notifications
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={onDisable} disabled={loading}>
            <BellOff className="mr-2 size-4 shrink-0" strokeWidth={2.5} />
            Stop Notifications
          </Button>
        )}
      </div>
    </div>
  )
}
