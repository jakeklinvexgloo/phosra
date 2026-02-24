"use client"

import Link from "next/link"
import { RECIPES } from "@/lib/docs/recipes"

export function RecipeIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Real-World Recipes</h1>
      <p className="text-sm text-muted-foreground mb-6">
        End-to-end walkthroughs showing how the API pieces fit together for real scenarios — from a parent's action through the API to platform enforcement.
      </p>
      <div className="space-y-3">
        {RECIPES.map((recipe, index) => (
          <Link
            key={recipe.id}
            href={`/developers/recipes/${recipe.id}`}
            className="flex items-center gap-3 px-4 py-3 bg-card rounded border border-border hover:border-foreground/20 transition-colors group"
          >
            <span className="text-xl flex-shrink-0">{recipe.icon}</span>
            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">#{index + 1}</span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-foreground text-sm">{recipe.title}</span>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{recipe.summary}</p>
            </div>
            <div className="hidden sm:flex gap-1.5 flex-shrink-0">
              {recipe.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/5 text-brand-green border border-accent/10">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
