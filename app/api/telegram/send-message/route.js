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
    // Disable polling since this is a webhook-based API endpoint
    const bot = new TelegramBot(botToken, { polling: false })
    
    // Send message using the official SDK
    const result = await bot.sendMessage(chatId, message)

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      data: result
    })
  } catch (error) {
    // Handle different types of errors from Telegram API
    let statusCode = 500
    let errorMessage = error.message || "Failed to send message"
    
    // Map common Telegram errors to appropriate status codes
    if (error.message?.includes('chat not found') || error.message?.includes('CHAT_ID_INVALID')) {
      statusCode = 400
      errorMessage = "Invalid chat ID. Please check the chat ID and try again."
    } else if (error.message?.includes('Unauthorized') || error.message?.includes('EAUTH')) {
      statusCode = 401
      errorMessage = "Invalid bot token configuration."
    } else if (error.message?.includes('bot was blocked')) {
      statusCode = 403
      errorMessage = "Bot was blocked by the user. Please unblock the bot and try again."
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
