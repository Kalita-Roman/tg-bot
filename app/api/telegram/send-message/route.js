import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"
import TelegramBot from "node-telegram-bot-api"

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

    // Initialize Telegram Bot with the official SDK
    const bot = new TelegramBot(botToken)
    
    // Send message using the official SDK
    const result = await bot.sendMessage(chatId, message)

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      data: result
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    )
  }
}
