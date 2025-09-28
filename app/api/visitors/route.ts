export async function GET(req: Request) {
  const baseUrl = process.env.VISITORS_API_URL || "http://localhost:8000"
  const token = process.env.VISITORS_API_TOKEN

  if (!token) {
    return Response.json({ error: "Missing VISITORS_API_TOKEN. Please set it in Project Settings." }, { status: 500 })
  }

  const incomingUrl = new URL(req.url)
  const proxyUrl = `${baseUrl.replace(/\/$/, "")}/api/visitor${incomingUrl.search}`

  try {
    const res = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // ensure fresh data
      cache: "no-store",
    })

    // propagate backend errors with message
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return new Response(text || JSON.stringify({ error: "Upstream error" }), {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
      })
    }

    // pass through JSON
    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: "Failed to fetch visitors from upstream API" }, { status: 502 })
  }
}

export async function POST(req: Request) {
  const baseUrl = process.env.VISITORS_API_URL || "http://localhost:8000"
  const token = process.env.VISITORS_API_TOKEN
  const url = `${baseUrl.replace(/\/$/, "")}/api/visitor`

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const contentType = upstream.headers.get("Content-Type") || "application/json"
    const text = await upstream.text()

    if (!upstream.ok) {
      return new Response(text || JSON.stringify({ error: "Upstream error" }), {
        status: upstream.status,
        headers: { "Content-Type": contentType },
      })
    }

    return new Response(text, { status: upstream.status, headers: { "Content-Type": contentType } })
  } catch (err) {
    return Response.json({ error: "Failed to register visitor with upstream API" }, { status: 502 })
  }
}
