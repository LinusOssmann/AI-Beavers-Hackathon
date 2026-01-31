"use client"

interface BudgetScreenProps {
  selected: string
  onSelect: (budget: string) => void
  onNext: () => void
  onSkip: () => void
}

const BUDGET_OPTIONS = [
  { id: "budget", symbol: "$", label: "Budget-friendly, flexible" },
  { id: "comfortable", symbol: "$$", label: "Comfortable, balanced" },
  { id: "premium", symbol: "$$$", label: "Premium, fewer limits" },
  { id: "unsure", symbol: "?", label: "Not sure yet" },
]

export function BudgetScreen({ selected, onSelect, onNext, onSkip }: BudgetScreenProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          What's your typical budget for a trip?
        </h2>
      </div>

      <div className="space-y-3 flex-1">
        {BUDGET_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-primary w-12">{option.symbol}</span>
                <span className="text-base text-foreground">{option.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={onNext}
          disabled={!selected}
          className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={onSkip}
          className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
