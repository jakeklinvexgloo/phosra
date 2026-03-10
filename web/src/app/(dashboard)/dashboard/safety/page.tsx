"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function SafetyDashboard() {
  // For demo, use a hardcoded child ID — replace with auth context
  const childId = "demo-child-1"

  const recentEvents = useQuery(api.deviceEvents.getChildEvents, { childId, limit: 20 })
  const riskProfile = useQuery(api.childRiskProfiles.getByChild, { childId })
  const recentAlerts = useQuery(api.safetyAlerts.getForChild, { childId, limit: 10 })

  const riskColor =
    (riskProfile?.currentDayScore ?? 0) > 70 ? "text-red-600" :
    (riskProfile?.currentDayScore ?? 0) > 40 ? "text-yellow-600" : "text-green-600"

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Safety Monitor</h1>

      {/* Risk Score Card */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Today&apos;s Risk Score</div>
          <div className={`text-4xl font-bold ${riskColor}`}>
            {riskProfile?.currentDayScore ?? 0}/100
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Trend: {riskProfile?.weeklyTrend ?? "loading..."}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Alerts Today</div>
          <div className="text-4xl font-bold text-orange-500">
            {recentAlerts?.filter(a => a.sentAt > Date.now() - 86400000).length ?? 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Events Analyzed</div>
          <div className="text-4xl font-bold text-blue-500">
            {recentEvents?.length ?? 0}
          </div>
        </div>
      </div>

      {/* Active Patterns */}
      {riskProfile?.detectedPatterns && riskProfile.detectedPatterns.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2">Detected Patterns</h3>
          <ul className="list-disc list-inside text-orange-700 text-sm">
            {riskProfile.detectedPatterns.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {/* Recent Alerts with Debate Transcripts */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Recent Alerts</h2>
        {recentAlerts?.length === 0 && (
          <div className="text-gray-400 text-sm py-8 text-center">No alerts — all clear</div>
        )}
        {recentAlerts?.map(alert => (
          <AlertCard key={alert._id} alert={alert} />
        ))}
      </div>

      {/* Live Event Feed */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Live Activity Feed</h2>
        <div className="space-y-2">
          {recentEvents?.map(event => (
            <EventRow key={event._id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: any }) {
  const [expanded, setExpanded] = useState(false)
  const debate = useQuery(
    api.safetyDebates.getDebateForParent,
    alert.debateId ? { debateId: alert.debateId } : "skip"
  )

  return (
    <div className={`border rounded-xl p-4 mb-3 ${alert.severity === "emergency" ? "border-red-300 bg-red-50" : "border-yellow-300 bg-yellow-50"}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{alert.title}</div>
          <div className="text-sm text-gray-600 mt-1">{alert.summary}</div>
        </div>
        <div className="text-2xl font-bold text-gray-700">{alert.score}/100</div>
      </div>

      {debate && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 mt-2">
          {expanded ? "Hide" : "Show"} AI debate transcript
        </button>
      )}

      {expanded && debate && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="bg-red-100 rounded p-2">
            <strong>Safety Agent ({debate.strictAgentScore}/100):</strong> {debate.strictAgentReasoning}
          </div>
          <div className="bg-green-100 rounded p-2">
            <strong>Privacy Agent ({debate.liberalAgentScore}/100):</strong> {debate.liberalAgentReasoning}
          </div>
          <div className="bg-blue-100 rounded p-2">
            <strong>Context Agent ({debate.contextAgentScore}/100):</strong> {debate.contextAgentFacts}
          </div>
          <div className="bg-gray-100 rounded p-2 font-semibold">
            Weighted verdict: {debate.weightedScore}/100 — {debate.finalDecision}
          </div>
        </div>
      )}
    </div>
  )
}

function EventRow({ event }: { event: any }) {
  const scoreColor =
    (event.finalScore ?? 0) > 70 ? "text-red-500" :
    (event.finalScore ?? 0) > 40 ? "text-yellow-500" : "text-green-500"

  return (
    <div className="flex items-center gap-3 text-sm py-2 border-b border-gray-100">
      <span className="text-gray-400 text-xs w-16 shrink-0">
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">
        {event.eventType}
      </span>
      <span className="text-gray-700 truncate flex-1">{event.content}</span>
      {event.finalScore !== undefined && (
        <span className={`font-mono text-xs ${scoreColor} shrink-0`}>
          {event.finalScore}/100
        </span>
      )}
      <span className="text-xs text-gray-400 shrink-0">{event.analysisStage}</span>
    </div>
  )
}
