"use client"

interface TravelStyleScreenProps {
  selected: string[]
  onSelect: (styles: string[]) => void
  onNext: () => void
  onSkip: () => void
}

const TRAVEL_STYLES = [
  { id: "relax", label: "🧘 Relax & slow" },
  { id: "nature", label: "🏔️ Nature & outdoors" },
  { id: "culture", label: "🎭 Culture & cities" },
  { id: "adventure", label: "🏄 Adventure & active" },
  { id: "food", label: "🥨 Food & local life" },
]

export function TravelStyleScreen({ selected, onSelect, onNext, onSkip }: TravelStyleScreenProps) {
  const toggleStyle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id))
    } else if (selected.length < 2) {
      onSelect([...selected, id])
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          What kind of trips do you usually enjoy?
        </h2>
    
      </div>

      <div className="space-y-3 flex-1">
        {TRAVEL_STYLES.map((style) => {
          const isSelected = selected.includes(style.id)
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground"
              }`}
            >
              <span className="text-base font-medium">{style.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={onNext}
          disabled={selected.length === 0}
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
