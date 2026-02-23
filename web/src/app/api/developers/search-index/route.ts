import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), "src", "lib", "developers", "generated", "search-index.json")
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json([])
    }
    const data = JSON.parse(fs.readFileSync(indexPath, "utf-8"))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
