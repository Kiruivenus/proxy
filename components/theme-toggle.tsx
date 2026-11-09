"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { GoogleIcon } from "@/components/ui/google-icon"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`h-8 w-8 rounded-full border border-border/60 bg-secondary/40 flex items-center justify-center shrink-0 ${
          className || ""
        }`}
      >
        <span className="w-3.5 h-3.5 rounded-full bg-muted-foreground/20" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark" || theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`h-8 w-8 rounded-full border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all duration-200 shrink-0 ${
        className || ""
      }`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <GoogleIcon
        name={isDark ? "light_mode" : "dark_mode"}
        size={16}
        className={isDark ? "text-amber-400" : "text-zinc-700 dark:text-zinc-300"}
      />
    </Button>
  )
}

