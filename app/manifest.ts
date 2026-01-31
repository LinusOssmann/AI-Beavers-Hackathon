import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TripMatch - Discover Your Next Adventure',
    short_name: 'TripMatch',
    description: 'AI-powered travel app to discover and plan your perfect trip',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['travel', 'lifestyle'],
    orientation: 'portrait-primary',
    scope: '/',
    prefer_related_applications: false,
  }
}
