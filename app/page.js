'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [dateTimeResponse, setDateTimeResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [telegramMessage, setTelegramMessage] = useState("")
  const [telegramResponse, setTelegramResponse] = useState("")
  const [telegramLoading, setTelegramLoading] = useState(false)

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
    setTelegramLoading(true)
    setTelegramResponse("")
    
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: telegramMessage }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTelegramResponse(data.message)
        setTelegramMessage("") // Clear the form on success
      } else {
        setTelegramResponse("Error: " + (data.error || "Failed to send message"))
      }
    } catch (error) {
      setTelegramResponse("Error: " + error.message)
    } finally {
      setTelegramLoading(false)
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

          <div style={{ marginTop: '40px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            <h2>Send Message to Telegram Bot</h2>
            <form onSubmit={sendTelegramMessage} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <textarea
                  value={telegramMessage}
                  onChange={(e) => setTelegramMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows="4"
                  style={{ 
                    width: '100%', 
                    maxWidth: '500px',
                    padding: '10px', 
                    fontSize: '14px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={telegramLoading || !telegramMessage.trim()}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#0088cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (telegramLoading || !telegramMessage.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (telegramLoading || !telegramMessage.trim()) ? 0.6 : 1
                }}
              >
                {telegramLoading ? 'Sending...' : 'Send to Telegram'}
              </button>
            </form>
            {telegramResponse && (() => {
              const isError = telegramResponse.includes('Error')
              return (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '10px', 
                  backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', 
                  borderRadius: '5px',
                  color: isError ? '#cc0000' : '#006600'
                }}>
                  <strong>{isError ? '❌' : '✅'}</strong> {telegramResponse}
                </div>
              )
            })()}
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
