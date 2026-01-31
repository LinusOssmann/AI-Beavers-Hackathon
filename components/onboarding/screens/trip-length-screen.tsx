"use client"

interface TripLengthScreenProps {
  selected: string
  onSelect: (length: string) => void
  onNext: () => void
  onSkip: () => void
}

const LENGTH_OPTIONS = [
  { id: "weekend", label: "Weekend", detail: "2-3 days" },
  { id: "short", label: "Short break", detail: "4-5 days" },
  { id: "week", label: "One week", detail:"6-7 days" },
  { id: "longer", label: "Longer trips", detail: "> 7 days" },
  { id: "depends", label: "It depends", detail: null },
]

export function TripLengthScreen({ selected, onSelect, onNext, onSkip }: TripLengthScreenProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          How long do you usually like to travel?
        </h2>
      </div>

      <div className="space-y-3 flex-1">
        {LENGTH_OPTIONS.map((option) => {
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
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">{option.label}</span>
                {option.detail && (
                  <span className="text-sm text-muted-foreground">{option.detail}</span>
                )}
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
