import ClientSessionProvider from "./SessionProvider"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  )
}
