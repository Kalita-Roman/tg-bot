import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  if (!botToken) {
    return NextResponse.json(
      { error: "Telegram bot token not configured" },
      { status: 500 }
    )
  }

  try {
    const { message, chatId } = await request.json()
    
    if (!message || !chatId) {
      return NextResponse.json(
        { error: "Message and chatId are required" },
        { status: 400 }
      )
    }

    // Send message to Telegram bot using Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.description || "Failed to send message to Telegram" },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      data 
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    )
  }
}
