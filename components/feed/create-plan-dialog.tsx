"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreatePlanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreatePlan: (data: { title: string; description?: string }) => Promise<void>;
	userPreferences?: any;
}

export function CreatePlanDialog({
	open,
	onOpenChange,
	onCreatePlan,
	userPreferences,
}: CreatePlanDialogProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!title.trim()) return;

		setIsCreating(true);
		try {
			await onCreatePlan({
				title: title.trim(),
				description: description.trim() || undefined,
			});
			
			// Reset form
			setTitle("");
			setDescription("");
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to create plan:", error);
		} finally {
			setIsCreating(false);
		}
	};

	// Generate placeholder based on user preferences
	const getPlaceholder = () => {
		if (userPreferences?.travelStyles?.length > 0) {
			const style = userPreferences.travelStyles[0];
			const styleNames: Record<string, string> = {
				relax: "Relaxing Beach Getaway",
				nature: "Nature Adventure",
				culture: "Cultural Discovery",
				adventure: "Thrilling Adventure",
				food: "Culinary Journey",
			};
			return styleNames[style] || "My Next Trip";
		}
		return "My Next Trip";
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary" />
						Create New Travel Plan
					</DialogTitle>
					<DialogDescription>
						Give your trip a name and let AI suggest amazing destinations for you.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="title">
								Trip Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								placeholder={getPlaceholder()}
								value={title}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
								disabled={isCreating}
								required
								maxLength={100}
								autoFocus
							/>
							<p className="text-xs text-muted-foreground">
								Give your trip a memorable name
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description (optional)</Label>
							<Textarea
								id="description"
								placeholder="Add any specific preferences or notes for this trip..."
								value={description}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
								disabled={isCreating}
								rows={3}
								maxLength={500}
							/>
							<p className="text-xs text-muted-foreground">
								Share any special requirements or ideas
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!title.trim() || isCreating}
							className="gap-2"
						>
							{isCreating ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									Create & Get Suggestions
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
