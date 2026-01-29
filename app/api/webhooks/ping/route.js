import { NextResponse } from "next/server"

function getBearerToken(authHeader) {
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(" ")
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null
  return token.trim()
}

export async function GET(request) {
  const expectedToken = process.env.WEBHOOK_BEARER_TOKEN

  if (!expectedToken) {
    return NextResponse.json(
      { error: "Server misconfigured: WEBHOOK_BEARER_TOKEN is not set" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const token = getBearerToken(authHeader)

  if (!token || token !== expectedToken) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return NextResponse.json(
      { error: "Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables." },
      { status: 500 }
    )
  }

  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Ping!",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.description || "Failed to send message to Telegram" },
        { status: response.status }
      )
    }

    return NextResponse.json({ ok: true, message: "Ping!" }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to send message to Telegram" },
      { status: 500 }
    )
  }
}
