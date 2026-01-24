import ClientSessionProvider from "./SessionProvider"

export const metadata = {
  title: 'Google Authentication Demo',
  description: 'Demo application with Google OAuth authentication',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  )
}
