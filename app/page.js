'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [dateTimeResponse, setDateTimeResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [telegramMessage, setTelegramMessage] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramResponse, setTelegramResponse] = useState("")
  const [sendingTelegram, setSendingTelegram] = useState(false)

  const fetchDateTime = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/datetime')
      
      if (response.status === 401) {
        setDateTimeResponse("Error: You must be logged in to access this endpoint")
      } else if (response.ok) {
        const text = await response.text()
        setDateTimeResponse(text)
      } else {
        setDateTimeResponse("Error: Failed to fetch date and time")
      }
    } catch (error) {
      setDateTimeResponse("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendTelegramMessage = async (e) => {
    e.preventDefault()
    setSendingTelegram(true)
    setTelegramResponse("")
    
    try {
      const response = await fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: telegramMessage,
          chatId: telegramChatId,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        setTelegramResponse("Error: You must be logged in to send messages")
      } else if (response.ok) {
        setTelegramResponse("Success: " + data.message)
        setTelegramMessage("")
        setTelegramChatId("")
      } else {
        setTelegramResponse("Error: " + (data.error || "Failed to send message"))
      }
    } catch (error) {
      setTelegramResponse("Error: " + error.message)
    } finally {
      setSendingTelegram(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Google Authentication Demo</h1>
      
      {status === "loading" && <p>Loading...</p>}
      
      {status === "authenticated" && (
        <div>
          <p>Signed in as {session.user.email}</p>
          <button onClick={() => signOut()} style={{ marginRight: '10px', padding: '10px 20px' }}>
            Sign out
          </button>
          <button 
            onClick={fetchDateTime} 
            disabled={loading}
            style={{ padding: '10px 20px' }}
          >
            {loading ? 'Loading...' : 'Get Current Date & Time'}
          </button>
          {dateTimeResponse && (
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
              <strong>Response:</strong> {dateTimeResponse}
            </div>
          )}

          {/* Telegram Message Form */}
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
            <h2>Send Message to Telegram Bot</h2>
            <form onSubmit={sendTelegramMessage}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="chatId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Chat ID:
                </label>
                <input
                  id="chatId"
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Enter Telegram Chat ID"
                  required
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Message:
                </label>
                <textarea
                  id="message"
                  value={telegramMessage}
                  onChange={(e) => setTelegramMessage(e.target.value)}
                  placeholder="Enter your message"
                  required
                  rows="4"
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <button 
                type="submit"
                disabled={sendingTelegram}
                style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: sendingTelegram ? 'not-allowed' : 'pointer' }}
              >
                {sendingTelegram ? 'Sending...' : 'Send Message'}
              </button>
            </form>
            {telegramResponse && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: telegramResponse.startsWith('Success') ? '#c8e6c9' : '#ffcdd2', borderRadius: '5px' }}>
                <strong>{telegramResponse}</strong>
              </div>
            )}
          </div>
        </div>
      )}
      
      {status === "unauthenticated" && (
        <div>
          <p>You are not signed in</p>
          <button onClick={() => signIn('google')} style={{ padding: '10px 20px' }}>
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  )
}
