'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [apiResponse, setApiResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchDateTime = async () => {
    setLoading(true)
    setApiResponse("")
    
    try {
      const response = await fetch("/api/datetime")
      const data = await response.json()
      
      if (response.ok) {
        setApiResponse(data.message)
      } else {
        setApiResponse(`Error: ${data.error || 'Failed to fetch'}`)
      }
    } catch (error) {
      setApiResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div style={{ padding: "20px" }}>Loading...</div>
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mindful Chat</h1>
      
      {!session ? (
        <div>
          <p>Please sign in with Google to access the API.</p>
          <button 
            onClick={() => signIn("google")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div>
          <p>Welcome, {session.user.name}!</p>
          <p>Email: {session.user.email}</p>
          
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={fetchDateTime}
              disabled={loading}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#34a853",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                marginRight: "10px"
              }}
            >
              {loading ? "Loading..." : "Get Current Date & Time"}
            </button>
            
            <button
              onClick={() => signOut()}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#ea4335",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Sign out
            </button>
          </div>

          {apiResponse && (
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}>
              <strong>API Response:</strong>
              <p>{apiResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
