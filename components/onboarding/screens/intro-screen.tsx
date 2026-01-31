"use client"

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight text-balance">
          Let's plan a trip that actually fits you
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Answer a few quick questions and we'll suggest trips based on your style, budget, and mood.
        </p>
      </div>
      
      <div className="mt-12">
        <button
          onClick={onStart}
          className="w-full bg-primary text-primary-foreground py-4 px-6 text-base font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Start
        </button>
      </div>
    </div>
  )
}
