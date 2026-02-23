#!/usr/bin/env node

/**
 * generate-api-reference.mjs
 *
 * Reads api/openapi.yaml, resolves all $ref pointers, and outputs:
 *   - web/src/lib/developers/generated/api-reference.json
 *   - web/src/lib/developers/generated/search-index.json
 *
 * Usage:  node scripts/generate-api-reference.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs"
import { join, dirname, resolve, extname } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "module"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, "..")

// Resolve yaml from web/node_modules
const require = createRequire(join(ROOT, "web", "package.json"))
const YAML = require("yaml")

// ── Paths ────────────────────────────────────────────────────────────────────
const OPENAPI_PATH = join(ROOT, "api", "openapi.yaml")
const DOCS_API_DIR = join(ROOT, "docs", "api")
const OUT_DIR = join(ROOT, "web", "src", "lib", "developers", "generated")

// ── Tag slug mapping ─────────────────────────────────────────────────────────
const TAG_TO_SLUG = {
  "Auth": "auth",
  "Families": "families",
  "Family Members": "members",
  "Children": "children",
  "Policies": "policies",
  "Policy Rules": "rules",
  "Rules": "rules",
  "Enforcement": "enforcement",
  "Platforms": "platforms",
  "Compliance": "compliance",
  "Webhooks": "webhooks",
  "Quick Setup": "setup",
  "Ratings": "ratings",
  "Standards": "standards",
  "Devices": "devices",
  "Apple Device Sync": "devices",
  "Device Sync": "device-sync",
  "Connections": "connections",
  "Sync": "sync",
  "Reports": "reports",
  "Feedback": "feedback",
  "Sources": "sources",
}

// ── Parse YAML ───────────────────────────────────────────────────────────────
const raw = readFileSync(OPENAPI_PATH, "utf-8")
const doc = YAML.parse(raw)

// ── $ref resolution ──────────────────────────────────────────────────────────

/**
 * Resolve a JSON pointer like "#/components/schemas/User" against the root doc.
 * Keeps a visited set per resolution chain to avoid infinite recursion on
 * circular $ref definitions.
 */
function resolveRef(ref, root, visited = new Set()) {
  if (visited.has(ref)) {
    // Circular reference -- return empty object to avoid infinite loop
    return {}
  }
  visited.add(ref)

  const parts = ref.replace(/^#\//, "").split("/")
  let node = root
  for (const p of parts) {
    if (node == null) return {}
    node = node[p]
  }
  if (node && node.$ref) {
    return resolveRef(node.$ref, root, visited)
  }
  return node ?? {}
}

/**
 * Deep-walk an object tree and replace every { $ref: "..." } with the
 * resolved content.  Handles nested and indirect references.
 */
function deref(obj, root, visited = new Set()) {
  if (obj == null || typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map((item) => deref(item, root, new Set()))

  if (obj.$ref) {
    const refKey = obj.$ref
    if (visited.has(refKey)) return {}
    const resolved = resolveRef(refKey, root, new Set(visited))
    return deref(resolved, root, new Set(visited))
  }

  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k] = deref(v, root, new Set(visited))
  }
  return out
}

// ── Schema → flat field list ─────────────────────────────────────────────────

function schemaToFields(schema, requiredFields = []) {
  if (!schema) return []

  // Resolve allOf/oneOf/anyOf
  if (schema.allOf) {
    const merged = schema.allOf.reduce((acc, s) => {
      const resolved = deref(s, doc)
      return {
        ...acc,
        properties: { ...acc.properties, ...resolved.properties },
        required: [...(acc.required || []), ...(resolved.required || [])],
      }
    }, { properties: {}, required: [] })
    return schemaToFields(merged, merged.required || [])
  }

  if (schema.oneOf || schema.anyOf) {
    const variants = schema.oneOf || schema.anyOf
    // Use the first variant as representative
    if (variants.length > 0) {
      const first = deref(variants[0], doc)
      return schemaToFields(first, first.required || [])
    }
    return []
  }

  const props = schema.properties
  if (!props) {
    // Array of items
    if (schema.type === "array" && schema.items) {
      const resolved = deref(schema.items, doc)
      return schemaToFields(resolved, resolved.required || [])
    }
    return []
  }

  const required = new Set(schema.required || requiredFields || [])

  return Object.entries(props).map(([name, prop]) => {
    const resolved = deref(prop, doc)
    const field = {
      name,
      type: formatType(resolved),
      required: required.has(name),
      description: resolved.description || "",
    }

    // Recurse into nested objects
    if (resolved.type === "object" && resolved.properties) {
      field.children = schemaToFields(resolved, resolved.required || [])
    }
    // Recurse into array items that are objects
    if (resolved.type === "array" && resolved.items) {
      const items = deref(resolved.items, doc)
      if (items.type === "object" && items.properties) {
        field.children = schemaToFields(items, items.required || [])
      }
    }

    return field
  })
}

function formatType(schema) {
  if (!schema) return "any"
  if (schema.enum) return schema.enum.join(" | ")
  if (schema.type === "array") {
    const items = schema.items ? deref(schema.items, doc) : null
    const inner = items ? formatType(items) : "any"
    return `${inner}[]`
  }
  if (schema.format) {
    if (schema.format === "uuid") return "uuid"
    if (schema.format === "email") return "email"
    if (schema.format === "date-time") return "datetime"
    if (schema.format === "date") return "date"
    return schema.type
  }
  if (schema.type === "object" && schema.additionalProperties) {
    return "object"
  }
  return schema.type || "any"
}

// ── Example generation ───────────────────────────────────────────────────────

function schemaToExample(schema, depth = 0) {
  if (!schema || depth > 5) return null
  const resolved = deref(schema, doc)

  if (resolved.example !== undefined) return resolved.example

  if (resolved.allOf) {
    return resolved.allOf.reduce((acc, s) => {
      const ex = schemaToExample(deref(s, doc), depth + 1)
      return typeof ex === "object" && ex !== null ? { ...acc, ...ex } : acc
    }, {})
  }

  if (resolved.oneOf || resolved.anyOf) {
    const variants = resolved.oneOf || resolved.anyOf
    if (variants.length > 0) return schemaToExample(deref(variants[0], doc), depth + 1)
    return {}
  }

  if (resolved.type === "object") {
    if (resolved.properties) {
      const obj = {}
      for (const [k, v] of Object.entries(resolved.properties)) {
        obj[k] = schemaToExample(deref(v, doc), depth + 1)
      }
      return obj
    }
    if (resolved.additionalProperties) {
      return {}
    }
    return {}
  }

  if (resolved.type === "array") {
    if (resolved.items) {
      const item = schemaToExample(deref(resolved.items, doc), depth + 1)
      return item != null ? [item] : []
    }
    return []
  }

  if (resolved.enum) return resolved.enum[0]

  switch (resolved.type) {
    case "string":
      if (resolved.format === "uuid") return "550e8400-e29b-41d4-a716-446655440000"
      if (resolved.format === "email") return "user@example.com"
      if (resolved.format === "date-time") return "2025-01-15T09:30:00Z"
      if (resolved.format === "date") return "2018-06-15"
      return "string"
    case "integer":
      return 0
    case "number":
      return 0.0
    case "boolean":
      return true
    default:
      return null
  }
}

// ── Curl example generation ──────────────────────────────────────────────────

function buildCurlExample(method, path, baseUrl, requestBodySchema, auth) {
  const url = `${baseUrl}${path}`
  let curl = `curl -X ${method.toUpperCase()} "${url}"`

  if (auth !== "none") {
    curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`
  }

  if (requestBodySchema && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    curl += ` \\\n  -H "Content-Type: application/json"`
    const example = schemaToExample(requestBodySchema)
    if (example && Object.keys(example).length > 0) {
      const body = JSON.stringify(example, null, 2)
      curl += ` \\\n  -d '${body}'`
    }
  }

  return curl
}

// ── Determine auth type ──────────────────────────────────────────────────────

function getAuth(operation, globalSecurity) {
  // If security is explicitly set to [] (empty), it's public
  if (operation.security && Array.isArray(operation.security) && operation.security.length === 0) {
    return "none"
  }
  // If operation has its own security, use first scheme
  if (operation.security && operation.security.length > 0) {
    const first = operation.security[0]
    const scheme = Object.keys(first)[0]
    if (scheme === "DeviceKeyAuth") return "X-Device-Key"
    return "Bearer"
  }
  // Fall back to global security
  if (globalSecurity && globalSecurity.length > 0) {
    return "Bearer"
  }
  return "none"
}

// ── Extract operation slug ───────────────────────────────────────────────────

function operationSlug(operationId) {
  if (!operationId) return "unknown"
  // Handle dot-separated names like "auth.register"
  const parts = operationId.split(".")
  return parts[parts.length - 1]
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
}

function makeSlug(tag, opId, method, path) {
  const tagSlug = TAG_TO_SLUG[tag] || tag.toLowerCase().replace(/\s+/g, "-")
  const opSlug = opId
    ? operationSlug(opId)
    : `${method.toLowerCase()}-${path.replace(/[{}\/]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}`
  return `${tagSlug}/${opSlug}`
}

// ── Auto-generate operationId when missing ───────────────────────────────────

function autoOperationId(method, path) {
  const verb = method.toLowerCase()
  const slug = path
    .replace(/\{[^}]+\}/g, "")
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/-+/g, "-")
    .replace(/-$/, "")
  return `${verb}-${slug}`
}

// ── Main processing ──────────────────────────────────────────────────────────

const baseUrl = doc.servers?.[0]?.url || "https://api.phosra.com/api/v1"
const globalSecurity = doc.security || []

const endpoints = []
const tagSet = new Map()

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"]

for (const [path, pathItem] of Object.entries(doc.paths || {})) {
  // Path-level parameters
  const pathParams = (pathItem.parameters || []).map((p) => deref(p, doc))

  for (const method of HTTP_METHODS) {
    const operation = pathItem[method]
    if (!operation) continue

    const resolvedOp = deref(operation, doc)
    const tag = resolvedOp.tags?.[0] || "Other"
    const opId = resolvedOp.operationId || autoOperationId(method, path)
    const summary = resolvedOp.summary || ""
    const description = resolvedOp.description || ""
    const auth = getAuth(resolvedOp, globalSecurity)

    // Track tags
    if (!tagSet.has(tag)) {
      tagSet.set(tag, resolvedOp.externalDocs?.description || "")
    }

    // Parameters (merge path-level + operation-level)
    const opParams = (resolvedOp.parameters || []).map((p) => deref(p, doc))
    const allParams = [...pathParams, ...opParams]
    const parameters = allParams.map((p) => ({
      name: p.name || "",
      in: p.in || "query",
      required: p.required ?? false,
      description: p.description || "",
      type: p.schema ? formatType(deref(p.schema, doc)) : "string",
    }))

    // Request body
    let requestBody = undefined
    if (resolvedOp.requestBody) {
      const rb = deref(resolvedOp.requestBody, doc)
      const content = rb.content?.["application/json"]
      if (content?.schema) {
        const schema = deref(content.schema, doc)
        requestBody = {
          required: rb.required ?? false,
          fields: schemaToFields(schema, schema.required || []),
        }
      }
    }

    // Responses
    const responses = {}
    for (const [code, resp] of Object.entries(resolvedOp.responses || {})) {
      const resolvedResp = deref(resp, doc)
      const respContent = resolvedResp.content?.["application/json"]
      const entry = { description: resolvedResp.description || "" }
      if (respContent?.schema) {
        const schema = deref(respContent.schema, doc)
        entry.fields = schemaToFields(schema, schema.required || [])
      }
      responses[code] = entry
    }

    // Curl example
    const rbSchema = resolvedOp.requestBody
      ? deref(resolvedOp.requestBody, doc).content?.["application/json"]?.schema
        ? deref(deref(resolvedOp.requestBody, doc).content["application/json"].schema, doc)
        : null
      : null
    const curlExample = buildCurlExample(method, path, baseUrl, rbSchema, auth)

    // Response example (use first successful response)
    let responseExample = ""
    const successCode = Object.keys(responses).find((c) => c.startsWith("2") && c !== "204" && c !== "304")
    if (successCode) {
      const successResp = resolvedOp.responses[successCode]
      const resolved = deref(successResp, doc)
      const schema = resolved.content?.["application/json"]?.schema
      if (schema) {
        const example = schemaToExample(deref(schema, doc))
        if (example != null) {
          responseExample = JSON.stringify(example, null, 2)
        }
      }
    }

    const slug = makeSlug(tag, opId, method, path)

    endpoints.push({
      operationId: opId,
      method: method.toUpperCase(),
      path,
      tag,
      summary,
      description,
      parameters,
      requestBody,
      responses,
      curlExample,
      responseExample,
      auth,
      slug,
    })
  }
}

// Build tags list
const tags = Array.from(tagSet.entries()).map(([name, description]) => ({
  name,
  description,
}))

// ── Search index ─────────────────────────────────────────────────────────────

const searchIndex = []

// 1. MDX pages from docs/api/
function walkDir(dir) {
  if (!existsSync(dir)) return []
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...walkDir(full))
    } else if (extname(full) === ".mdx") {
      files.push(full)
    }
  }
  return files
}

const mdxFiles = walkDir(DOCS_API_DIR)
for (const file of mdxFiles) {
  const content = readFileSync(file, "utf-8")
  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) continue
  const fm = YAML.parse(fmMatch[1])
  const title = fm.title || ""
  const description = fm.description || ""

  // Build href from file path relative to docs/api/
  const rel = file.slice(DOCS_API_DIR.length).replace(/\.mdx$/, "").replace(/\/index$/, "")
  const href = `/developers/docs${rel}`

  // Determine section from subdirectory
  const parts = rel.split("/").filter(Boolean)
  const section = parts.length > 1 ? parts[0] : "Getting Started"

  searchIndex.push({
    title,
    href,
    section: section.charAt(0).toUpperCase() + section.slice(1),
    excerpt: description,
  })
}

// 2. API endpoints
for (const ep of endpoints) {
  searchIndex.push({
    title: `${ep.method} ${ep.path}`,
    href: `/developers/docs/api-reference/${ep.slug}`,
    section: ep.tag,
    excerpt: ep.summary || ep.description,
    method: ep.method,
  })
}

// ── Write output ─────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true })

const apiRefPath = join(OUT_DIR, "api-reference.json")
writeFileSync(apiRefPath, JSON.stringify({ endpoints, tags }, null, 2))

const searchPath = join(OUT_DIR, "search-index.json")
writeFileSync(searchPath, JSON.stringify(searchIndex, null, 2))

console.log(`Generated ${endpoints.length} endpoints across ${tags.length} tags`)
console.log(`Search index: ${searchIndex.length} entries (${mdxFiles.length} MDX + ${endpoints.length} endpoints)`)
console.log(`  -> ${apiRefPath}`)
console.log(`  -> ${searchPath}`)
