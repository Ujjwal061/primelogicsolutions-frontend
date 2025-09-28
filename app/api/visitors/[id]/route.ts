import type { NextRequest } from "next/server"

const API_BASE = process.env.VISITORS_API_URL || "http://localhost:8000"
const API_TOKEN = process.env.VISITORS_API_TOKEN

function authHeaders() {
  return API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const auth = authHeaders()
    if (auth.Authorization) {
      headers["Authorization"] = auth.Authorization
    }
    const upstream = await fetch(`${API_BASE}/api/visitor/${params.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
    const data = await upstream.json().catch(() => ({}))
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        message: "Failed to update visitor",
        error: err?.message || "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const upstream = await fetch(`${API_BASE}/api/visitor/${params.id}`, {
      method: "DELETE",
      headers: Object.fromEntries(Object.entries(authHeaders()).filter(([_, v]) => v !== undefined)),
    })
    const data = await upstream.json().catch(() => ({}))
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        message: "Failed to delete visitor",
        error: err?.message || "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
