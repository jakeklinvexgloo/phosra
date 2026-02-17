import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { LangfuseSpanProcessor } from "@langfuse/otel"

// Only export AI/LLM spans to Langfuse — filter out Next.js internal spans
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan: (span) =>
    span.otelSpan.instrumentationScope.name !== "next.js",
})

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor],
})

tracerProvider.register()
