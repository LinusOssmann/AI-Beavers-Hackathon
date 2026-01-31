"use client"

import { Briefcase, Compass, Heart, User } from "lucide-react"

type NavTab = "explore" | "trips" | "favourites"

interface TopNavProps {
  activeTab?: NavTab
  onTabChange?: (tab: NavTab) => void
}

export function TopNav({
  activeTab = "explore",
  onTabChange,
}: TopNavProps) {
  const navItems = [
    { id: "explore" as const, label: "Explore", icon: Compass },
    { id: "trips" as const, label: "My Trips", icon: Briefcase },
    { id: "favourites" as const, label: "Favourites", icon: Heart },
  ]

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 xl:px-32 py-1">
        <div className="flex items-center justify-between h-14">
          {/* LEFT: LOGO */}
          <span className="text-lg font-semibold text-foreground">
            Easy Travels
          </span>

          {/* CENTER: NAV */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* RIGHT: PROFILE */}
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
