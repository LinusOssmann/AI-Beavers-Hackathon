"use client"

import { User, Users, Heart, Home, Dog } from "lucide-react"

interface CompanionScreenProps {
  selected: string
  onSelect: (companion: string) => void
  onNext: () => void
  onSkip: () => void
}

const COMPANION_OPTIONS = [
  { id: "solo", label: "Solo", icon: User },
  { id: "partner", label: "Partner", icon: Heart },
  { id: "friends", label: "Friends", icon: Users },
  { id: "family", label: "Family", icon: Home },
  { id: "pet", label: "My Pet", icon: Dog },
]

export function CompanionScreen({ selected, onSelect, onNext, onSkip }: CompanionScreenProps) {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Who do you usually travel with?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {COMPANION_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          const Icon = option.icon
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`flex flex-col items-center justify-center gap-3 px-5 py-6 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-foreground"}`} strokeWidth={1.5} />
              <span className="text-base font-medium">{option.label}</span>
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
