export interface ApiParameter {
  name: string
  in: "path" | "query" | "header"
  required: boolean
  description: string
  type: string
}

export interface ApiField {
  name: string
  type: string
  required: boolean
  description: string
  children?: ApiField[]
}

export interface ApiEndpoint {
  operationId: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  tag: string
  summary: string
  description: string
  parameters: ApiParameter[]
  requestBody?: {
    required: boolean
    fields: ApiField[]
  }
  responses: {
    [statusCode: string]: {
      description: string
      fields?: ApiField[]
    }
  }
  curlExample: string
  responseExample: string
  auth: string
  slug: string
}

export interface ApiReferenceData {
  endpoints: ApiEndpoint[]
  tags: { name: string; description: string }[]
}

export interface SearchIndexEntry {
  title: string
  href: string
  section: string
  excerpt: string
  method?: string
}
