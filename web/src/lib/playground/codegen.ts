import type { HttpCapture } from "./types"

export function toCurl(req: HttpCapture): string {
  const parts = [`curl -X ${req.method} '${req.url}'`]
  for (const [k, v] of Object.entries(req.headers)) {
    if (k.toLowerCase() === "authorization") {
      parts.push(`  -H '${k}: Bearer $PHOSRA_TOKEN'`)
    } else {
      parts.push(`  -H '${k}: ${v}'`)
    }
  }
  if (req.body) {
    parts.push(`  -d '${JSON.stringify(req.body, null, 2)}'`)
  }
  return parts.join(" \\\n")
}

export function toJavaScript(req: HttpCapture): string {
  const opts: string[] = [`  method: "${req.method}"`]
  opts.push(`  headers: {\n    "Authorization": "Bearer " + token,\n    "Content-Type": "application/json"\n  }`)
  if (req.body) {
    opts.push(`  body: JSON.stringify(${JSON.stringify(req.body, null, 4)})`)
  }
  return `const response = await fetch("${req.url}", {\n${opts.join(",\n")}\n})\nconst data = await response.json()`
}

export function toGo(req: HttpCapture): string {
  const lines: string[] = []
  if (req.body) {
    lines.push(`body, _ := json.Marshal(${goLiteral(req.body)})`)
    lines.push(`req, _ := http.NewRequest("${req.method}", "${req.url}", bytes.NewReader(body))`)
  } else {
    lines.push(`req, _ := http.NewRequest("${req.method}", "${req.url}", nil)`)
  }
  lines.push(`req.Header.Set("Authorization", "Bearer "+token)`)
  lines.push(`req.Header.Set("Content-Type", "application/json")`)
  lines.push(`resp, _ := http.DefaultClient.Do(req)`)
  lines.push(`defer resp.Body.Close()`)
  return lines.join("\n")
}

function goLiteral(v: unknown): string {
  return `map[string]interface{}` + JSON.stringify(v)
    .replace(/"/g, `"`)
    .replace(/:/g, ": ")
    .replace(/,/g, ", ")
}
