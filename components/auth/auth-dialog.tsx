"use client";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface AuthDialogProps {
	mode: "signin" | "signup";
	isOpen: boolean;
	onClose: () => void;
	onToggleMode: () => void;
}

export function AuthDialog({
	mode,
	isOpen,
	onClose,
	onToggleMode,
}: AuthDialogProps) {
	const isSignIn = mode === "signin";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold">
						{isSignIn ? "Welcome back" : "Create an account"}
					</DialogTitle>
					<DialogDescription>
						{isSignIn
							? "Sign in to your account to continue"
							: "Get started with your personalized travel experience"}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4">
					{isSignIn ? (
						<SignInForm onSuccess={onClose} />
					) : (
						<SignUpForm onSuccess={onClose} />
					)}
				</div>

				<div className="mt-4 text-center text-sm">
					<span className="text-muted-foreground">
						{isSignIn
							? "Don't have an account?"
							: "Already have an account?"}
					</span>{" "}
					<button
						type="button"
						onClick={onToggleMode}
						className="text-primary hover:underline font-medium"
					>
						{isSignIn ? "Sign up" : "Sign in"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
