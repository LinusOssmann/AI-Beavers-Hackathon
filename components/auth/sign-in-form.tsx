"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
	onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInFormData) => {
		setIsLoading(true);

		try {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to sign in");
				return;
			}

			toast.success("Welcome back!");
			onSuccess?.();
			router.push("/dashboard");
			router.refresh();
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					{...register("email")}
					disabled={isLoading}
				/>
				{errors.email && (
					<p className="text-sm text-destructive">
						{errors.email.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					placeholder="••••••••"
					{...register("password")}
					disabled={isLoading}
				/>
				{errors.password && (
					<p className="text-sm text-destructive">
						{errors.password.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Signing in..." : "Sign In"}
			</Button>
		</form>
	);
}
