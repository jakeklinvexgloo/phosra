"use client"

import { useState } from "react"
import { RECIPES } from "@/lib/docs/recipes"

interface RecipeViewerProps {
  recipeId: string
}

export function RecipeViewer({ recipeId }: RecipeViewerProps) {
  const recipe = RECIPES.find(r => r.id === recipeId)

  if (!recipe) {
    return <div className="text-sm text-muted-foreground">Recipe not found: {recipeId}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with icon, title, tags */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{recipe.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-foreground">{recipe.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{recipe.summary}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {recipe.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/5 text-brand-green border border-accent/10">{tag}</span>
        ))}
      </div>

      {/* Scenario */}
      <div className="bg-accent/5 border border-accent/20 rounded p-4">
        <h4 className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-2">Scenario</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{recipe.scenario}</p>
      </div>

      {/* Flow Diagram */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Flow Diagram</h4>
        <div className="flex gap-2 mb-2 flex-wrap">
          {recipe.actors.map(actor => (
            <span key={actor} className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground border border-border">{actor}</span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <pre className="bg-zinc-900 text-green-400 rounded p-4 text-xs font-mono leading-relaxed whitespace-pre">{recipe.flowDiagram}</pre>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Step-by-Step</h4>
        <div className="space-y-4">
          {recipe.steps.map(step => (
            <div key={step.number} className="bg-muted/30 rounded p-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.number}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      step.method === "POST" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      step.method === "GET" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      step.method === "PUT" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}>{step.method}</span>
                    <code className="text-xs font-mono text-foreground">{step.endpoint}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {step.requestBody && (
                <div className="mt-3 sm:ml-9">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
                  <pre className="bg-zinc-900 text-blue-400 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.requestBody}</pre>
                </div>
              )}
              {step.responseBody && (
                <div className="mt-3 sm:ml-9">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response</p>
                  <pre className="bg-zinc-900 text-green-400 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">{step.responseBody}</pre>
                </div>
              )}
              <div className="mt-3 sm:ml-9 flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5">&rarr;</span>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{step.whatHappens}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="bg-accent/5 border border-accent/20 rounded p-4">
        <h4 className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-1">Key Takeaway</h4>
        <p className="text-sm text-foreground">{recipe.keyTeachingPoint}</p>
      </div>
    </div>
  )
}
