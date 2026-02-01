"use client";

import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/android/android-launchericon-48-48.png"
							alt=""
							width={24}
							height={24}
							className="size-6 object-contain"
						/>
						<h1 className="text-xl font-semibold">TripMatch</h1>
					</Link>
				</div>
			</header>

			<main className="flex-1 flex items-center justify-center px-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center space-y-2">
						<h2 className="text-3xl font-bold">
							Create an account
						</h2>
						<p className="text-muted-foreground">
							Get started with your personalized travel experience
						</p>
					</div>

					<SignUpForm />

					<div className="text-center text-sm">
						<span className="text-muted-foreground">
							Already have an account?
						</span>{" "}
						<Link
							href="/sign-in"
							className="text-primary hover:underline font-medium"
						>
							Sign in
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
