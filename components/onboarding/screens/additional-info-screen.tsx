"use client"

interface AdditionalInfoScreenProps {
  value: string
  onChange: (notes: string) => void
  onComplete: () => void
  isLoading?: boolean
}

export function AdditionalInfoScreen({
  value,
  onChange,
  onComplete,
  isLoading: isSaving = false,
}: AdditionalInfoScreenProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg w-full mx-auto">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Anything else your AI travel agent should know? There are no limitations on what you write here.
        </h2>
        <p className="text-sm text-muted-foreground">
          Add any details that will help personalize your recommendations.
        </p>
      </div>

      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share anything you'd like us to consider..."
          rows={6}
          className="w-full bg-card text-foreground placeholder:text-muted-foreground p-4 rounded-lg border-2 border-border focus:border-primary focus:outline-none transition-colors text-base resize-none"
        />
      </div>

      <div className="mt-8">
        <button
          onClick={onComplete}
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving preferences..." : "See my travel ideas"}
        </button>
      </div>
    </div>
  )
}
