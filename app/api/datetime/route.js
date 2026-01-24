import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET(request) {
  const session = await getServerSession()
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const currentDateTime = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long'
  })

  return new NextResponse(currentDateTime, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
