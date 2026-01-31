import React from "react";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

import {
	Rubik as V0_Font_Rubik,
	IBM_Plex_Mono as V0_Font_IBM_Plex_Mono,
	Lora as V0_Font_Lora,
} from "next/font/google";

// Initialize fonts
const _rubik = V0_Font_Rubik({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800", "900"],
});
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
});
const _lora = V0_Font_Lora({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Easy Travels - Plan trips that fit you",
	description:
		"Answer a few quick questions and we'll suggest trips based on your style, budget, and mood.",
	generator: "v0.app",
	icons: {
		icon: [
			{
				url: "/icon-light-32x32.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/icon-dark-32x32.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/icon.svg",
				type: "image/svg+xml",
			},
		],
		apple: "/apple-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`font-sans antialiased`}>
				<ServiceWorkerRegister />
				{children}
				<Toaster />
				<Analytics />
			</body>
		</html>
	);
}
