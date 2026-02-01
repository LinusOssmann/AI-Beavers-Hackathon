'use server'

import * as webpush from 'web-push'
import type { PushSubscription } from 'web-push'
import { prisma } from '@/prisma/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
const vapidPrivate = process.env.VAPID_PRIVATE_KEY?.trim()
if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || 'mailto:your-email@example.com',
    vapidPublic,
    vapidPrivate
  )
}

// Store subscription as JSON-serializable object
let subscription: PushSubscription | null = null

export async function subscribeUser(sub: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  subscription = sub as PushSubscription
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    const payload = JSON.stringify({
      title: 'TripMatch Notification',
      body: message,
      icon: '/icon.ico',
    })
    await webpush.sendNotification(subscription, payload, {
      TTL: 60 * 60 * 24, // 24h so push services (e.g. FCM on Chrome) don't drop the message
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: {
    travelStyles?: string[]
    budget?: string
    tripLength?: string
    companion?: string
    departureLocation?: string
  }
) {
  try {
    // Verify the authenticated user matches the userId
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences,
        onboardingComplete: true,
        updatedAt: new Date()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return { success: false, error: 'Failed to save preferences' }
  }
}
