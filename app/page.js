'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [dateTimeResponse, setDateTimeResponse] = useState("")
  const [loading, setLoading] = useState(false)

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
