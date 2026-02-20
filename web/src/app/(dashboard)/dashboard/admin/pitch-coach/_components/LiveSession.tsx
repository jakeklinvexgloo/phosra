"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff, PhoneOff, Loader2, Video, Upload } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"
import type { PitchSession, TranscriptEntry } from "@/lib/admin/types"
import { PERSONA_META } from "@/lib/admin/types"

interface LiveSessionProps {
  session: PitchSession
  onEnd: () => Promise<void>
  onBack: () => void
}

export function LiveSession({ session, onEnd, onBack }: LiveSessionProps) {
  const { getToken } = useApi()
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [muted, setMuted] = useState(false)
  const [ending, setEnding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  const playbackCtxRef = useRef<AudioContext | null>(null)
  const nextPlayTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Timer
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [connected])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // Play PCM16 audio from base64 — queued sequentially to prevent overlap
  const playAudio = useCallback((base64Data: string) => {
    if (!playbackCtxRef.current) {
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 })
      nextPlayTimeRef.current = 0
    }
    const ctx = playbackCtxRef.current

    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    // PCM16 LE → Float32
    const int16 = new Int16Array(bytes.buffer)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000)
    buffer.getChannelData(0).set(float32)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    // Schedule this chunk right after the previous one ends
    const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + buffer.duration
  }, [])

  // Connect WebSocket and set up audio + video recording
  const connect = useCallback(async () => {
    try {
      setConnecting(true)
      setError(null)

      // Get auth token
      const token = (await getToken()) ?? undefined

      // Request microphone + camera access
      let videoStream: MediaStream | null = null
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        })
      } catch {
        // Fallback: audio only if camera is denied
        videoStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        setCameraEnabled(false)
      }

      videoStreamRef.current = videoStream
      streamRef.current = videoStream

      // Show self-preview
      if (videoRef.current && videoStream.getVideoTracks().length > 0) {
        videoRef.current.srcObject = videoStream
      }

      // Start MediaRecorder for the full stream (audio + video)
      try {
        const recorder = new MediaRecorder(videoStream, {
          mimeType: "video/webm;codecs=vp9,opus",
        })
        mediaRecorderRef.current = recorder
        recordedChunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        recorder.start(1000) // collect chunks every second
      } catch {
        // If VP9 isn't supported, try default
        try {
          const recorder = new MediaRecorder(videoStream)
          mediaRecorderRef.current = recorder
          recordedChunksRef.current = []
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              recordedChunksRef.current.push(e.data)
            }
          }
          recorder.start(1000)
        } catch {
          console.warn("MediaRecorder not supported — recording disabled")
        }
      }

      // Set up AudioContext for mic capture at 24kHz (for OpenAI)
      const audioCtx = new AudioContext({ sampleRate: 24000 })
      audioCtxRef.current = audioCtx

      // Load AudioWorklet for PCM16 conversion
      const workletCode = `
        class PCM16Processor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0]
            if (input.length > 0) {
              const float32 = input[0]
              const int16 = new Int16Array(float32.length)
              for (let i = 0; i < float32.length; i++) {
                const s = Math.max(-1, Math.min(1, float32[i]))
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
              }
              this.port.postMessage(int16.buffer, [int16.buffer])
            }
            return true
          }
        }
        registerProcessor("pcm16-processor", PCM16Processor)
      `
      const blob = new Blob([workletCode], { type: "application/javascript" })
      const url = URL.createObjectURL(blob)
      await audioCtx.audioWorklet.addModule(url)
      URL.revokeObjectURL(url)

      const sourceNode = audioCtx.createMediaStreamSource(videoStream)
      sourceNodeRef.current = sourceNode

      const workletNode = new AudioWorkletNode(audioCtx, "pcm16-processor")
      workletRef.current = workletNode

      sourceNode.connect(workletNode)
      workletNode.connect(audioCtx.destination) // required for processing

      // Connect WebSocket
      const wsUrl = api.getPitchWSUrl(session.id, token)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setConnecting(false)

        // Send mic audio via worklet
        workletNode.port.onmessage = (e: MessageEvent) => {
          if (ws.readyState !== WebSocket.OPEN || muted) return
          const pcm16Buffer = e.data as ArrayBuffer
          const base64 = arrayBufferToBase64(pcm16Buffer)
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64,
          }))
        }
      }

      ws.onmessage = (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data)
          handleRealtimeEvent(event)
        } catch {
          // ignore non-JSON messages
        }
      }

      ws.onerror = () => {
        setError("WebSocket connection error. Check that OPENAI_API_KEY is set on the server.")
        setConnecting(false)
      }

      ws.onclose = () => {
        setConnected(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect"
      setError(msg)
      setConnecting(false)
    }
  }, [getToken, session.id, muted, playAudio])

  // Handle OpenAI Realtime events
  const handleRealtimeEvent = useCallback((event: Record<string, unknown>) => {
    switch (event.type) {
      case "response.audio.delta":
        // AI audio chunk — play it
        if (event.delta && typeof event.delta === "string") {
          playAudio(event.delta)
          setAiSpeaking(true)
        }
        break

      case "response.audio.done":
        setAiSpeaking(false)
        // Reset queue so next response starts immediately
        nextPlayTimeRef.current = 0
        break

      case "response.audio_transcript.done":
        // AI finished speaking — add to transcript
        if (event.transcript && typeof event.transcript === "string") {
          setTranscript((prev) => [...prev, { speaker: "ai", text: event.transcript as string }])
        }
        break

      case "conversation.item.input_audio_transcription.completed":
        // User finished speaking — add to transcript
        if (event.transcript && typeof event.transcript === "string") {
          setTranscript((prev) => [...prev, { speaker: "user", text: event.transcript as string }])
        }
        break

      case "error":
        console.error("Realtime API error:", event)
        break
    }
  }, [playAudio])

  // Connect on mount
  useEffect(() => {
    connect()
    return () => {
      // Cleanup
      wsRef.current?.close()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current?.close()
      playbackCtxRef.current?.close()
      mediaRecorderRef.current?.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = async () => {
    setEnding(true)
    wsRef.current?.close()

    // Stop MediaRecorder and collect the recording blob
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
        recorder.stop()
      })
    }

    // Stop all media tracks
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    playbackCtxRef.current?.close()

    // Trigger feedback pipeline
    await onEnd()

    // Upload the recording in the background
    if (recordedChunksRef.current.length > 0) {
      setUploading(true)
      setUploadProgress("Preparing recording...")
      const recordingBlob = new Blob(recordedChunksRef.current, { type: "video/webm" })
      const sizeMB = (recordingBlob.size / (1024 * 1024)).toFixed(1)
      setUploadProgress(`Uploading ${sizeMB} MB...`)

      try {
        const token = (await getToken()) ?? undefined
        await api.uploadPitchRecording(session.id, recordingBlob, token)
        setUploadProgress("Upload complete!")
      } catch (err) {
        console.error("Failed to upload recording:", err)
        setUploadProgress("Upload failed — feedback still available")
      }
      // Don't wait for upload to complete — review page will show regardless
    }
  }

  const toggleMute = () => {
    setMuted((m) => !m)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = muted // toggle: if currently muted, enable
      })
    }
  }

  const persona = PERSONA_META[session.persona]

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Session Error</h1>
        <div className="plaid-card border-destructive/50">
          <p className="text-sm text-destructive">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to sessions
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${persona.bgColor} flex items-center justify-center text-lg`}>
            {persona.icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{persona.label}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {connecting ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Connecting...
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-brand-green animate-pulse" : "bg-red-500"}`} />
                    {connected ? "Live" : "Disconnected"}
                  </span>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="tabular-nums">{formatTime(elapsed)}</span>
                  {cameraEnabled && (
                    <>
                      <span className="text-muted-foreground/50">|</span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Recording
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Speaking Indicator */}
        {aiSpeaking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-brand-green rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            AI is speaking...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Self-preview (webcam pip) */}
        {cameraEnabled && (
          <div className="lg:col-span-1">
            <div className="plaid-card p-2 aspect-video relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-md transform -scale-x-100"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                REC
              </div>
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className={`${cameraEnabled ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="plaid-card h-[350px] overflow-y-auto">
            {transcript.length === 0 && connected && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Waiting for your conversation partner to start...
              </p>
            )}
            {transcript.length === 0 && connecting && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            )}
            <div className="space-y-3">
              {transcript.map((entry, i) => (
                <div key={i} className={`flex gap-3 ${entry.speaker === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      entry.speaker === "user"
                        ? "bg-foreground text-background"
                        : `${persona.bgColor} ${persona.textColor}`
                    }`}
                  >
                    {entry.speaker === "user" ? "You" : "AI"}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      entry.speaker === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {entry.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Upload progress (shown after ending) */}
      {uploading && (
        <div className="plaid-card flex items-center gap-3">
          <Upload className="w-4 h-4 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground">{uploadProgress}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-colors ${
            muted
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={handleEnd}
          disabled={ending}
          className="px-6 py-3 rounded-full bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
          {ending ? "Ending..." : "End Call"}
        </button>
      </div>
    </div>
  )
}

// Helper: ArrayBuffer → base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
