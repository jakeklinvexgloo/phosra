"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, LogIn, Eye, Scale, UserPlus } from "lucide-react"

export interface TreeNode {
  phone: string
  name: string
  company: string
  referredBy: string
  isActive: boolean
  createdAt: string
  hasSession: boolean
  hasDeckView: boolean
  hasSafe: boolean
  safeAmountCents: number
  safeStatus: string
  children: TreeNode[]
}

function fmtDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function StatusDot({ node }: { node: TreeNode }) {
  if (node.hasSafe) {
    return <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Invested" />
  }
  if (node.hasSession || node.hasDeckView) {
    return <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Active" />
  }
  return <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" title="Invited" />
}

function TreeNodeComponent({ node, depth }: { node: TreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 hover:bg-muted/20 rounded px-2 transition-colors"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        <StatusDot node={node} />
        <span className="text-xs font-medium text-foreground">{node.name || node.phone}</span>
        {node.company && (
          <span className="text-[10px] text-muted-foreground">({node.company})</span>
        )}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {node.hasSession && (
            <span title="Has logged in"><LogIn className="w-3 h-3 text-blue-400" /></span>
          )}
          {node.hasDeckView && (
            <span title="Viewed deck"><Eye className="w-3 h-3 text-amber-400" /></span>
          )}
          {node.hasSafe && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-green-500">
              <Scale className="w-3 h-3" />
              {fmtDollars(node.safeAmountCents)}
            </span>
          )}
          {node.children.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <UserPlus className="w-2.5 h-2.5" />
              {node.children.length}
            </span>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent key={child.phone} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReferralTree({ roots }: { roots: TreeNode[] }) {
  if (roots.length === 0) {
    return (
      <div className="plaid-card text-center py-8">
        <UserPlus className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No referral chains yet</p>
      </div>
    )
  }

  return (
    <div className="plaid-card p-2">
      <div className="flex items-center gap-4 px-2 py-2 mb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" /> Invested
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> Active
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-gray-400" /> Invited
        </div>
      </div>
      {roots.map((root) => (
        <TreeNodeComponent key={root.phone} node={root} depth={0} />
      ))}
    </div>
  )
}
