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

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/[A-Z]/,
				"Password must contain at least one uppercase letter",
			)
			.regex(
				/[a-z]/,
				"Password must contain at least one lowercase letter",
			)
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
	onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
	});

	const onSubmit = async (data: SignUpFormData) => {
		setIsLoading(true);

		try {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to create account");
				return;
			}

			toast.success("Account created successfully!");
			onSuccess?.();
			router.push("/dashboard");
			router.refresh();
		} catch (error) {
			console.error("Sign up error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="John Doe"
					{...register("name")}
					disabled={isLoading}
				/>
				{errors.name && (
					<p className="text-sm text-destructive">
						{errors.name.message}
					</p>
				)}
			</div>

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

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="••••••••"
					{...register("confirmPassword")}
					disabled={isLoading}
				/>
				{errors.confirmPassword && (
					<p className="text-sm text-destructive">
						{errors.confirmPassword.message}
					</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Creating account..." : "Sign Up"}
			</Button>
		</form>
	);
}
