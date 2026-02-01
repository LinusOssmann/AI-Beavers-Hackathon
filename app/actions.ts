/**
 * Server actions for PWA push subscriptions and user preferences.
 * Push subscription is stored in memory here; in production it would be persisted in a database.
 */
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { headers } from "next/headers";
import type { PushSubscription } from "web-push";
import * as webpush from "web-push";

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
const vapidPrivate = process.env.VAPID_PRIVATE_KEY?.trim();
if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:your-email@example.com",
    vapidPublic,
    vapidPrivate
  );
}

// Store subscription as JSON-serializable object
let subscription: PushSubscription | null = null;

/** Stores the push subscription (in memory here; use a DB in production). */
interface OnboardingPreferences {
  travelStyles?: string[];
  budget?: string;
  tripLength?: string;
  companion?: string;
  departureLocation?: string;
  additionalNotes?: string;
}

export async function subscribeUser(sub: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  subscription = sub as PushSubscription;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

/** Clears the stored push subscription. */
export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

/** Sends a push notification with the given message to the stored subscription. */
export async function sendNotification(message: string) {
  if (!subscription) {
    // Silently return if no subscription - user hasn't enabled notifications
    return { success: false, error: "No subscription available" };
  }

  try {
    const payload = JSON.stringify({
      title: "TripMatch Notification",
      body: message,
      icon: "/icon.ico",
    });
    await webpush.sendNotification(subscription, payload, {
      TTL: 60 * 60 * 24, // 24h so push services (e.g. FCM on Chrome) don't drop the message
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

/** Updates the authenticated user's preferences and marks onboarding complete. */
export async function updateUserPreferences(
  userId: string,
  preferences: OnboardingPreferences
) {
  try {
    // Verify the authenticated user matches the userId
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: preferences as any,
        onboardingComplete: true,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

function formatPreferencesForAI(preferences: OnboardingPreferences): string {
  return `
Travel Styles: ${preferences.travelStyles?.join(", ") || "Not specified"}
Budget: ${preferences.budget || "Not specified"}
Trip Length: ${preferences.tripLength || "Not specified"}
Traveling With: ${preferences.companion || "Not specified"}
Departure Location: ${preferences.departureLocation || "Not specified"}
Additional Notes: ${preferences.additionalNotes || "Not specified"}
  `.trim();
}

export async function generatePreferenceSummary(
  userId: string,
  preferences: OnboardingPreferences
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    // Verify the authenticated user matches the userId
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Format preferences into readable string
    const preferencesText = formatPreferencesForAI(preferences);

    // Call preference refiner endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/preference-refiner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: preferencesText }),
    });

    if (!response.ok) {
      throw new Error("Failed to start preference refiner");
    }

    const result = await response.json();
    return { success: true, taskId: result.responseId };
  } catch (error) {
    console.error("Error generating preference summary:", error);
    return { success: false, error: "Failed to generate summary" };
  }
}

export async function savePreferenceSummary(
  userId: string,
  summary: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { preferenceSummary: summary },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving preference summary:", error);
    return { success: false, error: "Failed to save summary" };
  }
}
